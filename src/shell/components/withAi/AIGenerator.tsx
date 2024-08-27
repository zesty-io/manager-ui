import { useEffect, useState, useRef } from "react";
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
} from "@mui/material";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useAiGenerationMutation } from "../../services/cloudFunctions";
import { useGetLangsMappingQuery } from "../../services/instance";
import { Brain } from "@zesty-io/material";
import { useDispatch } from "react-redux";
import { notify } from "../../store/notifications";
import openAIBadge from "../../../../public/images/openai-badge.svg";
import { FieldTypeNumber } from "../FieldTypeNumber";

const DEFAULT_LIMITS: Record<AIType, number> = {
  text: 150,
  paragraph: 1500,
  description: 160,
  title: 150,
};
const TONE_OPTIONS = {
  intriguing: "Intriguing - Curious, mysterious, and thought-provoking",
  professional: "Professional - Serious, formal, and authoritative",
  playful: "Playful - Fun, light-hearted, and whimsical",
  sensational: "Sensational -  Bold, dramatic, and attention-grabbing",
  succint: "Succinct - Clear, factual, with no hyperbole",
};

type AIType = "text" | "paragraph" | "description" | "title";
interface Props {
  onApprove: (data: string) => void;
  onClose: () => void;
  aiType: AIType;
  label: string;
}

