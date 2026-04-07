import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  InputLabel,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  useGeminiGenerationMutation,
  useGetChatSessionLogQuery,
  useCreateNewChatSessionMutation,
  useUpdatePromptApprovalStatusMutation,
} from "../../services/mcp";
import { enqueueAction } from "../../../engine/queue";
import {
  ArrowForward,
  ArrowUpwardRounded,
  AutoFixHighRounded,
  ChevronRightRounded,
  NotInterestedRounded,
} from "@mui/icons-material";
import { useLocation } from "react-router";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { useGetLangsMappingQuery } from "../../services/instance";
import { suggestionSystemInstruction } from "./systemInstructions";
import { useLocalStorage } from "react-use";
import { getRefRegistry } from "../../../engine/refRegistry";
import { Brain } from "@zesty-io/material";
import { keyframes } from "@emotion/react";
import geminiLogo from "../../../../public/images/geminiLogo.svg";
import { AppState } from "shell/store/types";
import { useGetUsersRolesQuery } from "shell/services/accounts";
import { ChatPrompt } from "shell/services/types";
import { notify } from "shell/store/notifications";

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
  return prompts.flatMap((promptLog) => {
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

    return [
      {
        type: "USER_INPUT",
        payload: {
          value: promptLog.prompt,
        },
      },
      ...parsedResponses,
    ];
  });
};

