import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Collapse,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  InputLabel,
  Paper,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useGeminiGenerationMutation,
  useGetChatSessionLogQuery,
  useUpdatePromptApprovalStatusMutation,
} from "../../services/mcp";
import CloseIcon from "@mui/icons-material/Close";
import { enqueueAction } from "../../../engine/queue";
import {
  ArrowForward,
  ArrowUpwardRounded,
  AutoFixHighRounded,
  ChevronRightRounded,
} from "@mui/icons-material";
import { useLocation } from "react-router";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { useGetLangsMappingQuery } from "../../services/instance";
import { suggestionSystemInstruction } from "./systemInstructions";
import { useLocalStorage } from "react-use";
import { getRefRegistry } from "../../../engine/refRegistry";
import geminiLogo from "../../../../public/images/geminiLogo.svg";
import { AppState } from "shell/store/types";
import { useGetUsersRolesQuery } from "shell/services/accounts";
import { ChatPrompt } from "shell/services/types";
import geminiIcon from "../../../../public/images/geminiIcon.svg";
import { isEmpty } from "lodash";

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

    console.log("promptLog:", promptLog);

    promptMap[promptLog.promptZuid] = [
      {
        type: "USER_INPUT",
        payload: {
          value: promptLog.prompt,
        },
      },
      ...parsedResponses,
    ];
  });

  return promptMap;
};