export const AIGenerator = ({ onApprove, onClose, aiType, label }: Props) => {
  const dispatch = useDispatch();
  const [topic, setTopic] = useState("");
  const [audienceDescription, setAudienceDescription] = useState("");
  const [tone, setTone] = useState<keyof typeof TONE_OPTIONS>("professional");
  const [limit, setLimit] = useState(DEFAULT_LIMITS[aiType]);
  const request = useRef(null);
  const [language, setLanguage] = useState({
    label: "English (United States)",
    value: "en-US",
  });

  const [data, setData] = useState("");
  const { data: langMappings } = useGetLangsMappingQuery();

  const [aiGenerate, { isLoading, isError, data: aiResponse }] =
    useAiGenerationMutation();

  const handleGenerate = () => {
    // TODO: Add the new fields to the api call
    request.current = aiGenerate({
      type: aiType,
      length: limit,
      phrase: topic,
      lang: language.value,
    });
  };

  useEffect(() => {
    if (isError) {
      dispatch(
        notify({
          message: aiResponse?.message || "Generation has been stopped",
          kind: "error",
        })
      );
    }
  }, [isError]);

  useEffect(() => {
    if (aiResponse?.data) {
      setData(aiResponse.data);
    }
  }, [aiResponse]);

  const languageOptions = Object.entries(langMappings || {})?.map(
    ([value, label]: any) => ({
      label,
      value,
    })
  );

  if (isLoading) {
    return (
      <Stack width={480} height={628} position="relative" zIndex={2}>
        <Stack
          height="100%"
          borderRadius={0.5}
          margin={0.2}
          border={1}
          borderColor="common.white"
          justifyContent="center"
          alignItems="center"
          bgcolor="background.paper"
          p={2.5}
          textAlign="center"
        >
          <Box
            position="absolute"
            top={22}
            right={22}
            component="img"
            src={openAIBadge}
            alt="OpenAI Badge"
          />
          <Box position="relative">
            <CircularProgress />
            <Brain
              color="primary"
              sx={{ position: "absolute", top: "8px", left: "8px" }}
            />
          </Box>
          <Typography variant="h4" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
            Generating Content
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI assistant is generating your content based on your parameters
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<StopRoundedIcon color="action" />}
            sx={{ mt: 3 }}
            onClick={() => request.current?.abort()}
          >
            Stop
          </Button>
        </Stack>
      </Stack>
    );
  }

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
        p={2.5}
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
          <Box component="img" src={openAIBadge} alt="OpenAI Badge" />
        </Stack>
        <Stack gap={1} width="100%">
          <Typography variant="h5" fontWeight={700}>
            {!!data ? "Your Content is Generated!" : "Generate Content"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {!!data
              ? "Our AI assistant can make mistakes. Please check important info."
              : "Use our AI assistant to write content for you"}
          </Typography>
        </Stack>
      </Stack>
      <Box
        p={2.5}
        bgcolor="grey.50"
        flex={1}
        sx={{
          overflowY: "auto",
          borderTop: 1,
          borderBottom: 1,
          borderColor: "border",
        }}
      >
        {!!data ? (
          <Box>
            <InputLabel>{label}</InputLabel>
            <TextField
              value={data}
              onChange={(event) => setData(event.target.value)}
              multiline
              rows={15}
              fullWidth
            />
          </Box>
        ) : (
          <Stack gap={2.5}>
            <Box>
              <InputLabel>Topic</InputLabel>
              <TextField
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder={`e.g. Hikes in Washington`}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
            <Box>
              <InputLabel>Describe your Audience</InputLabel>
              <TextField
                value={audienceDescription}
                onChange={(evt) => setAudienceDescription(evt.target.value)}
                placeholder="e.g. Freelancers, Designers, ....."
                fullWidth
              />
            </Box>
            <Box>
              <Stack direction="row" gap={1} alignItems="center" mb={0.5}>
                <InputLabel sx={{ mb: 0 }}>Tone</InputLabel>
                <Tooltip title="lorem ipsum" placement="top">
                  <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
                </Tooltip>
              </Stack>
              <Select
                value={tone}
                onChange={(evt) =>
                  setTone(evt.target.value as keyof typeof TONE_OPTIONS)
                }
                fullWidth
              >
                {Object.entries(TONE_OPTIONS).map(([value, text]) => (
                  <MenuItem value={value}>{text}</MenuItem>
                ))}
              </Select>
            </Box>
            <Stack direction="row" gap={2} width="100%">
              <Box flex={1}>
                <Stack direction="row" gap={1} alignItems="center" mb={0.5}>
                  <InputLabel sx={{ mb: 0 }}>
                    {aiType === "text" && "Character"}
                    {aiType === "paragraph" && "Word"} Limit
                  </InputLabel>
                  <Tooltip title="lorem ipsum" placement="top">
                    <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
                  </Tooltip>
                </Stack>
                <FieldTypeNumber
                  required={false}
                  name="limit"
                  value={limit}
                  onChange={(value) => setLimit(value)}
                  hasError={false}
                />
              </Box>
              <Box flex={1}>
                <Stack direction="row" gap={1} alignItems="center" mb={0.5}>
                  <InputLabel sx={{ mb: 0 }}>Language</InputLabel>
                  <Tooltip title="lorem ipsum" placement="top">
                    <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
                  </Tooltip>
                </Stack>
                <Autocomplete
                  disableClearable
                  isOptionEqualToValue={(option: any, value: any) =>
                    option.value === value.value
                  }
                  onChange={(event, value) => setLanguage(value)}
                  value={language as any}
                  options={languageOptions}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <LanguageRoundedIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        maxHeight: 300,
                      },
                    },
                  }}
                />
              </Box>
            </Stack>
          </Stack>
        )}
      </Box>
      <Box
        bgcolor="background.paper"
        p={2.5}
        gap={2}
        display="flex"
        justifyContent="flex-end"
        borderRadius="0 0 2px 2px"
      >
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        {data ? (
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => setData(null)}
            >
              Generate Again
            </Button>
            <Button
              data-cy="AIApprove"
              variant="contained"
              onClick={() => {
                onApprove(data);
                onClose();
              }}
              sx={{ ml: 2 }}
              startIcon={<CheckRoundedIcon />}
            >
              Approve
            </Button>
          </Box>
        ) : (
          <Button
            data-cy="AIGenerate"
            variant="contained"
            onClick={handleGenerate}
            disabled={!topic}
          >
            Generate
          </Button>
        )}
      </Box>
    </Stack>
  );
};
