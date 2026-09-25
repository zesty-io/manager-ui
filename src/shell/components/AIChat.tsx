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
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGeminiGenerationMutation } from "../services/mcp";
import { enqueueAction } from "../../engine/queue";
import {
  ArrowForward,
  ArrowUpwardRounded,
  AutoFixHighRounded,
  ChevronRightRounded,
} from "@mui/icons-material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { useGetLangsMappingQuery } from "../services/instance";
import { suggestionSystemInstruction } from "../views/Shell/systemInstructions";
import { useLocalStorage } from "react-use";
import { getRefRegistry } from "../../engine/refRegistry";
import geminiLogo from "../../../public/images/geminiLogo.svg";
import geminiIcon from "../../../public/images/geminiIcon.svg";
import { isEmpty } from "lodash";
import { countLineChanges } from "../../utility/countLineChanges";

// `value` is the tone instruction sent to the model (do not translate);
// `labelKey` is the short UI label, resolved with t() at the render site.
const TONE_OPTIONS = [
  {
    labelKey: "shell.toneNameIntriguing",
    value: "Intriguing - Curious, mysterious, and thought-provoking",
  },
  {
    labelKey: "shell.toneNameProfessional",
    value: "Professional - Serious, formal, and authoritative",
  },
  {
    labelKey: "shell.toneNamePlayful",
    value: "Playful - Fun, light-hearted, and whimsical",
  },
  {
    labelKey: "shell.toneNameSensational",
    value: "Sensational -  Bold, dramatic, and attention-grabbing",
  },
  {
    labelKey: "shell.toneNameSuccinct",
    value: "Succinct - Clear, factual, with no hyperbole",
  },
] as const;

// Server entries (SET_VALUE, NAVIGATE, SYSTEM_SUGGESTION) plus the ones built
// here: USER_INPUT, MESSAGE (a prose reply), CODE_EDIT (an applied code
// edit's line counts) and ERROR.
type ChatEntry = {
  type: string;
  payload: {
    value?: string;
    refKey?: string;
    path?: string;
    fileName?: string;
    added?: number;
    removed?: number;
  };
};

const toMessage = (value: string): ChatEntry => ({
  type: "MESSAGE",
  payload: { value },
});

// Only shapes the transcript can render get through: every server entry is
// drawn from `payload.value`, except NAVIGATE, which needs `payload.path`.
// Anything else is null, which the caller shows as an ERROR entry.
const toChatEntry = (entry: unknown): ChatEntry | null => {
  if (typeof entry === "string") return entry.trim() ? toMessage(entry) : null;
  if (typeof entry === "number" || typeof entry === "boolean") {
    return toMessage(String(entry));
  }
  if (!entry || typeof entry !== "object") return null;
  const { type, payload } = entry as { type?: unknown; payload?: unknown };
  if (typeof type !== "string" || !payload || typeof payload !== "object") {
    return null;
  }
  const field = type === "NAVIGATE" ? "path" : "value";
  if (typeof (payload as Record<string, unknown>)[field] !== "string") {
    return null;
  }
  return entry as ChatEntry;
};

// The model answers with a ```json-fenced action array, or with prose. Prose
// is a reply, not a parse failure.
const parseAiResponse = (data: unknown): (ChatEntry | null)[] => {
  if (typeof data !== "string") {
    return (Array.isArray(data) ? data : [data]).map(toChatEntry);
  }
  const cleaned = data.replace(/```json|```/g, "").trim();
  if (!cleaned) return [null];
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return [toMessage(cleaned)];
  }
  return (Array.isArray(parsed) ? parsed : [parsed]).map(toChatEntry);
};

export type AIChatProps = {
  onClose: () => void;
  // Scopes the persisted transcript and the record of applied suggestions.
  historyKey: string;
  modelZUID?: string;
  itemZUID?: string;
  placeholder: string;
  // Type out SET_VALUE text as it arrives. Off for whole code files.
  animateValues?: boolean;
  // Apply every SET_VALUE on arrival and hide the Auto Apply switch.
  forceAutoApply?: boolean;
  // Show an applied `code-editor` SET_VALUE as its line counts rather than
  // the whole file.
  summarizeCodeEdits?: boolean;
};

export const AIChatHeader = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  return (
    <Box
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
            alt={t("shell.geminiIconAlt")}
            width="32px"
            display="block"
          />
        </Stack>
        <Box>
          <Box
            component="img"
            src={geminiLogo}
            alt={t("shell.geminiLogoAlt")}
            width="40px"
            display="block"
          />
          <Typography variant="h5" fontWeight={700}>
            {t("shell.aiAssistantBeta")}
          </Typography>
        </Box>
        <IconButton
          data-cy="AIChatClose"
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
  );
};