const TONE_OPTIONS = [
  {
    label: "Intriguing",
    value: "Intriguing - Curious, mysterious, and thought-provoking",
  },
  {
    label: "Professional",
    value: "Professional - Serious, formal, and authoritative",
  },
  { label: "Playful", value: "Playful - Fun, light-hearted, and whimsical" },
  {
    label: "Sensational",
    value: "Sensational -  Bold, dramatic, and attention-grabbing",
  },
  { label: "Succinct", value: "Succinct - Clear, factual, with no hyperbole" },
] as const;

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
  const { data: langMappings } = useGetLangsMappingQuery();
  const chatContainerRef = useRef<HTMLDivElement>(null);
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

  const chatStorageKey = `ai-drawer-${pathname}-chatZUID`;
  const [urlChatZUID, setUrlChatZUID, removeUrlChatZUID] = useLocalStorage<
    string | undefined
  >(chatStorageKey, undefined);
  const [responses, setResponses] = useState<Record<string, any[]>>({});
  const [composerSeed, setComposerSeed] = useState("");

  const [appliedResponsesLS, setAppliedResponsesLS] = useLocalStorage<
    Record<string, number[]>
  >(`ai-drawer-applied-responses`, { [pathname]: [] });
  const promptIsEmpty = isEmpty(composerSeed.trim());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoApply, setAutoApply] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState({
    label: "English (United States)",
    value: "en-US",
  });
  const [selectedTone, setSelectedTone] = useState({
    value: "Professional - Serious, formal, and authoritative",
    label: "Professional",
  });

  const languageOptions = Object.entries(langMappings || {})?.map(
    ([value, label]: any) => ({
      label,
      value,
    })
  );

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

  return (
    <Paper
      elevation={16}
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 300,
        maxWidth: 300,
        px: 2,
        pt: 2,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        marginTop: -5,
        bgcolor: "background.paper",
        zIndex: (theme) => theme.zIndex.speedDial + 1,
      }}
    >
      {!isEnabled && (
        <>
          <Box position="relative" display="flex" alignItems={"center"} gap={1}>
            <Stack
              width={40}
              height={40}
              borderRadius="50%"
              justifyContent="center"
              alignItems="center"
            >
              <Box
                component="img"
                src={geminiIcon}
                alt="Gemini Icon"
                width="32px"
                display="block"
              />
            </Stack>
            <Box>
              <Box
                component="img"
                src={geminiLogo}
                alt="Gemini Logo"
                width="40px"
                display="block"
              />
              <Typography variant="h5" fontWeight={700}>
                AI Assistant Beta
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => {
                onClose();
              }}
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
              }}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Box>
          <Typography variant="body1" data-cy="AIDrawerDisabled">
            Only available in content app.
          </Typography>
        </>
      )}

      {isEnabled && (
        <>
          <Box
            data-cy="AIDrawerEnabled"
            display="flex"
            alignItems={"center"}
            justifyContent={"space-between"}
            position="relative"
            gap={1}
          >
            <Box display="flex" alignItems={"center"} gap={1}>
              <Stack
                width={40}
                height={40}
                borderRadius="50%"
                justifyContent="center"
                alignItems="center"
              >
                <Box
                  component="img"
                  src={geminiIcon}
                  alt="Gemini Icon"
                  width="32px"
                  display="block"
                />
              </Stack>
              <Box>
                <Box
                  component="img"
                  src={geminiLogo}
                  alt="Gemini Logo"
                  width="40px"
                  display="block"
                />
                <Typography variant="h5" fontWeight={700}>
                  AI Assistant Beta
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => {
                  onClose();
                }}
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                }}
              >
                <CloseIcon fontSize="medium" />
              </IconButton>
            </Box>
          </Box>
          <Box display="flex" flexGrow={1} overflow="auto">
            <Box display="block" overflow="auto" my={1} width="100%">
              <Box
                flex="1"
                display="flex"
                flexDirection="column"
                gap={2}
                ref={chatContainerRef}
                justifyContent="flex-end"
                sx={{
                  position: "relative",
                  boxSizing: "border-box",
                  minHeight: "100%",
                  width: "100%",
                }}
              >
                {Object.entries(responses).map(
                  ([promptZUID, promptResponses]) => {
                    return promptResponses.map((response, responseIndex) => {
                      const shouldAnimate =
                        latestPromptZUIDs.has(promptZUID) &&
                        response.type !== "USER_INPUT";

                      if (response.type === "USER_INPUT") {
                        return (
                          <Box
                            data-cy="AIDrawerUserInput"
                            key={`${promptZUID}-${responseIndex}`}
                            px={1.5}
                            py={1}
                            sx={{
                              borderRadius: 2,
                              maxWidth: "168px",
                              width: "fit-content",
                              color: "white",
                              ml: "auto",
                              backgroundColor: "grey.500",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                borderRadius: 1,
                                wordBreak: "break-word",
                                fontStyle:
                                  response.payload.value.startsWith(
                                    "Generate suggestions"
                                  ) && "italic",
                              }}
                            >
                              {response.payload.value}
                            </Typography>
                          </Box>
                        );
                      } else if (response.type === "SYSTEM_SUGGESTION") {
                        return (
                          <Button
                            data-cy="AIDrawerSystemSuggestion"
                            key={`${promptZUID}-${responseIndex}`}
                            onClick={() => {
                              setComposerSeed(response.payload.value);
                            }}
                            sx={{
                              textAlign: "left",
                              justifyContent: "flex-start",
                              width: "fit-content",
                              px: 1.5,
                              py: 1,
                              borderRadius: 2,
                            }}
                            variant="contained"
                            color="inherit"
                            endIcon={<ChevronRightRounded />}
                          >
                            <AnimatedText
                              text={response.payload.value}
                              animate={shouldAnimate}
                              onGrow={() => {
                                if (responsesEndRef.current) {
                                  responsesEndRef.current.scrollIntoView({
                                    behavior: "smooth",
                                  });
                                }
                              }}
                            />
                          </Button>
                        );
                      } else if (response.type === "NAVIGATE") {
                        return (
                          <Box display="flex" justifyContent="flex-end">
                            <Button
                              key={`${promptZUID}-${responseIndex}`}
                              size="xsmall"
                              variant="contained"
                              sx={{ ml: "auto", mt: 0.5 }}
                              onClick={() => {
                                enqueueAction({
                                  type: response.type,
                                  payload: {
                                    path: response.payload.path,
                                  },
                                });
                              }}
                              endIcon={<ArrowForward fontSize="small" />}
                            >
                              Navigate
                            </Button>
                          </Box>
                        );
                      }

                      return (
                        <Box key={`${promptZUID}-${responseIndex}`}>
                          <Typography
                            variant="body3"
                            sx={{
                              mb: 0.5,
                            }}
                          >
                            {response.payload.refKey}
                          </Typography>
                          {response.payload?.value?.startsWith("3-") ? (
                            <GeneratedImage src={response.payload.value} />
                          ) : (
                            <AnimatedText
                              key={`${promptZUID}-${responseIndex}`}
                              text={response.payload.value}
                              animate={shouldAnimate && !isInCodeApp}
                              onGrow={() => {
                                if (responsesEndRef.current) {
                                  responsesEndRef.current.scrollIntoView({
                                    behavior: "smooth",
                                  });
                                }
                              }}
                            />
                          )}
                          {!autoApply && response.type === "SET_VALUE" && (
                            <Box display="flex" justifyContent="flex-end">
                              <Button
                                data-cy="AIDrawerSetValue"
                                size="xsmall"
                                variant="contained"
                                sx={{ ml: "auto", mt: 0.5 }}
                                // FIXME: Determine if we should use the backend approval value
                                // disabled={appliedResponsesLS?.[pathname]?.includes(
                                //   index
                                // )}
                                onClick={() => {
                                  enqueueAction({
                                    type: response.type,
                                    payload: {
                                      refKey: response.payload.refKey,
                                      value: response.payload.value,
                                    },
                                  });
                                  updatePromptApprovalStatus({
                                    chatZUID: urlChatZUID,
                                    promptZUID,
                                    approval: "1",
                                  });
                                  // setAppliedResponsesLS({
                                  //   ...appliedResponsesLS,
                                  //   [pathname]: [
                                  //     ...(appliedResponsesLS?.[pathname] || []),
                                  //     index,
                                  //   ],
                                  // });
                                }}
                                startIcon={
                                  <AutoFixHighRounded fontSize="small" />
                                }
                              >
                                Apply
                              </Button>
                            </Box>
                          )}
                        </Box>
                      );
                    });
                  }
                )}
                <div ref={responsesEndRef} />
                {isLoading && (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    p={1}
                    borderRadius={2}
                    border="1px solid"
                    borderColor="border"
                    width="fit-content"
                    mb={1}
                  >
                    <Skeleton variant="rounded" width={8} height={8} />
                    <Skeleton variant="rounded" width={8} height={8} />
                    <Skeleton variant="rounded" width={8} height={8} />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          <Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              rowGap={1}
            >
              <Button
                data-cy="AIDrawerGenerateSuggestions"
                size="small"
                variant="outlined"
                fullWidth
                onClick={() => handleGenerateSuggestions(composerSeed)}
              >
                Generate Suggestions
              </Button>
              <PromptComposer
                seed={composerSeed}
                disabled={isLoading || isLoadingChatSessionLog}
                onSubmit={handlePrompt}
              />
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              my={0.5}
            >
              <Box display="flex" alignItems="flex-start" flexGrow={1}>
                <Button
                  data-cy="AIDrawerClearChat"
                  variant="text"
                  color="inherit"
                  onClick={() => {
                    removeUrlChatZUID();
                    setResponses({});
                    setAppliedResponsesLS({
                      ...appliedResponsesLS,
                      [pathname]: [],
                    });
                  }}
                >
                  Clear Chat
                </Button>
              </Box>
              <IconButton
                data-cy="AIDrawerSettings"
                onClick={() => setSettingsOpen(!settingsOpen)}
                size="small"
              >
                <SettingsRoundedIcon color="action" fontSize="small" />
              </IconButton>

              <Button
                variant="contained"
                onClick={() => handlePrompt(composerSeed)}
                disabled={promptIsEmpty}
                sx={{
                  borderRadius: 6,
                  padding: 0.5,
                  minWidth: 0,
                  backgroundColor: promptIsEmpty
                    ? "transparent!important"
                    : "primary.main",
                  color: promptIsEmpty
                    ? "action.active"
                    : "primary.contrastText",
                }}
              >
                <ArrowUpwardRounded fontSize="small" />
              </Button>
            </Box>
            <Collapse
              orientation="vertical"
              collapsedSize={0}
              sx={{ position: "relative" }}
              in={settingsOpen}
            >
              <Box py={2}>
                <FormGroup>
                  <FormControlLabel
                    sx={{
                      mx: 0,
                    }}
                    control={
                      <Switch
                        data-cy="AIDrawerAutoApplyToggle"
                        size="small"
                        checked={autoApply}
                        onChange={(e) => setAutoApply(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="subtitle2" color="text.secondary">
                        Auto apply
                      </Typography>
                    }
                  />
                </FormGroup>
                <Box>
                  <Stack direction="row" gap={1} alignItems="center" mt={1}>
                    <InputLabel sx={{ mb: 0 }}>Language</InputLabel>
                    <Tooltip
                      title="Set the language in which you'd like the text to be generated."
                      placement="top"
                    >
                      <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
                    </Tooltip>
                  </Stack>
                  <Autocomplete
                    autoHighlight
                    disableClearable
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.value === value.value
                    }
                    onChange={(event, value) => setSelectedLanguage(value)}
                    value={selectedLanguage}
                    options={languageOptions}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start" sx={{ width: 24 }}>
                              <LanguageRoundedIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
                <Box>
                  <Stack direction="row" gap={1} alignItems="center" mt={1}>
                    <InputLabel sx={{ mb: 0 }}>Tone</InputLabel>
                    <Tooltip
                      title="Set the desired style and mood of the generated text"
                      placement="top"
                    >
                      <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
                    </Tooltip>
                  </Stack>
                  <Autocomplete
                    autoHighlight
                    disableClearable
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.value === value.value
                    }
                    onChange={(_, value) => setSelectedTone(value)}
                    value={selectedTone}
                    options={TONE_OPTIONS}
                    renderInput={(params: any) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Box>
              </Box>
            </Collapse>
          </Box>
        </>
      )}
    </Paper>
  );
};

