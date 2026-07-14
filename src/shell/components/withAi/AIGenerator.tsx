import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useContext,
  useReducer,
} from "react";
import {
  Button,
  Box,
  InputLabel,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Stack,
  InputAdornment,
  Tooltip,
  alpha,
  ListItemButton,
} from "@mui/material";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { Brain } from "@zesty-io/material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router";

import { notify } from "../../store/notifications";
import openAIBadge from "../../../../public/images/openai-badge.svg";
import { FieldTypeNumber } from "../FieldTypeNumber";
import { useAiGenerationMutation } from "../../services/cloudFunctions";
import {
  useGetContentModelFieldsQuery,
  useGetLangsMappingQuery,
} from "../../services/instance";
import { AppState } from "../../store/types";
import { AIGeneratorContext } from "./AIGeneratorProvider";

const DEFAULT_LIMITS: Record<AIType, number> = {
  text: 150,
  paragraph: 3,
  word: 1500,
  description: 160,
  title: 150,
};
// `value` is sent to the model (do not translate); `labelKey` is the UI label,
// resolved with t() at the render site since this array is module level.
export const TONE_OPTIONS = [
  {
    value: "intriguing",
    labelKey: "shell.toneIntriguing",
  },
  {
    value: "professional",
    labelKey: "shell.toneProfessional",
  },
  { value: "playful", labelKey: "shell.tonePlayful" },
  {
    value: "sensational",
    labelKey: "shell.toneSensational",
  },
  { value: "succint", labelKey: "shell.toneSuccinct" },
] as const;
export type ToneOption =
  | "intriguing"
  | "professional"
  | "playful"
  | "sensational"
  | "succint";

type FieldData = {
  topic?: string;
  audienceDescription: string;
  tone: ToneOption;
  keywords?: string;
  limit?: number;
  language: {
    label: string;
    value: string;
  };
};

// description and title are used for seo meta title & description
type AIType = "text" | "paragraph" | "description" | "title" | "word";
interface Props {
  onApprove: (data: string) => void;
  onClose: (reason: "close" | "insert") => void;
  aiType: AIType;
  label: string;
  fieldZUID: string;
  isAIAssistedFlow: boolean;
}