export const AIChat = ({
  onClose,
  historyKey,
  modelZUID,
  itemZUID,
  placeholder,
  animateValues = true,
  forceAutoApply = false,
  summarizeCodeEdits = false,
}: AIChatProps) => {
  const { t } = useTranslation();
  const { data: langMappings } = useGetLangsMappingQuery();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const promptInputRef = useRef<HTMLInputElement>(null);

  const [responsesLS, setResponsesLS] = useLocalStorage<ChatEntry[]>(
    `ai-drawer-responses-${historyKey}`,
    []
  );
  const [responses, setResponses] = useState(responsesLS || []);
  const [prompt, setPrompt] = useState("");
  const [appliedResponsesLS, setAppliedResponsesLS] = useLocalStorage<
    Record<string, number[]>
  >(`ai-drawer-applied-responses`, { [historyKey]: [] });
  const promptIsEmpty = isEmpty(prompt.trim());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoApplySetting, setAutoApply] = useState(false);
  const autoApply = forceAutoApply || autoApplySetting;

  const [selectedLanguage, setSelectedLanguage] = useState({
    label: "English (United States)",
    value: "en-US",
  });
  const [selectedTone, setSelectedTone] = useState({
    value: "Professional - Serious, formal, and authoritative",
    labelKey: "shell.toneNameProfessional",
  });

  const languageOptions = Object.entries(langMappings || {})?.map(
    ([value, label]: any) => ({
      label,
      value,
    })
  );

  const [geminiGenerate, { isLoading, isError, data: aiResponse }] =
    useGeminiGenerationMutation();

  const responsesEndRef = useRef(null);

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [isInitialMount]);

  useEffect(() => {
    if (responsesEndRef.current) {
      responsesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setResponsesLS(responses);
  }, [responses]);

  useEffect(() => {
    if (!aiResponse) return;

    const parseError: ChatEntry = {
      type: "ERROR",
      payload: {
        value: t("shell.errorParsingAiResponse"),
      },
    };

    try {
      const responsesArray = parseAiResponse(aiResponse.data);

      const transcript = responsesArray.map((response, index) => {
        if (!response) return parseError;
        if (!autoApply || response.type !== "SET_VALUE") return response;

        // Read before the action applies: the handle replaces the file.
        const codeEditor =
          summarizeCodeEdits && response.payload.refKey === "code-editor"
            ? getRefRegistry()["code-editor"]?.context?.()
            : null;

        enqueueAction({
          type: "SET_VALUE",
          payload: {
            refKey: response.payload.refKey,
            value: response.payload.value,
          },
        });

        setAppliedResponsesLS({
          ...appliedResponsesLS,
          [historyKey]: [
            ...(appliedResponsesLS?.[historyKey] || []),
            responses?.length + index,
          ],
        });

        if (!codeEditor) return response;
        return {
          type: "CODE_EDIT",
          payload: {
            fileName: codeEditor.fileName,
            ...countLineChanges(
              codeEditor.code || "",
              response.payload.value || ""
            ),
          },
        };
      });

      setResponses((prev) => [...prev, ...transcript]);
    } catch (error) {
      console.error("Error parsing AI response", error);
      setResponses((prev) => [...prev, parseError]);
    }
  }, [aiResponse]);

  const handlePrompt = (newPrompt: string) => {
    const registryKeys = Object.keys(getRefRegistry() || {});
    const refRegistry = getRefRegistry();

    geminiGenerate({
      prompt: newPrompt,
      tone: selectedTone.value,
      language: selectedLanguage.value,
      modelZuid: modelZUID,
      itemZuid: itemZUID,
      registryKeys: Object.keys(getRefRegistry() || {}),
      refRegistry: registryKeys.map(
        (x) => `"${x}": "${JSON.stringify(refRegistry[x].context())}"`
      ),
      filename:
        getRefRegistry()?.["code-editor"]?.context()?.fileName || undefined,
      code: getRefRegistry()?.["code-editor"]?.context()?.code || undefined,
      fields: getRefRegistry()?.["code-editor"]?.context()?.fields || undefined,
      temperature: 0.5,
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

  const scrollToEnd = () => {
    if (responsesEndRef.current) {
      responsesEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <Box display="flex" flexDirection="column" flex={1} minHeight={0}>
      <AIChatHeader onClose={onClose} />
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
            {responses.map((response, index) => {
              if (response.type === "USER_INPUT") {
                return (
                  <Box
                    data-cy="AIChatUserInput"
                    key={index}
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
                    data-cy="AIChatSuggestion"
                    onClick={() => {
                      setPrompt(response.payload.value);
                      promptInputRef.current?.focus();
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
                      animate={!isInitialMount}
                      onGrow={scrollToEnd}
                    />
                  </Button>
                );
              } else if (response.type === "NAVIGATE") {
                return (
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      data-cy="AIChatNavigate"
                      size="xsmall"
                      variant="contained"
                      sx={{ ml: "auto", mt: 0.5 }}
                      onClick={() => {
                        enqueueAction({
                          type: "NAVIGATE",
                          payload: {
                            path: response.payload.path,
                          },
                        });
                      }}
                      endIcon={<ArrowForward fontSize="small" />}
                    >
                      {t("shell.navigate")}
                    </Button>
                  </Box>
                );
              } else if (response.type === "MESSAGE") {
                return (
                  <Box data-cy="AIChatMessage" key={index}>
                    <AnimatedText
                      text={response.payload.value}
                      animate={!isInitialMount}
                      onGrow={scrollToEnd}
                    />
                  </Box>
                );
              } else if (response.type === "CODE_EDIT") {
                return (
                  <Box data-cy="AIChatCodeEdit" key={index}>
                    <Typography variant="body2">
                      {t("shell.aiCodeEditSummary", {
                        fileName: response.payload.fileName,
                        added: response.payload.added,
                        removed: response.payload.removed,
                      })}
                    </Typography>
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
                      animate={!isInitialMount && animateValues}
                      onGrow={scrollToEnd}
                    />
                  )}
                  {!autoApply && response.type === "SET_VALUE" && (
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        data-cy="AIChatApply"
                        size="xsmall"
                        variant="contained"
                        sx={{ ml: "auto", mt: 0.5 }}
                        disabled={appliedResponsesLS?.[historyKey]?.includes(
                          index
                        )}
                        onClick={() => {
                          enqueueAction({
                            type: "SET_VALUE",
                            payload: {
                              refKey: response.payload.refKey,
                              value: response.payload.value,
                            },
                          });
                          setAppliedResponsesLS({
                            ...appliedResponsesLS,
                            [historyKey]: [
                              ...(appliedResponsesLS?.[historyKey] || []),
                              index,
                            ],
                          });
                        }}
                        startIcon={<AutoFixHighRounded fontSize="small" />}
                      >
                        {t("shell.applyAiSuggestion")}
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}
            <div ref={responsesEndRef} />
            {isLoading && (
              <Box
                data-cy="AIChatLoading"
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
            data-cy="AIChatGenerateSuggestions"
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => {
              geminiGenerate({
                prompt: prompt || "Generate suggestions for my content fields",
                systemInstruction: suggestionSystemInstruction(
                  Object.keys(getRefRegistry() || {}),
                  getRefRegistry()
                ),
                temperature: 0.5,
              });
              setResponses((prev) => [
                ...prev,
                {
                  type: "USER_INPUT",
                  payload: {
                    value: prompt
                      ? `Generate suggestions: ${prompt}`
                      : "Generate suggestions",
                  },
                },
              ]);
              setPrompt("");
            }}
          >
            {t("shell.generateSuggestions")}
          </Button>

          <TextField
            data-cy="AIChatPrompt"
            inputRef={promptInputRef}
            disabled={isLoading}
            placeholder={placeholder}
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
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          my={0.5}
        >
          <Box display="flex" alignItems="flex-start" flexGrow={1}>
            <Button
              data-cy="AIChatClear"
              variant="text"
              color="inherit"
              onClick={() => {
                setResponses([]);
                setResponsesLS([]);
                setAppliedResponsesLS({
                  ...appliedResponsesLS,
                  [historyKey]: [],
                });
              }}
            >
              {t("shell.clearChat")}
            </Button>
          </Box>
          <IconButton
            data-cy="AIChatSettings"
            onClick={() => setSettingsOpen(!settingsOpen)}
            size="small"
          >
            <SettingsRoundedIcon color="action" fontSize="small" />
          </IconButton>

          <Button
            data-cy="AIChatSend"
            variant="contained"
            onClick={() => handlePrompt(prompt)}
            disabled={promptIsEmpty}
            sx={{
              borderRadius: 6,
              padding: 0.5,
              minWidth: 0,
              backgroundColor: promptIsEmpty
                ? "transparent!important"
                : "primary.main",
              color: promptIsEmpty ? "action.active" : "primary.contrastText",
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
            {!forceAutoApply && (
              <FormGroup>
                <FormControlLabel
                  sx={{
                    mx: 0,
                  }}
                  control={
                    <Switch
                      data-cy="AIChatAutoApply"
                      size="small"
                      checked={autoApplySetting}
                      onChange={(e) => setAutoApply(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="subtitle2" color="text.secondary">
                      {t("shell.autoApply")}
                    </Typography>
                  }
                />
              </FormGroup>
            )}
            <Box>
              <Stack direction="row" gap={1} alignItems="center" mt={1}>
                <InputLabel sx={{ mb: 0 }}>{t("shell.language")}</InputLabel>
                <Tooltip
                  title={t("shell.languageGenerationTooltip")}
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
                <InputLabel sx={{ mb: 0 }}>{t("shell.tone")}</InputLabel>
                <Tooltip title={t("shell.toneTooltip")} placement="top">
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
                getOptionLabel={(option: (typeof TONE_OPTIONS)[number]) =>
                  t(option.labelKey)
                }
                options={TONE_OPTIONS}
                renderInput={(params: any) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Box>
          </Box>
        </Collapse>
      </Box>
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
        src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${src}/getimage/?w=200&h=200&type=fit`}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)} // hide spinner if image fails
        style={{ visibility: loading ? "hidden" : "visible" }}
      />
    </Box>
  );
};