type PromptComposerProps = {
  seed: string;
  disabled: boolean;
  onSubmit: (value: string) => void;
};

const PromptComposer = memo(
  ({ seed, disabled, onSubmit }: PromptComposerProps) => {
    const [draft, setDraft] = useState(seed);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setDraft(seed);
      if (seed) {
        inputRef.current?.focus();
      }
    }, [seed]);

    const submitDraft = () => {
      if (!draft.trim()) {
        return;
      }
      onSubmit(draft);
      setDraft("");
    };

    return (
      <TextField
        data-cy="AIDrawerComposer"
        inputRef={inputRef}
        disabled={disabled}
        placeholder={`Ask for anything, for example "Cater my content to a specific audience"`}
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        onChange={(e) => setDraft(e.target.value)}
        value={draft}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitDraft();
          }
        }}
      />
    );
  }
);
PromptComposer.displayName = "PromptComposer";

type AnimatedTextProps = {
  text: string;
  animate: boolean;
  onGrow?: () => void;
};

export const AnimatedText = ({ text, animate, onGrow }: AnimatedTextProps) => {
  const [displayedText, setDisplayedText] = useState(animate ? "" : text);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (!animate) {
      return;
    }
    setDisplayedText("");
    intervalRef.current = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < text.length) {
          const next = prev + text[prev.length];
          if (onGrow) onGrow();
          if (prev.length + 1 === text.length) {
            clearInterval(intervalRef.current);
          }
          return next;
        } else {
          clearInterval(intervalRef.current);
          return prev;
        }
      });
    }, 30);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <Typography data-cy="AIDrawerSystemOutput" variant="body2">
      {displayedText}
    </Typography>
  );
};

const GeneratedImage = ({ src }: { src: string }) => {
  const [loading, setLoading] = useState(true);

  return (
    <Box position="relative" width={200} height={200}>
      {loading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{ transform: "translate(-50%, -50%)" }}
        >
          <CircularProgress size={40} />
        </Box>
      )}
      <Box
        data-cy="AIDrawerGeneratedImage"
        component="img"
        display="block"
        width="100%"
        height="100%"
        sx={{ objectFit: "cover" }}
        src={`${
          // @ts-ignore
          CONFIG.SERVICE_MEDIA_RESOLVER
        }/resolve/${src}/getimage/?w=200&h=200&type=fit`}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)} // hide spinner if image fails
        style={{ visibility: loading ? "hidden" : "visible" }}
      />
    </Box>
  );
};
