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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useAiGenerationMutation } from "../../services/cloudFunctions";
import { useGetLangsMappingQuery } from "../../services/instance";
import { Brain } from "@zesty-io/material";
import { useDispatch } from "react-redux";
import { notify } from "../../store/notifications";
import openAIBadge from "../../../../public/images/openai-badge.svg";

interface Props {
  onApprove: (data: string) => void;
  onClose: () => void;
  aiType: string;
  label: string;
}

export const AIGenerator = ({ onApprove, onClose, aiType, label }: Props) => {
  const dispatch = useDispatch();
  const [topic, setTopic] = useState("");
  const [limit, setLimit] = useState(aiType === "text" ? "150" : "3");
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
      <Box
        width={480}
        height={600}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box position="relative">
          <CircularProgress />
          <Brain
            color="primary"
            sx={{ position: "absolute", top: "8px", left: "8px" }}
          />
        </Box>
        <Typography variant="h4" fontWeight={600} sx={{ mt: 3 }}>
          Generating Content
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
      </Box>
    );
  }

  return (
    <Stack
      width={480}
      height={600}
      sx={{
        background:
          "linear-gradient(180deg, rgba(255,93,10,1) 0%, rgba(18,183,106,1) 25%, rgba(11,165,236,1) 50%, rgba(238,70,188,1) 75%, rgba(105,56,239,1) 100%)",
      }}
    >
      <Stack
        height="100%"
        borderRadius={0.5}
        margin={0.2}
        border={1}
        borderColor="common.white"
      >
        <Stack
          justifyContent="space-between"
          alignItems="center"
          p={2.5}
          gap={1.5}
          bgcolor="background.paper"
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
          <Stack gap={1}>
            <Typography variant="h5" fontWeight={700}>
              Generate {label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our AI will scan your content and generate your{" "}
              {label?.toLowerCase()} for you based on your parameters set below
            </Typography>
          </Stack>
        </Stack>
        <Box
          p={2.5}
          bgcolor="grey.50"
          flex={1}
          sx={{
            borderTop: 1,
            borderBottom: 1,
            borderColor: "border",
          }}
        >
          {data ? (
            <Box>
              <InputLabel>{label}</InputLabel>
              <TextField
                value={data}
                onChange={(event) => setData(event.target.value)}
                multiline
                rows={8}
                fullWidth
              />
            </Box>
          ) : (
            <>
              <InputLabel>Topic</InputLabel>
              <Typography variant="body2" color="text.secondary">
                Describe what you want the AI to write for you
              </Typography>
              <TextField
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder={`e.g. "Hikes in Washington"`}
                multiline
                rows={2}
                fullWidth
              />
              <Box display="flex" gap={2} mt={1.5}>
                <Box width="100%">
                  {aiType === "text" && (
                    <>
                      <InputLabel>Character Limit</InputLabel>
                      <TextField
                        type="number"
                        value={limit}
                        onChange={(event) => setLimit(event.target.value)}
                        fullWidth
                      />
                    </>
                  )}
                  {aiType === "paragraph" && (
                    <>
                      <InputLabel>Paragraph Limit</InputLabel>
                      <Select
                        value={limit}
                        onChange={(event) => setLimit(event.target.value)}
                        fullWidth
                      >
                        {new Array(6).fill(0).map((_, i) => (
                          <MenuItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  )}
                </Box>
                <Box width="100%">
                  <InputLabel>Language</InputLabel>
                  <Autocomplete
                    disableClearable
                    size="small"
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.value === value.value
                    }
                    onChange={(event, value) => setLanguage(value)}
                    value={language as any}
                    options={languageOptions}
                    renderInput={(params: any) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
        <Box
          bgcolor="background.paper"
          p={2.5}
          gap={2}
          display="flex"
          justifyContent="flex-end"
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
    </Stack>
  );
};
