import { Box, Drawer, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGeminiGenerationMutation,
  useUpdatePromptApprovalStatusMutation,
} from "shell/services/mcp";
import { useGetUsersRolesQuery } from "shell/services/accounts";
import { GeminiResponse } from "shell/services/types";
import { AppState } from "shell/store/types";
import {
  ChatResponse,
  ChatThread,
  TONE_VALUES,
} from "shell/components/AIDrawer/ChatThread";
import { toChatResponses } from "shell/components/AIDrawer/parseResponse";
import {
  buildPromptRequest,
  buildSuggestionsRequest,
} from "shell/components/AIDrawer/promptRequest";
import { useApplySetValue } from "shell/components/AIDrawer/useApplySetValue";
import { getRefRegistry } from "../../../engine/refRegistry";
import { countLineChanges } from "../../../utility/countLineChanges";

type StudioAIPanelProps = {
  onClose: () => void;
  pageModelZUID: string;
  pageItemZUID: string;
  drawerWidth: number;
  // The last staged AI change dropped without a save, and whose page it was.
  lastDiscard: { id: number; pageItemZUID: string } | null;
};

type StudioChat = {
  responses: Record<string, ChatResponse[]>;
  // The server session the first turn created, reused by every later turn.
  chatZUID?: string;
  // The discard this transcript already notes.
  noticeId?: number;
  // Bumped by Clear: a reply to a turn sent before it is dropped.
  clears: number;
  // How the open panel adds to this transcript; unset while it is closed.
  append?: (turnZUID: string, entries: ChatResponse[]) => void;
};

// Every page shares the /studio pathname, so transcripts are keyed by page
// item, and kept in memory only: a staged change does not survive a reload,
// so its summaries must not. The server logs each turn too, but that session
// is never restored here, since it would show edits that were discarded.
const studioChats = new Map<string, StudioChat>();
let turnSeq = 0;

// Adds to a page's transcript whether or not its panel is open now.
const appendToChat = (
  chat: StudioChat,
  turnZUID: string,
  entries: ChatResponse[]
) => {
  if (chat.append) {
    chat.append(turnZUID, entries);
    return;
  }
  chat.responses = {
    ...chat.responses,
    [turnZUID]: [...(chat.responses[turnZUID] || []), ...entries],
  };
};

// Takes the inspector's column.
export const StudioAIPanel = ({
  onClose,
  pageModelZUID,
  pageItemZUID,
  drawerWidth,
  lastDiscard,
}: StudioAIPanelProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      data-cy="StudioAIPanel"
      variant="permanent"
      anchor="right"
      PaperProps={{
        sx: {
          overflow: "hidden",
          position: "relative",
          width: drawerWidth,
          boxSizing: "border-box",
          borderLeft: (theme) => `1px solid ${theme.palette.border}`,
          backgroundColor: (theme) => theme.palette.grey[50],
        },
      }}
    >
      <Box height="100%" display="flex" flexDirection="column">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          height={52}
          px={2}
          py={1.25}
          borderBottom={1}
          borderColor="divider"
        >
          <Typography variant="body2" fontWeight={500}>
            {t("shell.aiAssistantBeta")}
          </Typography>
          <IconButton
            data-cy="StudioAIPanelClose"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="medium" />
          </IconButton>
        </Box>
        <StudioAIChat
          key={pageItemZUID}
          pageModelZUID={pageModelZUID}
          pageItemZUID={pageItemZUID}
          discardId={
            lastDiscard?.pageItemZUID === pageItemZUID
              ? lastDiscard.id
              : undefined
          }
        />
      </Box>
    </Drawer>
  );
};

type StudioAIChatProps = {
  pageModelZUID: string;
  pageItemZUID: string;
  discardId?: number;
};

