import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Divider,
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
import { useEffect, useRef, useState } from "react";
import { useGeminiGenerationMutation } from "../../services/cloudFunctions";
import { refRegistry } from "../../../engine/refRegistry";
import { enqueueAction } from "../../../engine/queue";
import { CheckCircleRounded } from "@mui/icons-material";
import { useLocation } from "react-router";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { useGetLangsMappingQuery } from "../../services/instance";

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

export const AIDrawer = () => {
  const { pathname } = useLocation();
  const isInContentApp = /^\/content\/[^/]+\/[^/]+$/.test(pathname);
  const isInContentMeta = /^\/content\/[^/]+\/[^/]+\/meta$/.test(pathname);
  const { data: langMappings } = useGetLangsMappingQuery();

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

  const responsesEndRef = useRef(null);

  useEffect(() => {
    responsesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [responses]);

  const registryKeys = Object.keys(refRegistry);

  const systemInstruction = `You are an AI assistant for a CMS system. You must respond in valid **JSON** format only, structured as an **array** of one or more action objects, where each object follows this schema:

{
  "type": "SET_VALUE",
  "payload": {
    "refKey": "<refKey from list below>",
    "value": "<best-fitting value>"
  }
}

---

**Your job:**
Given a user instruction or prompt, return the appropriate JSON actions to populate matching content fields.

- **refKey**: A unique content field identifier in our system.
- **value**: The actual content that best satisfies the user’s intent, written in the tone of **"${
    selectedTone.value
  }"** and in the language **"${selectedLanguage.value}"**.

---

### Matching Logic:

1. Identify all relevant **refKeys** based on the user prompt.
2. Generate one 'SET_VALUE' action per matching refKey.
3. If no match is found, respond with the fallback:

[
  {
    "type": "NO_MATCH",
    "payload": {
      "value": "No field to modify was found. Closest might be '<closestMatch>'"
    }
  }
]

---

### Guidelines for 'value':
- If the prompt asks for **titles, content, or descriptions**, generate high-quality content—not just restating the prompt.
- Adapt tone and language properly.
- If multiple fields seem applicable, use the prompt's cues to prioritize.
- Never include the field context, internal notes, or any explanation in the output.

---

### Available refKeys:  
[${registryKeys}]

Context for refKeys (for your matching logic only – **never include this in output**):  
${JSON.stringify(
  registryKeys.map((x) => `"${x}": "${JSON.stringify(refRegistry[x].context)}"`)
)}

---

⚠️ **Important Output Rules:**
- Return only valid JSON.
- Output must be a single top-level array of valid action objects.
- No comments, markdown, or extra text.
`;

  useEffect(() => {
    if (!aiResponse) return;

    try {
      const cleaned = aiResponse.data.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      const responsesArray = Array.isArray(parsed) ? parsed : [parsed];

      const animateTyping = (response: any, indexInArray: number) => {
        const fullText = response.payload.value;
        let currentText = "";
        let currentIndex = 0;

        const interval = setInterval(() => {
          currentText += fullText[currentIndex];

          setResponses((prev) => {
            const updated = [...prev];
            if (updated[indexInArray]) {
              updated[indexInArray] = {
                ...response,
                payload: { ...response.payload, value: currentText },
              };
            }
            return updated;
          });

          currentIndex++;
          if (currentIndex >= fullText.length) clearInterval(interval);
        }, 20);
      };

      responsesArray.forEach((response) => {
        if (response.type === "USER_INPUT") {
          setResponses((prev) => [...prev, response]);
          return;
        }

        // Push placeholder and animate after it's in state
        setResponses((prev) => {
          const newIndex = prev.length;
          const newResponses = [
            ...prev,
            {
              ...response,
              payload: { value: "", refKey: response.payload.refKey },
            },
          ];
          setTimeout(() => animateTyping(response, newIndex), 0);
          return newResponses;
        });
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
        borderLeft: "2px solid",
        borderColor: "border",
      }}
    >
      {!isInContentApp && !isInContentMeta && (
        <>
          <Typography variant="h6">AI Assistant</Typography>
          <Typography variant="body1">
            AI features only available in content app.
          </Typography>
        </>
      )}
      {(isInContentApp || isInContentMeta) && (
        <>
          <Typography variant="h6" pb={1}>
            AI Content Editor
          </Typography>
          <Box flex="1" overflow="auto">
            {responses.map((response, index) => {
              if (response.type === "USER_INPUT") {
                return (
                  <Box
                    key={index}
                    sx={{
                      padding: 1,
                      borderRadius: 1,
                      marginBottom: 1,
                      maxWidth: "168px",
                      width: "fit-content",
                      color: "white",
                      ml: "auto",
                      backgroundColor: "primary.main",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        wordBreak: "break-word",
                      }}
                    >
                      {response.payload.value}
                    </Typography>
                  </Box>
                );
              }

              return (
                <Box
                  key={index}
                  sx={{
                    padding: 1,
                    borderRadius: 1,
                    marginBottom: 1,
                    border: "1px solid",
                    borderColor: "border",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: "break-word",
                    }}
                  >
                    {response.payload.value}
                  </Typography>
                  <Divider
                    sx={{
                      my: 0.5,
                    }}
                  />
                  {response.type === "SET_VALUE" && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography variant="body3">
                        Apply this response to{" "}
                        {refRegistry?.[response.payload.refKey]?.context
                          ?.label || response.payload.refKey}
                        ?
                      </Typography>
                      <IconButton
                        color="success"
                        onClick={() => {
                          enqueueAction({
                            type: response.type,
                            payload: {
                              refKey: response.payload.refKey,
                              value: response.payload.value,
                            },
                          });
                        }}
                        size="xsmall"
                      >
                        <CheckCircleRounded
                          sx={{
                            height: "16px",
                            width: "16px",
                          }}
                        />
                      </IconButton>
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
            disabled={isLoading}
            placeholder="Ask AI to make edits to your content..."
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                geminiGenerate({
                  prompt: prompt,
                  systemInstruction,
                  temperature: 0.5,
                });
                setResponses((prev) => [
                  ...prev,
                  {
                    type: "USER_INPUT",
                    payload: {
                      value: prompt,
                    },
                  },
                ]);
                setPrompt("");
              }
            }}
          />
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
