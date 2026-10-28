import { Box, IconButton, Paper, Skeleton, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  mcpApi,
  useGeminiGenerationMutation,
  useGetChatSessionLogQuery,
  useGetChatSessionsQuery,
  useUpdatePromptApprovalStatusMutation,
} from "../../services/mcp";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useLocation } from "react-router";
import { useLocalStorage } from "react-use";
import { getRefRegistry } from "../../../engine/refRegistry";
import { AppState } from "shell/store/types";
import { useGetUsersRolesQuery } from "shell/services/accounts";
import { useGetContentModelsQuery } from "shell/services/instance";
import {
  ChatPrompt,
  ContentItemWithDirtyAndPublishing,
} from "shell/services/types";
import { ChatThread, ChatResponse, scrollToEnd } from "./ChatThread";
import { toChatResponses } from "./parseResponse";
import { useApplySetValue } from "./useApplySetValue";
import { useGenerateAltText } from "./useGenerateAltText";
import { buildPromptRequest, buildSuggestionsRequest } from "./promptRequest";
import { ChatHistory } from "./ChatHistory";
import {
  isContentAppPath,
  isContentMetaPath,
  isBlocksPath,
  isCodeAppPath,
} from "utility/isAIDrawerSupportedPath";

const normalizeChatSessionLog = (prompts: ChatPrompt[] = []) => {
  const promptMap: Record<string, any[]> = {};

  prompts.forEach((promptLog) => {
    const parsedResponses = toChatResponses(promptLog.response);

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

const parseZUIDsFromPath = (pathname: string) => {
  // Matches /content/<modelZUID>/<itemZUID>[/meta|/seo] and
  // /blocks/<modelZUID>/<itemZUID>, with an optional trailing slash.
  const zuidMatch = pathname.match(
    /^\/(?:content|blocks)\/([^/]+)\/([^/]+)(?:\/(meta|seo))?\/?$/
  );

  return zuidMatch
    ? { modelZUID: zuidMatch[1], itemZUID: zuidMatch[2] }
    : { modelZUID: undefined, itemZUID: undefined };
};

export type AIDrawerProps = {
  onClose: () => void;
  open: boolean;
};
export const AIDrawer = ({ open, onClose }: AIDrawerProps) => {
  // Local Suspense boundary so lazy-loading the "shell" namespace shows a
  // fallback in the drawer area only, instead of blanking the whole shell.
  return (
    <Suspense
      fallback={<Box sx={{ height: "100%", backgroundColor: "grey.50" }} />}
    >
      <AIDrawerInner open={open} onClose={onClose} />
    </Suspense>
  );
};

const AIDrawerInner = ({ open, onClose }: AIDrawerProps) => {
  // Requesting the namespace here triggers its lazy load and suspends this
  // subtree until ready; child components use bare useTranslation() with
  // qualified keys (t("shell.key")) once it's in the store.
  const { t } = useTranslation("shell");
  const { pathname, search } = useLocation();
  const isInContentApp = isContentAppPath(pathname);
  const isInContentMeta = isContentMetaPath(pathname);
  const isInBlocks = isBlocksPath(pathname);
  const isInCodeApp = isCodeAppPath(pathname);
  const isEnabled =
    isInContentApp || isInContentMeta || isInBlocks || isInCodeApp;
  const user = useSelector((state: AppState) => state.user);
  const { data: roles } = useGetUsersRolesQuery(undefined, {
    skip: !isEnabled,
  });
  const { data: contentModels } = useGetContentModelsQuery(undefined, {
    skip: !isEnabled,
  });
  const [latestPromptZUIDs, setLatestPromptZUIDs] = useState<Set<string>>(
    new Set()
  );
  const { modelZUID, itemZUID } = parseZUIDsFromPath(pathname);
  const item = useSelector(
    (state: AppState) =>
      state.content[itemZUID] as ContentItemWithDirtyAndPublishing
  );

  const chatStorageKey = `ai-drawer-${pathname}-chatZUID`;
  const [urlChatZUID, setUrlChatZUID, removeUrlChatZUID] = useLocalStorage<
    string | undefined
  >(chatStorageKey, undefined);
  const [responses, setResponses] = useState<Record<string, ChatResponse[]>>(
    {}
  );
  // Mirrors `responses` for effects that need to read the latest value
  // without depending on it directly — `responses` changes on every
  // approval update, which would otherwise re-trigger those effects.
  const responsesRef = useRef(responses);
  responsesRef.current = responses;
  const [composerSeed, setComposerSeed] = useState("");

  const [autoApply, setAutoApply] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState({
    label: "English (United States)",
    value: "en-US",
  });
  const [selectedTone, setSelectedTone] = useState({
    value: "Professional - Serious, formal, and authoritative",
    label: t("shell.toneNameProfessional"),
  });

  const [geminiGenerate, { isLoading, data: aiResponse, error: aiError }] =
    useGeminiGenerationMutation();
  const {
    data: chatSessionLog,
    currentData: currentChatSessionLog,
    isFetching: isFetchingChatSessionLog,
    isError: isChatSessionLogError,
  } = useGetChatSessionLogQuery(
    { chatZUID: urlChatZUID },
    {
      skip: !urlChatZUID || !open,
    }
  );
  // The hook's own `isLoading` stays false when switching sessions, since RTK
  // Query keeps the previous session's `data` visible until the new one
  // loads. `currentData` isn't sticky, so this is only true when we're
  // missing data for the session actually on screen right now.
  const isChatSessionLogUnresolved =
    isFetchingChatSessionLog && currentChatSessionLog === undefined;
  const [updatePromptApprovalStatus] = useUpdatePromptApprovalStatusMutation();
  const applySetValue = useApplySetValue();
  const dispatch = useDispatch();
  const { generate: generateAltText, isLoading: isGeneratingAltText } =
    useGenerateAltText();
  // The chat on screen now, for a reply that lands after the user left it.
  const urlChatZUIDRef = useRef(urlChatZUID);
  urlChatZUIDRef.current = urlChatZUID;
  const {
    data: chatSessions,
    isLoading: isLoadingChatSessions,
    refetch: refetchChatSessions,
  } = useGetChatSessionsQuery(undefined, { skip: !isEnabled });
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);

  const relevantChatSessions = useMemo(() => {
    if (!chatSessions) return [];

    return chatSessions.filter(
      (session) => session.referer === window.location.href
    );
  }, [chatSessions, pathname, search]);

  // Guards against re-firing the auto-select effect below (e.g. on "back to history").
  const hasAutoSelectedLatestSessionRef = useRef(false);
  useEffect(() => {
    hasAutoSelectedLatestSessionRef.current = false;
  }, [pathname]);

  // Auto-open the latest session when there's no cached chatZUID for this page.
  useEffect(() => {
    if (
      hasAutoSelectedLatestSessionRef.current ||
      urlChatZUID ||
      isStartingNewChat ||
      isLoadingChatSessions ||
      !relevantChatSessions.length
    ) {
      return;
    }

    hasAutoSelectedLatestSessionRef.current = true;

    const mostRecentSession = [...relevantChatSessions].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    setUrlChatZUID(mostRecentSession.chatZuid);
  }, [
    urlChatZUID,
    isStartingNewChat,
    isLoadingChatSessions,
    relevantChatSessions,
    setUrlChatZUID,
  ]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  // Tracks whether the next chatSessionLog sync is the result of a prompt we
  // just sent live, vs. restoring history from opening/switching chats.
  const isAwaitingLiveResponseRef = useRef(false);
  // The chatZUID a prompt was fired against, for guarding the sync effect above.
  const requestedChatZUIDRef = useRef<string | undefined>(undefined);
  // Set when the user leaves the chat a prompt was fired from, so its late
  // response is ignored (ZUID equality can't tell abandoned new chats apart).
  const isRequestAbandonedRef = useRef(false);
  // A live prompt's response is already rendered optimistically, so don't show
  // the loading skeleton while its chatSessionLog fetch (e.g. for a brand new
  // chat) is still catching up in the background.
  const isLoadingChatSessionLog =
    isChatSessionLogUnresolved && !isAwaitingLiveResponseRef.current;

  const showChatThread =
    Boolean(urlChatZUID) ||
    isStartingNewChat ||
    (!isLoadingChatSessions && !relevantChatSessions.length);
  const hasOtherChatSessions = relevantChatSessions.length > 0;

  const drawerTitle = useMemo(() => {
    if (!showChatThread) {
      if (isInCodeApp) {
        const fileName = getRefRegistry()?.["code-editor"]?.context()?.fileName;
        return fileName ? `/${fileName.trim().replace(/^\/+/, "")}` : "";
      }

      if (isInContentApp || isInContentMeta || isInBlocks) {
        const model = contentModels?.find((model) => model.ZUID === modelZUID);
        const headerTitle =
          item?.web?.metaTitle || item?.web?.metaLinkText || "";

        return (
          (model?.type === "block"
            ? t("shell.blockItemTitleFormat", {
                model: model?.label,
                title: headerTitle,
              })
            : headerTitle) || ""
        );
      }

      return t("shell.aiAssistantBeta");
    }

    if (urlChatZUID) {
      const activeSession = relevantChatSessions.find(
        (session) => session.chatZuid === urlChatZUID
      );
      return activeSession?.title || t("shell.untitledChat");
    }

    return hasOtherChatSessions
      ? t("shell.newChat")
      : t("shell.aiAssistantBeta");
  }, [
    showChatThread,
    isInCodeApp,
    isInContentApp,
    isInContentMeta,
    isInBlocks,
    pathname,
    contentModels,
    modelZUID,
    item,
    urlChatZUID,
    relevantChatSessions,
    hasOtherChatSessions,
    t,
  ]);

  const userRole = useMemo(
    () => roles?.find((role) => role.ZUID === user.ZUID),
    [roles, user.ZUID]
  );

  // Sync the active chat ZUID from the latest generation response only when that
  // response changes. This prevents restoring a cleared chat from stale mutation data.
  const handledAiResponseRef = useRef<typeof aiResponse>(undefined);
  useEffect(() => {
    if (!aiResponse?.chatZuid) return;
    // Handle each response once; re-runs from other deps would re-open a chat the user has since left.
    if (handledAiResponseRef.current === aiResponse) return;
    handledAiResponseRef.current = aiResponse;
    // Don't snap back if the user has since navigated away from the session this response was for.
    if (
      isRequestAbandonedRef.current ||
      urlChatZUID !== requestedChatZUIDRef.current
    )
      return;

    setUrlChatZUID((prev) =>
      prev === aiResponse.chatZuid ? prev : aiResponse.chatZuid
    );

    // A response can carry a chatZuid we don't have in the sessions cache yet
    // (a brand new chat). Refetch so it shows up in ChatHistory and the
    // drawer title can pick up its title.
    const isKnownSession = chatSessions?.some(
      (session) => session.chatZuid === aiResponse.chatZuid
    );
    if (!isKnownSession) {
      refetchChatSessions();
    }
  }, [
    aiResponse,
    urlChatZUID,
    setUrlChatZUID,
    chatSessions,
    refetchChatSessions,
  ]);

  // If the mutation fails, the chat-session-log sync effect never gets a
  // chance to clear this ref (it only runs on a successful response), so a
  // failed request would otherwise leak "awaiting live response" state into
  // whatever session the user switches to next.
  useEffect(() => {
    if (!aiError || isRequestAbandonedRef.current) return;

    isAwaitingLiveResponseRef.current = false;
    setResponses((prev) => ({
      ...prev,
      pendingPrompt: [
        ...(prev.pendingPrompt || []),
        {
          type: "ERROR",
          payload: { value: t("shell.errorGeneratingAiResponse") },
        },
      ],
    }));
  }, [aiError, t]);

  // Once a real chat is active, the "force new chat" override is no longer relevant
  useEffect(() => {
    if (urlChatZUID) setIsStartingNewChat(false);
  }, [urlChatZUID]);

  // Auto-applies AI responses to the editor when available
  useEffect(() => {
    if (!autoApply || !urlChatZUID) return;
    if (!latestPromptZUIDs.size) return;

    // Reads the latest `responses` via the ref (instead of depending on
    // `responses` directly) and skips already-approved responses, so this
    // effect is safe to re-run after the `setResponses` call below without
    // re-enqueueing the same action or re-sending the approval PATCH.
    // A single log delta can surface more than one new prompt ZUID (e.g. a
    // batch update), so every entry in the set needs to be applied, not just
    // the first.
    const approvedPromptZUIDs: string[] = [];
    const appliedResponses = new Set<ChatResponse>();

    latestPromptZUIDs.forEach((promptZUID) => {
      const promptResponses = responsesRef.current[promptZUID];
      if (!promptResponses) return;

      const unappliedSetValueResponses = promptResponses.filter(
        (response): response is Extract<ChatResponse, { type: "SET_VALUE" }> =>
          response.type === "SET_VALUE" && response.approval !== "1"
      );
      if (!unappliedSetValueResponses.length) return;

      // Side effects run here, outside the state updater below — a
      // `setResponses` updater can run more than once per call (e.g. React 18
      // Strict Mode double-invokes it in development to surface impurities),
      // which would otherwise double-enqueue the action and double-PATCH.
      unappliedSetValueResponses.forEach((response) => {
        // A ref that is not on the page is skipped: no approval PATCH, and
        // the response stays unapplied.
        if (!applySetValue(response.payload.refKey, response.payload.value)) {
          return;
        }

        updatePromptApprovalStatus({
          chatZUID: urlChatZUID,
          promptZUID,
          approval: "1",
        });
        appliedResponses.add(response);
      });

      approvedPromptZUIDs.push(promptZUID);
    });

    if (!appliedResponses.size) return;

    // Optimistically mark as approved so the button disables immediately
    // without waiting for a re-fetch (mirrors the manual Apply button behavior).
    setResponses((previousResponses) => {
      const nextResponses = { ...previousResponses };

      approvedPromptZUIDs.forEach((promptZUID) => {
        const currentPromptResponses = nextResponses[promptZUID];
        if (!currentPromptResponses) return;

        nextResponses[promptZUID] = currentPromptResponses.map((response) =>
          appliedResponses.has(response)
            ? { ...response, approval: "1" }
            : response
        );
      });

      return nextResponses;
    });
  }, [
    autoApply,
    latestPromptZUIDs,
    urlChatZUID,
    updatePromptApprovalStatus,
    applySetValue,
  ]);

  useEffect(() => {
    scrollToEnd(scrollContainerRef.current);
  }, [responses]);

  // Maps the chat session log to a normalized format for rendering
  useEffect(() => {
    if (!open || isChatSessionLogUnresolved) {
      return;
    }

    // The log failed to load for a live prompt; the effect below surfaces the
    // error, so keep the optimistic prompt instead of wiping it.
    if (isChatSessionLogError && isAwaitingLiveResponseRef.current) {
      return;
    }

    const restoredResponses = chatSessionLog?.prompts?.length
      ? normalizeChatSessionLog([...chatSessionLog?.prompts])
      : {};

    // Only animate/auto-apply prompts that just arrived from a live model
    // call. Opening or switching to a chat (or the initial mount) also
    // surfaces prompts we haven't rendered before, but that's restored
    // history, not a fresh response, so it shouldn't animate. `responses`
    // is read here as a snapshot of what's currently rendered, not as a
    // dependency, since this effect should only react to session changes.
    if (isAwaitingLiveResponseRef.current) {
      const knownPromptZUIDs = new Set(Object.keys(responses));
      const newPromptZUIDs = Object.keys(restoredResponses).filter(
        (promptZUID) => !knownPromptZUIDs.has(promptZUID)
      );
      setLatestPromptZUIDs(new Set(newPromptZUIDs));
      isAwaitingLiveResponseRef.current = false;
    } else {
      setLatestPromptZUIDs(new Set());
    }

    setResponses(restoredResponses);
  }, [
    open,
    isChatSessionLogUnresolved,
    isChatSessionLogError,
    chatSessionLog,
    urlChatZUID,
  ]);

  // The mutation can succeed without the response ever becoming visible
  // (no chatZuid returned for a new chat, or the session log fails to load).
  useEffect(() => {
    if (!isAwaitingLiveResponseRef.current || isRequestAbandonedRef.current) {
      return;
    }

    const isMissingChatZUID =
      Boolean(aiResponse) &&
      !aiResponse.chatZuid &&
      !requestedChatZUIDRef.current;
    if (!isMissingChatZUID && !isChatSessionLogError) return;

    isAwaitingLiveResponseRef.current = false;
    setResponses((prev) => ({
      ...prev,
      pendingPrompt: [
        ...(prev.pendingPrompt || []),
        {
          type: "ERROR",
          payload: { value: t("shell.errorGeneratingAiResponse") },
        },
      ],
    }));
  }, [aiResponse, isChatSessionLogError, t]);

  const handlePrompt = useCallback(
    (newPrompt: string) => {
      if (!newPrompt?.trim() || !userRole?.role?.ZUID) {
        return false;
      }

      const trimmedPrompt = newPrompt.trim();

      isAwaitingLiveResponseRef.current = true;
      requestedChatZUIDRef.current = urlChatZUID;
      isRequestAbandonedRef.current = false;
      geminiGenerate(
        buildPromptRequest({
          prompt: trimmedPrompt,
          tone: selectedTone.value,
          language: selectedLanguage.value,
          modelZUID,
          itemZUID,
          roleZUID: userRole.role.ZUID,
          chatZUID: urlChatZUID,
        })
      );
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
      return true;
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
      if (!urlChatZUID && !userRole?.role?.ZUID) return;

      const normalizedPrompt = sourcePrompt ? sourcePrompt.trim() : "";
      const promptValue = normalizedPrompt
        ? t("shell.generateSuggestionsPrompt", { prompt: normalizedPrompt })
        : t("shell.generateSuggestionsDefaultPrompt");

      isAwaitingLiveResponseRef.current = true;
      requestedChatZUIDRef.current = urlChatZUID;
      isRequestAbandonedRef.current = false;
      geminiGenerate(
        buildSuggestionsRequest({
          prompt: promptValue,
          chatZUID: urlChatZUID,
          roleZUID: userRole?.role?.ZUID,
        })
      );
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
    [geminiGenerate, urlChatZUID, userRole, t]
  );

  // The server logs the turn to the chat, so a refetch shows it. A turn it
  // did not log, or a failure, is shown locally until the next refetch.
  const handleGenerateAltText = useCallback(
    async (fileZuid: string, prompt: string) => {
      const chatZUID = urlChatZUID;
      const result = await generateAltText({
        fileZuid,
        context: prompt,
        chatZuid: chatZUID,
      });
      if (urlChatZUIDRef.current !== chatZUID) return;

      if (result.ok && chatZUID && !result.chatError) {
        dispatch(
          mcpApi.util.invalidateTags([{ type: "ChatSessionLog", id: chatZUID }])
        );
        return;
      }

      setResponses((prev) => ({
        ...prev,
        [`alt-${Date.now()}`]: [
          {
            type: "USER_INPUT",
            payload: { value: t("shell.generateAltText") },
          },
          // No `strictNullChecks` here, so only `=== false` narrows.
          result.ok === false
            ? { type: "ERROR", payload: { value: result.message } }
            : { type: "SYSTEM_OUTPUT", payload: { value: result.altText } },
        ],
      }));
    },
    [dispatch, generateAltText, urlChatZUID, t]
  );

  // Resets the live-response flag too, so it can't leak into the next session
  // opened and make its restored prompts look freshly arrived (auto-apply).
  const abandonRequest = useCallback(() => {
    isAwaitingLiveResponseRef.current = false;
    isRequestAbandonedRef.current = true;
  }, []);

  const handleSelectChatSession = useCallback(
    (chatZUID: string) => {
      abandonRequest();
      setResponses({});
      setComposerSeed("");
      setUrlChatZUID(chatZUID);
    },
    [abandonRequest, setUrlChatZUID]
  );

  const handleStartNewChat = useCallback(() => {
    abandonRequest();
    setResponses({});
    setComposerSeed("");
    setIsStartingNewChat(true);
  }, [abandonRequest]);

  const handleClearChat = useCallback(() => {
    abandonRequest();
    // Prevent the auto-select effect from immediately reopening this session.
    hasAutoSelectedLatestSessionRef.current = true;
    removeUrlChatZUID();
    setResponses({});
  }, [abandonRequest, removeUrlChatZUID]);

  const handleBackToHistory = useCallback(() => {
    abandonRequest();
    // Prevent the auto-select effect from immediately reopening this session.
    hasAutoSelectedLatestSessionRef.current = true;
    removeUrlChatZUID();
    setResponses({});
    setComposerSeed("");
    setIsStartingNewChat(false);
  }, [abandonRequest, removeUrlChatZUID]);

  if (!isEnabled) return <></>;

  return (
    <Paper
      elevation={8}
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
        borderRadius: 0,
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
        <Box display="flex" alignItems="center" gap={1} minWidth={0}>
          {showChatThread && hasOtherChatSessions && (
            <IconButton
              size="small"
              data-cy="AIDrawerBackButton"
              data-amp-track-id="ai-drawer-back-button"
              onClick={handleBackToHistory}
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>
          )}
          {isLoadingChatSessionLog ? (
            <Skeleton
              data-cy="AIDrawerTitleSkeleton"
              variant="rounded"
              width={140}
              height={20}
            />
          ) : (
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
          )}
        </Box>

        <IconButton
          size="small"
          data-amp-track-id="ai-drawer-close-button"
          onClick={() => {
            onClose();
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>
      {showChatThread ? (
        <ChatThread
          responses={responses}
          setResponses={setResponses}
          latestPromptZUIDs={latestPromptZUIDs}
          autoApply={autoApply}
          setAutoApply={setAutoApply}
          isInCodeApp={isInCodeApp}
          isLoading={isLoading || isGeneratingAltText}
          isLoadingChatSessionLog={isLoadingChatSessionLog}
          urlChatZUID={urlChatZUID}
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
          scrollContainerRef={scrollContainerRef}
          onGenerateAltText={handleGenerateAltText}
        />
      ) : (
        <ChatHistory
          sessions={relevantChatSessions}
          isLoading={isLoadingChatSessions}
          onSelectSession={handleSelectChatSession}
          onNewChat={handleStartNewChat}
        />
      )}
    </Paper>
  );
};
