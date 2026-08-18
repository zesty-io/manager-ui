import {
  Autocomplete,
  Box,
  Button,
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
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";
import {
  ArrowForward,
  ArrowUpwardRounded,
  AutoFixHighRounded,
  ChevronRightRounded,
} from "@mui/icons-material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { enqueueAction } from "../../../engine/queue";
import { useGetLangsMappingQuery } from "../../services/instance";
import { AnimatedText } from "./AnimatedText";
import { GeneratedImage } from "./GeneratedImage";
import { PromptComposer, PromptComposerHandle } from "./PromptComposer";
import { useUpdatePromptApprovalStatusMutation } from "../../services/mcp";

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

type LanguageOption = { label: string; value: string };
type ToneOption = { label: string; value: string };

export type ChatThreadProps = {
  responses: Record<string, any[]>;
  setResponses: Dispatch<SetStateAction<Record<string, any[]>>>;
  latestPromptZUIDs: Set<string>;
  autoApply: boolean;
  setAutoApply: (autoApply: boolean) => void;
  isInCodeApp: boolean;
  isLoading: boolean;
  isLoadingChatSessionLog: boolean;
  urlChatZUID: string | undefined;
  removeUrlChatZUID: () => void;
  updatePromptApprovalStatus: ReturnType<
    typeof useUpdatePromptApprovalStatusMutation
  >[0];
  composerSeed: string;
  setComposerSeed: (seed: string) => void;
  selectedLanguage: LanguageOption;
  setSelectedLanguage: (language: LanguageOption) => void;
  selectedTone: ToneOption;
  setSelectedTone: (tone: ToneOption) => void;
  handlePrompt: (value: string) => void;
  handleGenerateSuggestions: (sourcePrompt: string) => void;
  responsesEndRef: MutableRefObject<any>;
};

export const ChatThread = ({
  responses,
  setResponses,
  latestPromptZUIDs,
  autoApply,
  setAutoApply,
  isInCodeApp,
  isLoading,
  isLoadingChatSessionLog,
  urlChatZUID,
  removeUrlChatZUID,
  updatePromptApprovalStatus,
  composerSeed,
  setComposerSeed,
  selectedLanguage,
  setSelectedLanguage,
  selectedTone,
  setSelectedTone,
  handlePrompt,
  handleGenerateSuggestions,
  responsesEndRef,
}: ChatThreadProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasComposerValue, setHasComposerValue] = useState(false);
  const composerRef = useRef<PromptComposerHandle>(null);
  const { data: langMappings } = useGetLangsMappingQuery();

  const languageOptions = Object.entries(langMappings || {})?.map(
    ([value, label]: any) => ({
      label,
      value,
    })
  );

  return (
    <>
      <Box display="flex" flexGrow={1} overflow="auto">
        <Box
          display="block"
          overflow="auto"
          width="100%"
          pl={2}
          sx={{ scrollbarGutter: "stable" }}
        >
          <Box
            flex="1"
            display="flex"
            flexDirection="column"
            gap={2}
            ref={chatContainerRef}
            justifyContent="flex-end"
            // mt={1}
            sx={{
              position: "relative",
              boxSizing: "border-box",
              minHeight: "100%",
              width: "100%",
            }}
          >
            {isLoadingChatSessionLog ? (
              <>
                <Skeleton
                  data-cy="AIDrawerChatSessionLogSkeleton"
                  variant="rounded"
                  width="60%"
                  height={40}
                  sx={{ ml: "auto", borderRadius: 2 }}
                />
                <Skeleton
                  variant="rounded"
                  width="75%"
                  height={64}
                  sx={{ borderRadius: 2 }}
                />
              </>
            ) : (
              Object.entries(responses).map(([promptZUID, promptResponses]) => {
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
                        mt={responseIndex === 0 ? 1 : 0}
                        sx={{
                          borderRadius: 2,
                          maxWidth: "184px",
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
                      <Button
                        data-cy="AIDrawerNavigate"
                        key={`${promptZUID}-${responseIndex}`}
                        variant="contained"
                        sx={{ width: "fit-content" }}
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
                    );
                  }

                  return (
                    <Box
                      key={`${promptZUID}-${responseIndex}`}
                      sx={{
                        maxWidth: response.payload?.value?.startsWith("3-")
                          ? "unset"
                          : 160,
                      }}
                    >
                      {response.payload.refKey && (
                        <Typography
                          variant="body3"
                          fontWeight={600}
                          color="text.disabled"
                          sx={{
                            mb: 1.25,
                          }}
                        >
                          {response.payload.refKey}
                        </Typography>
                      )}
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
                        <Button
                          data-cy="AIDrawerSetValue"
                          variant="contained"
                          sx={{ mt: 1.25 }}
                          disabled={response.approval === "1"}
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
                            // Optimistically mark as approved so the button
                            // disables immediately without waiting for a re-fetch.
                            // `prev` may no longer have this key if the chat
                            // session was switched or cleared before this applies.
                            setResponses((prev) => {
                              if (!prev[promptZUID]) return prev;

                              return {
                                ...prev,
                                [promptZUID]: prev[promptZUID].map((response) =>
                                  response.type === "SET_VALUE"
                                    ? { ...response, approval: "1" }
                                    : response
                                ),
                              };
                            });
                          }}
                          startIcon={<AutoFixHighRounded fontSize="small" />}
                        >
                          Apply
                        </Button>
                      )}
                    </Box>
                  );
                });
              })
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

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        rowGap={1.5}
        px={2}
        mt={1}
      >
        {!Object.entries(responses)?.length && (
          <Button
            disabled={isLoading || isLoadingChatSessionLog}
            data-cy="AIDrawerGenerateSuggestions"
            size="large"
            variant="outlined"
            fullWidth
            onClick={() => handleGenerateSuggestions(composerSeed)}
          >
            Generate Suggestions
          </Button>
        )}
        <PromptComposer
          ref={composerRef}
          seed={composerSeed}
          disabled={isLoading || isLoadingChatSessionLog}
          onSubmit={handlePrompt}
          onHasValueChange={setHasComposerValue}
        />
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        pb={2}
        pt={1.5}
      >
        <Button
          data-cy="AIDrawerClearChat"
          variant="text"
          color="inherit"
          onClick={() => {
            removeUrlChatZUID();
            setResponses({});
          }}
        >
          Clear Chat
        </Button>
        <Box display="flex" gap={1}>
          <IconButton
            data-cy="AIDrawerSettings"
            onClick={() => setSettingsOpen(!settingsOpen)}
            size="small"
          >
            <SettingsRoundedIcon color="action" fontSize="small" />
          </IconButton>

          <Button
            data-cy="AIDrawerSend"
            variant="contained"
            onClick={() => composerRef.current?.submit()}
            disabled={!hasComposerValue || isLoading || isLoadingChatSessionLog}
            sx={{
              flexShrink: 0,
              flexBasis: 32,
              borderRadius: 6,
              padding: 0.5,
              minWidth: 0,
              backgroundColor:
                !hasComposerValue || isLoading || isLoadingChatSessionLog
                  ? "transparent!important"
                  : "primary.main",
              color:
                !hasComposerValue || isLoading || isLoadingChatSessionLog
                  ? "action.active"
                  : "primary.contrastText",
            }}
          >
            <ArrowUpwardRounded fontSize="small" />
          </Button>
        </Box>
      </Box>
      <Collapse
        orientation="vertical"
        collapsedSize={0}
        sx={{
          position: "relative",
          flexShrink: 0,
          px: 2,
          pb: settingsOpen ? 2 : 0,
        }}
        in={settingsOpen}
      >
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
              data-cy="AIDrawerLanguageSelect"
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
            <TextField {...params} data-cy="AIDrawerToneSelect" fullWidth />
          )}
        />
      </Collapse>
    </>
  );
};
