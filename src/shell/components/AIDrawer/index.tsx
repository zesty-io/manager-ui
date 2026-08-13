import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useGeminiGenerationMutation,
  useGetChatSessionLogQuery,
  useUpdatePromptApprovalStatusMutation,
} from "../../services/mcp";
import CloseIcon from "@mui/icons-material/Close";
import { enqueueAction } from "../../../engine/queue";
import { useLocation } from "react-router";
import { suggestionSystemInstruction } from "./systemInstructions";
import { useLocalStorage } from "react-use";
import { getRefRegistry } from "../../../engine/refRegistry";
import { AppState } from "shell/store/types";
import { useGetUsersRolesQuery } from "shell/services/accounts";
import { useGetContentModelsQuery } from "shell/services/instance";
import {
  ChatPrompt,
  ContentItemWithDirtyAndPublishing,
} from "shell/services/types";
import { ChatThread } from "./ChatThread";
import { ChatHistory } from "./ChatHistory";

const parseResponse = (rawResponse: string) => {
  if (!rawResponse) return;

  try {
    let parsed: any = rawResponse;

    // Some persisted responses are double-encoded JSON strings.
    // Cap parsing at 3 passes: enough for normal, fenced, and double-encoded payloads
    // while avoiding endless retries on malformed values.
    for (let i = 0; i < 3 && typeof parsed === "string"; i++) {
      const cleaned = parsed.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return parsed;
  } catch (error) {
    throw error;
  }
};

const normalizeChatSessionLog = (prompts: ChatPrompt[] = []) => {
  const promptMap: Record<string, any[]> = {};

  prompts.forEach((promptLog) => {
    let parsedResponses = [];

    try {
      const parsed = parseResponse(promptLog.response);
      parsedResponses = parsed
        ? Array.isArray(parsed)
          ? parsed
          : [parsed]
        : [];
    } catch (error) {
      parsedResponses = [
        {
          type: "ERROR",
          payload: {
            value: "Error parsing saved AI response. Please try again.",
          },
        },
      ];
    }

    promptMap[promptLog.promptZuid] = [
      {
        type: "USER_INPUT",
        payload: {
          value: promptLog.prompt,
        },
      },
      ...parsedResponses.map((parsedResponse: any) => ({
        ...parsedResponse,
        approval: promptLog.approval,
      })),
    ];
  });

  return promptMap;
};

export type AIDrawerProps = {
  onClose: () => void;
  open: boolean;
};
export const AIDrawer = ({ open, onClose }: AIDrawerProps) => {
  const { pathname } = useLocation();
  const isInContentApp = /^\/content\/[^/]+\/[^/]+$/.test(pathname);
  const isInContentMeta = /^\/content\/[^/]+\/[^/]+\/meta$/.test(pathname);
  const isInBlocks = /^\/blocks\/[^/]+\/[^/]+\/?$/.test(pathname);
  const isInCodeApp = /^\/code\/file\/.+/.test(pathname);
  const user = useSelector((state: AppState) => state.user);
  const { data: roles } = useGetUsersRolesQuery();
  const { data: contentModels } = useGetContentModelsQuery();
  const [latestPromptZUIDs, setLatestPromptZUIDs] = useState<Set<string>>(
    new Set()
  );
  const prevPromptZUIDsRef = useRef<Set<string>>(new Set());
  const zuidMatch = pathname.match(
    /^\/content\/([^/]+)\/([^/]+)(?:\/(meta|seo))?$/
  );
  const { modelZUID, itemZUID } = zuidMatch
    ? { modelZUID: zuidMatch[1], itemZUID: zuidMatch[2] }
    : { modelZUID: undefined, itemZUID: undefined };
  const item = useSelector(
    (state: AppState) =>
      state.content[itemZUID] as ContentItemWithDirtyAndPublishing
  );

  const chatStorageKey = `ai-drawer-${pathname}-chatZUID`;
  const [urlChatZUID, setUrlChatZUID, removeUrlChatZUID] = useLocalStorage<
    string | undefined
  >(chatStorageKey, undefined);
  const [responses, setResponses] = useState<Record<string, any[]>>({});
  const [composerSeed, setComposerSeed] = useState("");

  const [autoApply, setAutoApply] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState({
    label: "English (United States)",
    value: "en-US",
  });
  const [selectedTone, setSelectedTone] = useState({
    value: "Professional - Serious, formal, and authoritative",
    label: "Professional",
  });

  const [geminiGenerate, { isLoading, data: aiResponse }] =
    useGeminiGenerationMutation();
  const { data: chatSessionLog, isLoading: isLoadingChatSessionLog } =
    useGetChatSessionLogQuery(
      { chatZUID: urlChatZUID },
      {
        skip: !urlChatZUID || !open,
      }
    );
  const [updatePromptApprovalStatus] = useUpdatePromptApprovalStatusMutation();

  const responsesEndRef = useRef(null);
  const hasInitializedResponseSyncRef = useRef(false);
  const isEnabled =
    isInContentApp || isInContentMeta || isInBlocks || isInCodeApp;

  const drawerTitle = useMemo(() => {
    if (isInCodeApp) {
      const fileName = getRefRegistry()?.["code-editor"]?.context()?.fileName;
      return `/${fileName?.trim()?.replace(/^\/+/, "")}`;
    }

    if (isInContentApp || isInContentMeta || isInBlocks) {
      const model = contentModels?.find((model) => model.ZUID === modelZUID);
      const headerTitle = item?.web?.metaTitle || item?.web?.metaLinkText || "";

      return (
        (model?.type === "block"
          ? `${model?.label}: ${headerTitle}`
          : headerTitle) || ""
      );
    }

    return "AI Assistant Beta";
  }, [
    isInCodeApp,
    isInContentApp,
    isInContentMeta,
    isInBlocks,
    pathname,
    contentModels,
    modelZUID,
    item,
  ]);

  const userRole = useMemo(
    () => roles?.find((role) => role.ZUID === user.ZUID),
    [roles, user.ZUID]
  );

  // Sync the active chat ZUID from the latest generation response only when that
  // response changes. This prevents restoring a cleared chat from stale mutation data.
  useEffect(() => {
    if (!aiResponse?.chatZuid) return;

    setUrlChatZUID((prev) =>
      prev === aiResponse.chatZuid ? prev : aiResponse.chatZuid
    );
  }, [aiResponse, setUrlChatZUID]);

  // Auto-applies AI responses to the editor when available
  useEffect(() => {
    if (!autoApply) return;

    const latestPromptZUID = latestPromptZUIDs.values().next().value;

    if (latestPromptZUID) {
      const promptsArray = responses[latestPromptZUID];
      const hasSetValue = promptsArray?.some((p) => p.type === "SET_VALUE");

      promptsArray?.forEach((prompt) => {
        if (prompt.type === "SET_VALUE") {
          enqueueAction({
            type: prompt.type,
            payload: {
              refKey: prompt.payload.refKey,
              value: prompt.payload.value,
            },
          });
          updatePromptApprovalStatus({
            chatZUID: urlChatZUID,
            promptZUID: latestPromptZUID,
            approval: "1",
          });
        }
      });

      if (hasSetValue) {
        // Optimistically mark as approved so the button disables immediately
        // without waiting for a re-fetch (mirrors the manual Apply button behavior)
        setResponses((prev) => ({
          ...prev,
          [latestPromptZUID]: prev[latestPromptZUID].map((response) =>
            response.type === "SET_VALUE"
              ? { ...response, approval: "1" }
              : response
          ),
        }));
      }
    }
  }, [autoApply, latestPromptZUIDs, responses, urlChatZUID]);

  useEffect(() => {
    if (responsesEndRef.current) {
      responsesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [responses]);

  // Maps the chat session log to a normalized format for rendering
  useEffect(() => {
    if (!open || isLoadingChatSessionLog) {
      return;
    }

    const restoredResponses = chatSessionLog?.prompts?.length
      ? // Reversing the prompts array before normalizing since the UI needs to render this in
        // ascending order but the data is stored in descending order
        normalizeChatSessionLog([...chatSessionLog?.prompts])
      : {};
    const currentPromptZUIDs = Object.keys(restoredResponses);

    if (!hasInitializedResponseSyncRef.current) {
      hasInitializedResponseSyncRef.current = true;
      prevPromptZUIDsRef.current = new Set(currentPromptZUIDs);
      setLatestPromptZUIDs(new Set());
    } else {
      const newPromptZUIDs = currentPromptZUIDs.filter(
        (promptZUID) => !prevPromptZUIDsRef.current.has(promptZUID)
      );
      setLatestPromptZUIDs(new Set(newPromptZUIDs));
      prevPromptZUIDsRef.current = new Set(currentPromptZUIDs);
    }

    setResponses(restoredResponses);
  }, [open, isLoadingChatSessionLog, chatSessionLog]);

  const handlePrompt = useCallback(
    (newPrompt: string) => {
      if (!newPrompt?.trim() || !userRole?.ZUID) {
        return;
      }

      const registryKeys = Object.keys(getRefRegistry() || {});
      const refRegistry = getRefRegistry();
      const mappedRefRegistry = registryKeys.map(
        (x) => `"${x}": "${JSON.stringify(refRegistry[x].context())}"`
      );
      const temperature = 0.5;
      const trimmedPrompt = newPrompt.trim();

      geminiGenerate({
        prompt: trimmedPrompt,
        tone: selectedTone.value,
        language: selectedLanguage.value,
        modelZuid: modelZUID,
        itemZuid: itemZUID,
        registryKeys,
        refRegistry: mappedRefRegistry,
        filename:
          getRefRegistry()?.["code-editor"]?.context()?.fileName || undefined,
        code: getRefRegistry()?.["code-editor"]?.context()?.code || undefined,
        fields:
          getRefRegistry()?.["code-editor"]?.context()?.fields || undefined,
        temperature,
        url: window.location.href,
        roleZuid: userRole.ZUID,
        // This tells the /client endpoint whether to generate a new chat session or use an existing one
        ...(urlChatZUID && { chatZuid: urlChatZUID }),
      });
      setResponses((prev) => ({
        ...prev,
        pendingPrompt: [
          {
            type: "USER_INPUT",
            payload: {
              value: trimmedPrompt,
            },
          },
        ],
      }));
      setComposerSeed("");
    },
    [
      geminiGenerate,
      itemZUID,
      modelZUID,
      selectedLanguage.value,
      selectedTone.value,
      urlChatZUID,
      userRole,
    ]
  );

  const handleGenerateSuggestions = useCallback(
    (sourcePrompt: string) => {
      const systemInstruction = suggestionSystemInstruction(
        Object.keys(getRefRegistry() || {}),
        getRefRegistry()
      );
      const temperature = 0.5;
      const normalizedPrompt = sourcePrompt ? sourcePrompt.trim() : "";
      const promptValue = normalizedPrompt
        ? `Generate suggestions: ${normalizedPrompt}`
        : "Generate suggestions for my content fields";

      geminiGenerate({
        prompt: promptValue,
        systemInstruction,
        temperature,
        chatZuid: urlChatZUID,
        url: window.location.href,
        // roleZUID is needed to create a new chat session when Generate Suggestions button is clicked and there is no existing chatZUID yet
        ...(!urlChatZUID && { roleZuid: userRole.ZUID }),
      });
      setResponses((prev) => ({
        ...prev,
        pendingPrompt: [
          {
            type: "USER_INPUT",
            payload: {
              value: promptValue,
            },
          },
        ],
      }));
      setComposerSeed("");
    },
    [geminiGenerate, urlChatZUID]
  );

  if (!isEnabled) return <></>;

  return (
    <Paper
      elevation={16}
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 300,
        maxWidth: 300,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.paper",
        zIndex: (theme) => theme.zIndex.speedDial + 1,
      }}
    >
      <Box
        data-cy="AIDrawerEnabled"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        height={52}
        px={2}
        py={1.25}
        borderBottom={1}
        borderColor="divider"
      >
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            wordWrap: "break-word",
            hyphens: "auto",
            overflow: "hidden",
          }}
        >
          {drawerTitle}
        </Typography>

        <IconButton
          size="small"
          onClick={() => {
            onClose();
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>
      <ChatHistory />
      {/*<ChatThread
        responses={responses}
        setResponses={setResponses}
        latestPromptZUIDs={latestPromptZUIDs}
        autoApply={autoApply}
        setAutoApply={setAutoApply}
        isInCodeApp={isInCodeApp}
        isLoading={isLoading}
        isLoadingChatSessionLog={isLoadingChatSessionLog}
        urlChatZUID={urlChatZUID}
        removeUrlChatZUID={removeUrlChatZUID}
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
      />*/}
    </Paper>
  );
};