// One page's transcript. Every SET_VALUE is applied on arrival, and an
// applied `code-editor` edit shows as its line counts, not the whole file.
const StudioAIChat = ({
  pageModelZUID,
  pageItemZUID,
  discardId,
}: StudioAIChatProps) => {
  const { t } = useTranslation();
  const applySetValue = useApplySetValue();
  const user = useSelector((state: AppState) => state.user);
  const { data: roles } = useGetUsersRolesQuery();
  const roleZUID = roles?.find((role) => role.ZUID === user.ZUID)?.role?.ZUID;
  const [geminiGenerate, { isLoading }] = useGeminiGenerationMutation();
  // Never called: auto-apply hides Apply, its only caller, and a Studio turn
  // has no server prompt ZUID to approve.
  const [updatePromptApprovalStatus] = useUpdatePromptApprovalStatusMutation();

  // Fixed per mount: the panel remounts when the page changes.
  const [chat] = useState<StudioChat>(() => {
    const existing = studioChats.get(pageItemZUID);
    if (existing) return existing;
    // A discard from before the transcript existed is not its news.
    const created: StudioChat = {
      responses: {},
      noticeId: discardId,
      clears: 0,
    };
    studioChats.set(pageItemZUID, created);
    return created;
  });
  const [responses, setResponses] = useState(chat.responses);
  const [latestPromptZUIDs, setLatestPromptZUIDs] = useState<Set<string>>(
    new Set()
  );
  const [composerSeed, setComposerSeed] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState({
    label: "English (United States)",
    value: "en-US",
  });
  const [selectedTone, setSelectedTone] = useState<{
    label: string;
    value: string;
  }>({
    value: TONE_VALUES.professional,
    label: t("shell.toneNameProfessional"),
  });
  const responsesEndRef = useRef<HTMLDivElement | null>(null);
  // False once this panel closes or moves to another page. A reply that
  // lands after that is not applied to whatever is open now.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    chat.responses = responses;
    responsesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, responses]);

  // Read through `chat` so the effect stays idempotent when StrictMode runs
  // it twice.
  useEffect(() => {
    if (discardId === undefined || discardId === chat.noticeId) return;
    chat.noticeId = discardId;
    setResponses((prev) => ({
      ...prev,
      [`notice-${discardId}`]: [
        {
          type: "NOTICE",
          payload: { value: t("content.studioAiChangesDiscarded") },
        },
      ],
    }));
  }, [chat, discardId, t]);

  const appendToTurn = useCallback(
    (turnZUID: string, entries: ChatResponse[]) =>
      setResponses((prev) => ({
        ...prev,
        [turnZUID]: [...(prev[turnZUID] || []), ...entries],
      })),
    []
  );
  useEffect(() => {
    chat.append = appendToTurn;
    return () => {
      if (chat.append === appendToTurn) chat.append = undefined;
    };
  }, [chat, appendToTurn]);

  const handleReply = useCallback(
    (turnZUID: string, reply: GeminiResponse) => {
      if (reply.chatZuid) chat.chatZUID = reply.chatZuid;

      // No reply at all is a failure the user should see.
      const parsed: ChatResponse[] =
        reply.data == null
          ? [
              {
                type: "ERROR",
                payload: { value: t("shell.errorParsingAiResponse") },
              },
            ]
          : toChatResponses(reply.data);
      // A SYSTEM_OUTPUT is the edit's summary; line counts are the fallback.
      const hasDescription = parsed.some(
        (entry) =>
          entry.type === "SYSTEM_OUTPUT" && !!entry.payload.value?.trim()
      );
      const entries = parsed.flatMap((entry): ChatResponse[] => {
        if (entry.type !== "SET_VALUE") return [entry];
        const { refKey, value } = entry.payload;

        // Read before the action applies: the handle replaces the file.
        const codeEditor =
          refKey === "code-editor"
            ? getRefRegistry()["code-editor"]?.context?.()
            : null;
        if (!applySetValue(refKey, value) || !codeEditor) return [entry];
        if (!value.trim() || hasDescription) return [];

        return [
          {
            type: "CODE_EDIT",
            payload: {
              fileName: codeEditor.fileName,
              ...countLineChanges(codeEditor.code || "", value),
            },
          },
        ];
      });

      appendToTurn(turnZUID, entries);
      setLatestPromptZUIDs(new Set([turnZUID]));
    },
    [chat, applySetValue, appendToTurn, t]
  );

  const sendTurn = useCallback(
    (prompt: string, body: Record<string, unknown>) => {
      const turnZUID = `turn-${++turnSeq}`;
      const clears = chat.clears;
      const failed: ChatResponse = {
        type: "ERROR",
        payload: { value: t("shell.errorGeneratingAiResponse") },
      };
      appendToTurn(turnZUID, [
        { type: "USER_INPUT", payload: { value: prompt } },
      ]);
      setComposerSeed("");
      geminiGenerate(body)
        .unwrap()
        .then((reply) => {
          if (clears !== chat.clears) return;
          if (isMountedRef.current) {
            handleReply(turnZUID, reply);
            return;
          }
          // Closed or moved to another page: the session is kept, so the
          // next turn continues it, but the edit is not applied.
          if (reply.chatZuid) chat.chatZUID = reply.chatZuid;
          appendToChat(chat, turnZUID, [failed]);
        })
        .catch(() => {
          if (clears !== chat.clears) return;
          appendToChat(chat, turnZUID, [failed]);
        });
    },
    [chat, geminiGenerate, handleReply, appendToTurn, t]
  );

  const handlePrompt = useCallback(
    (newPrompt: string) => {
      if (!newPrompt?.trim() || !roleZUID) return false;

      const prompt = newPrompt.trim();
      sendTurn(
        prompt,
        buildPromptRequest({
          prompt,
          tone: selectedTone.value,
          language: selectedLanguage.value,
          modelZUID: pageModelZUID,
          itemZUID: pageItemZUID,
          roleZUID,
          chatZUID: chat.chatZUID,
        })
      );
      return true;
    },
    [
      chat,
      sendTurn,
      roleZUID,
      selectedTone.value,
      selectedLanguage.value,
      pageModelZUID,
      pageItemZUID,
    ]
  );

  const handleGenerateSuggestions = useCallback(
    (sourcePrompt: string) => {
      if (!chat.chatZUID && !roleZUID) return;

      const normalizedPrompt = sourcePrompt ? sourcePrompt.trim() : "";
      const prompt = normalizedPrompt
        ? t("shell.generateSuggestionsPrompt", { prompt: normalizedPrompt })
        : t("shell.generateSuggestionsDefaultPrompt");
      sendTurn(
        prompt,
        buildSuggestionsRequest({ prompt, chatZUID: chat.chatZUID, roleZUID })
      );
    },
    [chat, sendTurn, roleZUID, t]
  );

  // The next turn starts a new server session.
  const handleClearChat = useCallback(() => {
    chat.clears++;
    chat.chatZUID = undefined;
    setResponses({});
    setComposerSeed("");
  }, [chat]);

  return (
    <ChatThread
      responses={responses}
      setResponses={setResponses}
      latestPromptZUIDs={latestPromptZUIDs}
      autoApply
      // The switch is hidden, so nothing calls it.
      setAutoApply={() => {}}
      hideAutoApply
      isInCodeApp={false}
      isLoading={isLoading}
      isLoadingChatSessionLog={false}
      urlChatZUID={chat.chatZUID}
      onClearChat={handleClearChat}
      updatePromptApprovalStatus={updatePromptApprovalStatus}
      composerSeed={composerSeed}
      setComposerSeed={setComposerSeed}
      selectedLanguage={selectedLanguage}
      setSelectedLanguage={setSelectedLanguage}
      selectedTone={selectedTone}
      setSelectedTone={setSelectedTone}
      handlePrompt={handlePrompt}
      handleGenerateSuggestions={handleGenerateSuggestions}
      responsesEndRef={responsesEndRef}
      placeholder={t("content.studioAiPlaceholder")}
    />
  );
};