const borderMove = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 200%; }
`;

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

type AIDrawerProps = {
  open: boolean;
};
export const AIDrawer = ({ open }: AIDrawerProps) => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const isInContentApp = /^\/content\/[^/]+\/[^/]+$/.test(pathname);
  const isInContentMeta = /^\/content\/[^/]+\/[^/]+\/meta$/.test(pathname);
  const isInBlocks = /^\/blocks\/[^/]+\/[^/]+\/?$/.test(pathname);
  const isInCodeApp = /^\/code\/file\/.+/.test(pathname);
  const user = useSelector((state: AppState) => state.user);
  const { data: roles } = useGetUsersRolesQuery();
  const { data: langMappings } = useGetLangsMappingQuery();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [hasHydratedInitialResponses, setHasHydratedInitialResponses] =
    useState(false);
  const [hydratedResponsesCount, setHydratedResponsesCount] = useState(0);
  const promptInputRef = useRef<HTMLInputElement>(null);

  const zuidMatch = pathname.match(
    /^\/content\/([^/]+)\/([^/]+)(?:\/(meta|seo))?$/
  );
  const { modelZUID, itemZUID } = zuidMatch
    ? { modelZUID: zuidMatch[1], itemZUID: zuidMatch[2] }
    : { modelZUID: undefined, itemZUID: undefined };

  const [urlChatZUID, setUrlChatZUID] = useLocalStorage<string | null>(
    `ai-drawer-${pathname}-chatZUID`,
    null
  );
  const [responses, setResponses] = useState([]);
  const [prompt, setPrompt] = useState("");
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

  const [geminiGenerate, { isLoading, isError, data: aiResponse }] =
    useGeminiGenerationMutation();
  const {
    data: chatSessionLog,
    isLoading: isLoadingChatSessionLog,
    isError: isChatSessionLogError,
  } = useGetChatSessionLogQuery(
    { chatZUID: urlChatZUID, userZUID: user.ZUID },
    {
      skip: !urlChatZUID || !user.ZUID || !open,
    }
  );
  const [createNewChatSession, { isLoading: isCreatingNewChatSession }] =
    useCreateNewChatSessionMutation();
  const [
    updatePromptApprovalStatus,
    { isLoading: isUpdatingPromptApprovalStatus },
  ] = useUpdatePromptApprovalStatusMutation();

  const responsesEndRef = useRef(null);
  const hasAttemptedInitialSessionRef = useRef(false);
  const lastFailedChatSessionZUIDRef = useRef<string | null>(null);

  useEffect(() => {
    if (responsesEndRef.current) {
      responsesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [responses]);

  // Starts a new chat session if the current url doesn't have
  // a chatZUID associated with it yet
  useEffect(() => {
    if (!open || urlChatZUID || hasAttemptedInitialSessionRef.current) {
      return;
    }

    hasAttemptedInitialSessionRef.current = true;
    if (!urlChatZUID) {
      handleStartNewChatSession();
    }
  }, [open, urlChatZUID]);

  // Attempts to start a new chat session when the api call fails
  // due to an invalid chatZUID
  useEffect(() => {
    if (
      !open ||
      !urlChatZUID ||
      !isChatSessionLogError ||
      isCreatingNewChatSession
    ) {
      return;
    }

    if (lastFailedChatSessionZUIDRef.current === urlChatZUID) {
      return;
    }

    lastFailedChatSessionZUIDRef.current = urlChatZUID;
    handleStartNewChatSession();
  }, [
    open,
    urlChatZUID,
    isChatSessionLogError,
    isCreatingNewChatSession,
    roles,
    user?.ZUID,
  ]);

  useEffect(() => {
    if (!open || hasHydratedInitialResponses || isLoadingChatSessionLog) {
      return;
    }

    if (!chatSessionLog) {
      return;
    }

    const restoredResponses = chatSessionLog?.prompts?.length
      ? // Reversing the prompts array before normalizing since the UI needs to render this in
        // ascending order but the data is stored in descending order
        normalizeChatSessionLog([...chatSessionLog?.prompts].reverse())
      : [];
    if (restoredResponses.length) {
      setHydratedResponsesCount(restoredResponses.length);
      setResponses(restoredResponses);
    }

    setHasHydratedInitialResponses(true);
  }, [
    open,
    hasHydratedInitialResponses,
    isLoadingChatSessionLog,
    chatSessionLog,
  ]);

  useEffect(() => {
    if (!aiResponse) return;

    try {
      const parsed =
        typeof aiResponse.data === "string"
          ? parseResponse(aiResponse.data)
          : aiResponse.data;
      const responsesArray = Array.isArray(parsed) ? parsed : [parsed];

      setResponses((prev) => [...prev, ...responsesArray]);

      responsesArray.forEach((response) => {
        if (autoApply && response.type === "SET_VALUE") {
          enqueueAction({
            type: response.type,
            payload: {
              refKey: response.payload.refKey,
              value: response.payload.value,
            },
          });
        }
      });
    } catch (error) {
      console.error("Error parsing AI response", error);
      setResponses((prev) => [
        ...prev,
        {
          type: "ERROR",
          payload: {
            value: "Error parsing AI response. Please try again.",
          },
        },
      ]);
    }
  }, [aiResponse]);

  const handlePrompt = (newPrompt: string) => {
    const registryKeys = Object.keys(getRefRegistry() || {});
    const refRegistry = getRefRegistry();
    const mappedRefRegistry = registryKeys.map(
      (x) => `"${x}": "${JSON.stringify(refRegistry[x].context())}"`
    );
    const temperature = 0.5;

    geminiGenerate({
      prompt: newPrompt,
      tone: selectedTone.value,
      language: selectedLanguage.value,
      modelZuid: modelZUID,
      itemZuid: itemZUID,
      registryKeys,
      refRegistry: mappedRefRegistry,
      filename:
        getRefRegistry()?.["code-editor"]?.context()?.fileName || undefined,
      code: getRefRegistry()?.["code-editor"]?.context()?.code || undefined,
      fields: getRefRegistry()?.["code-editor"]?.context()?.fields || undefined,
      temperature,
      chatZuid: urlChatZUID,
      url: window.location.href,
    });
    setResponses((prev) => [
      ...prev,
      {
        type: "USER_INPUT",
        payload: {
          value: newPrompt,
        },
      },
    ]);
    setPrompt("");
  };

  const handleGenerateSuggestions = () => {
    const systemInstruction = suggestionSystemInstruction(
      Object.keys(getRefRegistry() || {}),
      getRefRegistry()
    );
    const temperature = 0.5;
    const normalizedPrompt = prompt ? prompt.trim() : "";
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
    setResponses((prev) => [
      ...prev,
      {
        type: "USER_INPUT",
        payload: {
          value: promptValue,
        },
      },
    ]);
    setPrompt("");
  };

  const handleStartNewChatSession = () => {
    const userRole = roles?.find((role) => role.ZUID === user.ZUID);

    if (user?.ZUID && userRole?.role?.ZUID) {
      createNewChatSession({
        userZUID: user.ZUID,
        roleZUID: userRole?.role?.ZUID,
      })
        .unwrap()
        .then((response: any) => {
          if (response?.data?.chatZuid) {
            setUrlChatZUID(response?.data?.chatZuid);
          }
          setHydratedResponsesCount(0);
          setResponses([]);
          // setResponsesLS([]);
        })
        .catch(() => {
          dispatch(
            notify({
              message: "Failed to create a new chat session",
              kind: "error",
            })
          );
        });
    } else {
      dispatch(
        notify({
          message: "Failed to create a new chat session",
          kind: "error",
        })
      );
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        minWidth: 300,
        maxWidth: 300,
        px: 2,
        pt: 2,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "2px",
          zIndex: 2,
          background:
            "linear-gradient(180deg, #0ba5ec 0%, #ee46bc 50%, #6938ef 100%)",
          backgroundSize: "100% 200%",
          animation: `${borderMove} 4s linear infinite`,
          pointerEvents: "none",
        },
        bgcolor: "background.paper", // optional: give a bg to cover avatar overflow
      }}
    >
      {!isInContentApp && !isInContentMeta && !isInBlocks && !isInCodeApp && (
        <>
          <Box display="flex" alignItems={"center"} gap={1}>
            <Stack
              width={40}
              height={40}
              borderRadius="50%"
              justifyContent="center"
              alignItems="center"
              sx={{
                background:
                  "linear-gradient(90deg, rgba(11,165,236,1) 0%, rgba(238,70,188,1) 50%, rgba(105,56,239,1) 100%)",
              }}
            >
              <Brain sx={{ color: "common.white" }} />
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
          </Box>
          <Typography variant="body1">
            Only available in content app.
          </Typography>
        </>
      )}
      {(isInContentApp || isInContentMeta || isInBlocks || isInCodeApp) && (
        <>
          <Box
            display="flex"
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Box display="flex" alignItems={"center"} gap={1}>
              <Stack
                width={40}
                height={40}
                borderRadius="50%"
                justifyContent="center"
                alignItems="center"
                sx={{
                  background:
                    "linear-gradient(90deg, rgba(11,165,236,1) 0%, rgba(238,70,188,1) 50%, rgba(105,56,239,1) 100%)",
                }}
              >
                <Brain sx={{ color: "common.white" }} />
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
            </Box>
            <Box display="flex" alignItems={"center"} gap={0.5}>
              <Tooltip title="Clear chat" placement="top">
                <IconButton
                  size="small"
                  color="error"
                  onClick={handleStartNewChatSession}
                >
                  <NotInterestedRounded sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box
            flex="1"
            overflow="auto"
            my={1}
            display="flex"
            flexDirection="column"
            gap={1}
            ref={chatContainerRef}
          >
            {responses.map((response, index) => {
              if (response.type === "USER_INPUT") {
                return (
                  <Box
                    key={index}
                    sx={{
                      padding: 1,
                      borderRadius: 1,
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
                    onClick={() => {
                      setPrompt(response.payload.value);
                      promptInputRef.current?.focus();
                    }}
                    sx={{
                      textAlign: "left",
                      justifyContent: "flex-start",
                      width: "fit-content",
                      padding: 1,
                    }}
                    variant="contained"
                    color="inherit"
                    endIcon={<ChevronRightRounded />}
                  >
                    <AnimatedText
                      text={response.payload.value}
                      animate={index >= hydratedResponsesCount}
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
                <Box key={index}>
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
                      key={index}
                      text={response.payload.value}
                      animate={index >= hydratedResponsesCount && !isInCodeApp}
                      onGrow={() => {
                        if (responsesEndRef.current) {
                          responsesEndRef.current.scrollIntoView({
                            behavior: "smooth",
                          });
                        }
                      }}
                    />
                  )}
                  {response.type === "SET_VALUE" && (
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        size="xsmall"
                        variant="contained"
                        sx={{ ml: "auto", mt: 0.5 }}
                        onClick={() => {
                          enqueueAction({
                            type: response.type,
                            payload: {
                              refKey: response.payload.refKey,
                              value: response.payload.value,
                            },
                          });
                        }}
                        endIcon={<AutoFixHighRounded fontSize="small" />}
                      >
                        Apply
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}
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
          <TextField
            inputRef={promptInputRef}
            disabled={
              isLoading || isLoadingChatSessionLog || isCreatingNewChatSession
            }
            placeholder="Ask AI to make edits to your content..."
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePrompt(prompt);
              }
            }}
          />
          <Box display="flex" justifyContent="space-between" my={0.5}>
            <Button
              size="small"
              variant="contained"
              onClick={handleGenerateSuggestions}
              endIcon={<AutoFixHighRounded />}
            >
              Generate Suggestions
            </Button>
            <Button
              variant="contained"
              onClick={() => handlePrompt(prompt)}
              sx={{
                borderRadius: "24px",
                padding: 0.5,
                minWidth: 0,
              }}
            >
              <ArrowUpwardRounded />
            </Button>
          </Box>
          <Accordion elevation={0} disableGutters>
            <AccordionSummary
              sx={{
                p: 0,
              }}
              expandIcon={
                <ArrowDropDownRoundedIcon sx={{ fontSize: "20px" }} />
              }
            >
              <Box display="flex" gap={0.5} alignContent={"center"}>
                <SettingsRoundedIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Settings
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: 0,
              }}
            >
              <FormGroup>
                <FormControlLabel
                  sx={{
                    mx: 0,
                  }}
                  control={
                    <Switch
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
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Box>
  );
};

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

  return <Typography variant="body2">{displayedText}</Typography>;
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