export const AIGenerator = ({
  onApprove,
  onClose,
  aiType,
  label,
  fieldZUID,
  isAIAssistedFlow,
}: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const isCreateItemPage = location?.pathname?.split("/")?.pop() === "new";
  const [hasFieldError, setHasFieldError] = useState(false);
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const item = useSelector(
    (state: AppState) =>
      state.content[isCreateItemPage ? `new:${modelZUID}` : itemZUID]
  );
  const { data: fields } = useGetContentModelFieldsQuery(
    { modelZUID },
    {
      skip: !modelZUID,
    }
  );
  const [selectedContent, setSelectedContent] = useState<number>(null);
  const request = useRef(null);
  const [fieldData, updateFieldData] = useReducer(
    (state: FieldData, action: Partial<FieldData>) => {
      return {
        ...state,
        ...action,
      };
    },
    {
      topic: "",
      audienceDescription: "",
      tone: "professional",
      keywords: "",
      limit: DEFAULT_LIMITS[aiType],
      language: {
        label: "English (United States)",
        value: "en-US",
      },
    }
  );
  const [data, setData] = useState([]);
  const { data: langMappings } = useGetLangsMappingQuery();
  const [
    lastOpenedZUID,
    updateLastOpenedZUID,
    parameterData,
    updateParameterData,
  ] = useContext(AIGeneratorContext);

  const [aiGenerate, { isLoading, isError, data: aiResponse }] =
    useAiGenerationMutation();

  const allTextFieldContent = useMemo(() => {
    // This is really only needed for seo meta title & description
    // so we skip it for other types
    if (
      (aiType !== "title" && aiType !== "description") ||
      !fields?.length ||
      !Object.keys(item?.data)?.length
    )
      return "";

    const textFieldTypes = [
      "text",
      "wysiwyg_basic",
      "wysiwyg_advanced",
      "article_writer",
      "markdown",
      "textarea",
    ];

    return fields.reduce((accu, curr) => {
      if (!curr.deletedAt && textFieldTypes.includes(curr.datatype)) {
        return (accu = `${accu} ${item.data[curr.name] || ""}`);
      }

      return accu;
    }, "");
  }, [fields, item?.data]);

  const handleGenerate = () => {
    if (aiType === "description" || aiType === "title") {
      request.current = aiGenerate({
        type: aiType,
        lang: fieldData.language.value,
        tone: fieldData.tone,
        audience: fieldData.audienceDescription,
        content: allTextFieldContent,
        keywords: fieldData.keywords,
      });
    } else {
      if (fieldData.topic) {
        request.current = aiGenerate({
          type: aiType,
          length: fieldData.limit,
          phrase: fieldData.topic,
          lang: fieldData.language.value,
          tone: fieldData.tone,
          audience: fieldData.audienceDescription,
        });
      } else {
        setHasFieldError(true);
      }
    }
  };

  useEffect(() => {
    // Used to automatically popuplate the data if they reopened the AI Generator
    // on the same field or if the current field is the metaDescription field and
    // is currently going through the AI assisted flow
    if (
      lastOpenedZUID === fieldZUID ||
      (isAIAssistedFlow && fieldZUID === "metaDescription")
    ) {
      try {
        const key =
          isAIAssistedFlow && fieldZUID === "metaDescription"
            ? "metaTitle"
            : fieldZUID;
        const { topic, audienceDescription, tone, keywords, limit, language } =
          parameterData[key];

        updateFieldData({
          topic,
          audienceDescription,
          tone,
          ...(!!limit && { limit: limit }),
          language,
          keywords,
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, [parameterData, lastOpenedZUID, isAIAssistedFlow]);

  useEffect(() => {
    if (isError) {
      dispatch(
        notify({
          message: aiResponse?.message || t("shell.generationStopped"),
          kind: "error",
        })
      );
    }
  }, [isError]);

  useEffect(() => {
    if (aiResponse?.data) {
      // For description and title, response will be a stringified array
      if (aiType === "description" || aiType === "title") {
        try {
          const responseArr = JSON.parse(aiResponse.data);

          if (Array.isArray(responseArr)) {
            const cleanedResponse = responseArr.map((response) =>
              response?.replace(/^"(.*)"$/, "$1")
            );

            setData(cleanedResponse);
          }
        } catch (err) {
          console.error("Error parsing AI response: ", err);
        }
      } else {
        setData([aiResponse.data.replace(/^"(.*)"$/, "$1")]);
      }
    }
  }, [aiResponse]);

  const languageOptions = Object.entries(langMappings || {})?.map(
    ([value, label]: any) => ({
      label,
      value,
    })
  );

  const handleClose = (reason: "close" | "insert") => {
    // Temporarily save all the inputs when closing the popup so
    // that if they reopen it again, we can repopulate the fields
    updateLastOpenedZUID(fieldZUID);
    updateParameterData({
      [fieldZUID]: {
        topic: fieldData.topic,
        limit: fieldData.limit,
        language: fieldData.language,
        tone: fieldData.tone,
        audienceDescription: fieldData.audienceDescription,
        keywords: fieldData.keywords,
      },
    });

    // Reason is used to determine if the AI assisted flow will be cancelled
    // or not
    onClose(reason);
  };

  // Loading
  if (isLoading) {
    return (
      <Stack
        width={480}
        height={aiType === "title" || aiType === "description" ? 604 : 628}
        position="relative"
        zIndex={2}
      >
        <Stack
          height="100%"
          borderRadius={0.5}
          margin={0.2}
          border={1}
          borderColor="common.white"
          justifyContent="center"
          alignItems="center"
          bgcolor="background.paper"
          p={2.25}
          textAlign="center"
        >
          <Box
            position="absolute"
            top={20}
            right={20}
            component="img"
            src={openAIBadge}
            alt={t("shell.openAiBadgeAlt")}
          />
          <Box position="relative">
            <CircularProgress />
            <Brain
              color="primary"
              fontSize="small"
              sx={{ position: "absolute", top: "10px", left: "10px" }}
            />
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
            {aiType === "title"
              ? t("shell.generatingMetaTitle")
              : aiType === "description"
              ? t("shell.generatingMetaDescription")
              : t("shell.generatingContent")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {aiType === "title"
              ? t("shell.aiScanningMetaTitle")
              : aiType === "description"
              ? t("shell.aiScanningMetaDescription")
              : t("shell.aiGeneratingContentStatus")}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<StopRoundedIcon color="action" />}
            sx={{ mt: 4 }}
            onClick={() => request.current?.abort()}
          >
            {t("shell.stop")}
          </Button>
        </Stack>
      </Stack>
    );
  }

  // Meta Title and Meta Description field types
  if (aiType === "title" || aiType === "description") {
    return (
      <Stack
        width={480}
        height={604}
        position="relative"
        zIndex={2}
        border="2px solid transparent"
        boxSizing="border-box"
      >
        <Stack
          justifyContent="space-between"
          alignItems="center"
          p={2.25}
          gap={1.5}
          bgcolor="background.paper"
          borderRadius="2px 2px 0 0"
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            width="100%"
          >
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
              <Brain sx={{ color: (theme) => theme.palette.common.white }} />
            </Stack>
            <Box
              component="img"
              src={openAIBadge}
              alt={t("shell.openAiBadgeAlt")}
            />
          </Stack>
          <Stack gap={1} width="100%">
            <Typography variant="h5" fontWeight={700}>
              {!!data?.length
                ? aiType === "title"
                  ? t("shell.selectMetaTitle")
                  : t("shell.selectMetaDescription")
                : aiType === "title"
                ? t("shell.generateMetaTitle")
                : t("shell.generateMetaDescription")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {!!data?.length
                ? aiType === "title"
                  ? t("shell.selectMetaTitleHelp")
                  : t("shell.selectMetaDescriptionHelp")
                : aiType === "title"
                ? t("shell.generateMetaTitleHelp")
                : t("shell.generateMetaDescriptionHelp")}
            </Typography>
          </Stack>
        </Stack>
        <Box
          p={2.25}
          bgcolor="grey.50"
          flex={1}
          sx={{
            overflowY: "auto",
            borderTop: 1,
            borderBottom: 1,
            borderColor: "border",
          }}
        >
          {!!data?.length ? (
            <Stack gap={2.5}>
              {data.map((value, index) => (
                <ListItemButton
                  data-cy={`AISuggestion${index + 1}`}
                  key={index}
                  selected={selectedContent === index}
                  onClick={() => setSelectedContent(index)}
                  sx={{
                    borderRadius: 2,
                    border: 1,
                    borderColor: "border",
                    backgroundColor: "common.white",
                    px: 1.5,
                    py: 2,
                    flexDirection: "column",
                    alignItems: "flex-start",

                    "&.Mui-selected": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Typography
                    variant="body3"
                    fontWeight={600}
                    color={
                      selectedContent === index
                        ? "primary.main"
                        : "text.secondary"
                    }
                    textTransform="uppercase"
                    sx={{ mb: 0.5 }}
                  >
                    {t("shell.optionNumber", { number: index + 1 })}
                  </Typography>
                  <Typography
                    variant={aiType === "title" ? "h6" : "body1"}
                    fontWeight={aiType === "title" ? 600 : 400}
                    color="text.primary"
                  >
                    {String(value)}
                  </Typography>
                </ListItemButton>
              ))}
            </Stack>
          ) : (
            <Stack gap={2.5}>
              <Box>
                <InputLabel>{t("shell.describeAudience")}</InputLabel>
                <TextField
                  value={fieldData.audienceDescription}
                  onChange={(evt) =>
                    updateFieldData({ audienceDescription: evt.target.value })
                  }
                  placeholder={t("shell.audiencePlaceholder")}
                  fullWidth
                  autoFocus
                />
              </Box>
              <Box>
                <InputLabel>{t("shell.keywordsToInclude")}</InputLabel>
                <TextField
                  value={fieldData.keywords}
                  onChange={(evt) =>
                    updateFieldData({ keywords: evt.target.value })
                  }
                  placeholder={t("shell.keywordsExamplePlaceholder")}
                  fullWidth
                />
              </Box>
              <Box>
                <Stack direction="row" gap={1} alignItems="center" mb={0.5}>
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
                  onChange={(_, value) =>
                    updateFieldData({ tone: value.value })
                  }
                  getOptionLabel={(option: any) => t(option.labelKey)}
                  value={TONE_OPTIONS.find(
                    (option) => option.value === fieldData.tone
                  )}
                  options={TONE_OPTIONS}
                  renderInput={(params: any) => (
                    <TextField {...params} fullWidth />
                  )}
                />
              </Box>
              <Box>
                <Stack direction="row" gap={1} alignItems="center" mb={0.5}>
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
                  onChange={(event, value) =>
                    updateFieldData({ language: value })
                  }
                  value={fieldData.language as any}
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
            </Stack>
          )}
        </Box>
        <Box
          bgcolor="background.paper"
          p={2.25}
          gap={2}
          display="flex"
          justifyContent={!!data?.length ? "space-between" : "flex-end"}
          borderRadius="0 0 2px 2px"
        >
          <Button
            variant="text"
            color="inherit"
            onClick={() => {
              handleClose("close");
            }}
          >
            {t("common.cancel")}
          </Button>
          {!!data?.length ? (
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => setData(null)}
              >
                {t("shell.regenerate")}
              </Button>
              <Button
                data-cy="AIApprove"
                variant="contained"
                onClick={() => {
                  if (selectedContent !== null) {
                    onApprove(data[selectedContent]);
                    handleClose("insert");
                  }
                }}
                sx={{ ml: 2 }}
                startIcon={<CheckRoundedIcon />}
              >
                {t("shell.insert")}
              </Button>
            </Box>
          ) : (
            <Button
              data-cy="AIGenerate"
              variant="contained"
              onClick={handleGenerate}
            >
              {t("shell.generate")}
            </Button>
          )}
        </Box>
      </Stack>
    );
  }

  // Content item field types
  return (
    <Stack
      width={480}
      height={628}
      position="relative"
      zIndex={2}
      border="2px solid transparent"
      boxSizing="border-box"
    >
      <Stack
        justifyContent="space-between"
        alignItems="center"
        p={2.25}
        gap={1.5}
        bgcolor="background.paper"
        borderRadius="2px 2px 0 0"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          width="100%"
        >
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
            <Brain sx={{ color: (theme) => theme.palette.common.white }} />
          </Stack>
          <Box
            component="img"
            src={openAIBadge}
            alt={t("shell.openAiBadgeAlt")}
          />
        </Stack>
        <Stack gap={1} width="100%">
          <Typography variant="h5" fontWeight={700}>
            {!!data?.length
              ? t("shell.contentGenerated")
              : t("shell.generateContent")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {!!data?.length
              ? t("shell.aiMistakesWarning")
              : t("shell.aiWriteContentSubtitle")}
          </Typography>
        </Stack>
      </Stack>
      <Box
        p={2.25}
        bgcolor="grey.50"
        flex={1}
        sx={{
          overflowY: "auto",
          borderTop: 1,
          borderBottom: 1,
          borderColor: "border",
        }}
      >
        {!!data?.length ? (
          <Box>
            <InputLabel>{t("shell.generatedContent")}</InputLabel>
            <TextField
              value={data[0]}
              onChange={(event) => setData([event.target.value])}
              multiline
              rows={15}
              fullWidth
            />
          </Box>
        ) : (
          <Stack gap={2.5}>
            <Box>
              <InputLabel>{t("shell.topic")} *</InputLabel>
              <TextField
                data-cy="AITopicField"
                value={fieldData.topic}
                onChange={(event) => {
                  if (!!event.target.value) {
                    setHasFieldError(false);
                  }

                  updateFieldData({ topic: event.target.value });
                }}
                placeholder={t("shell.topicPlaceholder")}
                multiline
                rows={3}
                fullWidth
                autoFocus
                error={hasFieldError}
                helperText={hasFieldError && t("shell.fieldRequiredError")}
              />
            </Box>
            <Box>
              <InputLabel>{t("shell.describeAudience")}</InputLabel>
              <TextField
                data-cy="AIAudienceField"
                value={fieldData.audienceDescription}
                onChange={(evt) =>
                  updateFieldData({ audienceDescription: evt.target.value })
                }
                placeholder={t("shell.audiencePlaceholder")}
                fullWidth
              />
            </Box>
            <Box>
              <Stack direction="row" gap={1} alignItems="center" mb={0.5}>
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
                onChange={(_, value) => updateFieldData({ tone: value.value })}
                getOptionLabel={(option: any) => t(option.labelKey)}
                value={TONE_OPTIONS.find(
                  (option) => option.value === fieldData.tone
                )}
                options={TONE_OPTIONS}
                renderInput={(params: any) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Box>
            <Stack direction="row" gap={2.5} width="100%">
              <Box flex={1}>
                <Stack direction="row" gap={1} alignItems="center" mb={0.5}>
                  <InputLabel sx={{ mb: 0 }}>
                    {aiType === "text"
                      ? t("shell.characterLimit")
                      : aiType === "paragraph"
                      ? t("shell.wordLimit")
                      : t("shell.limit")}
                  </InputLabel>
                  <Tooltip
                    title={
                      aiType === "text"
                        ? t("shell.characterLimitTooltip")
                        : t("shell.wordLimitTooltip")
                    }
                    placement="top"
                  >
                    <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
                  </Tooltip>
                </Stack>
                <FieldTypeNumber
                  required={false}
                  name="limit"
                  value={fieldData.limit}
                  onChange={(value) => updateFieldData({ limit: value })}
                  hasError={false}
                />
              </Box>
              <Box flex={1}>
                <Stack direction="row" gap={1} alignItems="center" mb={0.5}>
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
                  onChange={(event, value) =>
                    updateFieldData({ language: value })
                  }
                  value={fieldData.language as any}
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
            </Stack>
          </Stack>
        )}
      </Box>
      <Box
        bgcolor="background.paper"
        p={2.25}
        gap={2}
        display="flex"
        justifyContent={!!data?.length ? "space-between" : "flex-end"}
        borderRadius="0 0 2px 2px"
      >
        <Button
          variant="text"
          color="inherit"
          onClick={() => {
            handleClose("close");
          }}
        >
          {t("common.cancel")}
        </Button>
        {!!data?.length ? (
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => setData(null)}
            >
              {t("shell.regenerate")}
            </Button>
            <Button
              data-cy="AIApprove"
              variant="contained"
              onClick={() => {
                onApprove(data[0]);
                handleClose("insert");
              }}
              sx={{ ml: 2 }}
              startIcon={<CheckRoundedIcon />}
            >
              {t("shell.insert")}
            </Button>
          </Box>
        ) : (
          <Button
            data-cy="AIGenerate"
            variant="contained"
            onClick={handleGenerate}
          >
            {t("shell.generate")}
          </Button>
        )}
      </Box>
    </Stack>
  );
};
