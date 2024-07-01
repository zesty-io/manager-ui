import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Select,
  InputLabel,
  MenuItem,
  TextField,
  FormControl,
  FormHelperText,
  Link,
  Tooltip,
} from "@mui/material";
import { InfoRounded } from "@mui/icons-material";
import { Errors } from "./views/FieldForm";

type RegexProps = {
  type: "text" | "textarea";
  isCharacterLimitEnabled: boolean;
  onToggleCharacterLimitState: (enabled: boolean) => void;
  onChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: string;
  }) => void;
  regexMatchPattern: string;
  regexMatchErrorMessage: string;
  regexRestrictPattern: string;
  regexRestrictErrorMessage: string;
  errors: Errors;
};

const regexTypePatternMap = {
  custom: "",
  url: "^(http://www\\.|https://www\\.|http://|https://)?[a-z0-9]+([-.][a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$",
  slug: "^[a-z0-9]+(?:[-/][a-z0-9]+)*$",
  email:
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
} as const;

const regexTypeErrorMessageMap = {
  custom: "Not matching expected pattern",
  url: "Must be a URL (e.g. https://www.google.com/)",
  slug: "Must be a slug (e.g. everything-about-content-marketing)",
  email: "Must be an email (e.g. hello@zesty.io)",
} as const;

const regexTypeRestrictErrorMessageMap = {
  custom: "Not matching expected pattern",
  url: "Cannot be a URL (e.g. https://www.google.com/)",
  slug: "Cannot be a slug (e.g. everything-about-content-marketing)",
  email: "Cannot be an email (e.g. hello@zesty.io)",
} as const;

export const Regex = ({
  onChange,
  regexMatchPattern,
  regexMatchErrorMessage,
  regexRestrictPattern,
  regexRestrictErrorMessage,
  errors,
}: RegexProps) => {
  return (
    <Box>
      <Typography fontWeight={700}>Regex Pattern Matching Rules</Typography>
      <Typography variant="body3" color="text.secondary" fontWeight={600}>
        Knowledge of Regular Expressions (Regex) is required. Entering incorrect
        regex patterns may prevent content fields from accepting user inputs.
      </Typography>
      <FormControlLabel
        sx={{
          mt: 2.5,
          alignItems: "flex-start",
        }}
        control={
          <Checkbox
            data-cy="RegexCheckbox"
            checked={regexMatchPattern !== null}
            size="small"
            onChange={(evt) => {
              if (evt.target.checked) {
                onChange({ inputName: "regexMatchPattern", value: "" });
                onChange({
                  inputName: "regexMatchErrorMessage",
                  value: regexTypeErrorMessageMap["custom"],
                });
              } else {
                onChange({ inputName: "regexMatchPattern", value: null });
                onChange({ inputName: "regexMatchErrorMessage", value: null });
              }
            }}
          />
        }
        label={
          <Box>
            <Typography variant="body2" fontWeight="600">
              Match a specific pattern
            </Typography>
            <Typography
              variant="body3"
              color="text.secondary"
              fontWeight="600"
              display="block"
            >
              Set the regular expression (e.g. email, URL, etc) the input should
              match
            </Typography>
          </Box>
        }
      />
      {regexMatchPattern !== null && (
        <>
          <Box display="flex" gap={2} mt={1} pl={3.5}>
            <Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <InputLabel>Type</InputLabel>
                <Tooltip title="Select from a list of preset Regex pattern types or write your own custom Regex pattern">
                  <InfoRounded
                    color="action"
                    sx={{
                      height: "12px",
                      width: "12px",
                    }}
                  />
                </Tooltip>
              </Box>
              <Select
                sx={{
                  width: 120,
                  "& .MuiSelect-select": {
                    color: (theme) =>
                      `${theme.palette.text.primary} !important`,
                  },
                }}
                MenuProps={{
                  MenuListProps: {
                    sx: {
                      minWidth: "unset",
                    },
                  },
                }}
                data-cy="RegexMatchPatternSelect"
                value={
                  Object.keys(regexTypePatternMap).find(
                    (key) =>
                      regexTypePatternMap[
                        key as keyof typeof regexTypePatternMap
                      ] === regexMatchPattern
                  ) || "custom"
                }
                onChange={(evt) => {
                  onChange({
                    inputName: "regexMatchPattern",
                    value:
                      regexTypePatternMap[
                        evt.target.value as keyof typeof regexTypePatternMap
                      ],
                  });
                  onChange({
                    inputName: "regexMatchErrorMessage",
                    value:
                      regexTypeErrorMessageMap[
                        evt.target
                          .value as keyof typeof regexTypeErrorMessageMap
                      ],
                  });
                }}
                displayEmpty
              >
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="url">URL</MenuItem>
                <MenuItem value="slug">Slug</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </Box>
            <FormControl fullWidth error={!!errors?.regexMatchPattern}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2" mb={0.5} fontWeight={600}>
                  Pattern
                </Typography>
                <Tooltip title="Enter a regular expression (regex) pattern - a sequence of characters used for pattern matching in strings">
                  <InfoRounded
                    color="action"
                    sx={{
                      height: "12px",
                      width: "12px",
                    }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                data-cy="RegexMatchPatternInput"
                value={regexMatchPattern}
                onChange={(evt) => {
                  onChange({
                    inputName: "regexMatchPattern",
                    value: evt.target.value,
                  });
                  if (
                    Object.keys(regexTypePatternMap).find(
                      (key) =>
                        regexTypePatternMap[
                          key as keyof typeof regexTypePatternMap
                        ] === regexMatchPattern
                    )
                  ) {
                    onChange({
                      inputName: "regexMatchErrorMessage",
                      value: regexTypeErrorMessageMap["custom"],
                    });
                  }
                }}
              />
              {errors?.regexMatchPattern && (
                <FormHelperText>
                  Regex provided is not valid. <br /> Please{" "}
                  <Link href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions">
                    review regex documentation on MDN.
                  </Link>
                </FormHelperText>
              )}
            </FormControl>
          </Box>
          <Box width="100%" display="flex">
            <FormControl
              fullWidth
              sx={{
                mt: 1,
                ml: 3.5,
              }}
              error={!!errors?.regexMatchErrorMessage}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2" mb={0.5} fontWeight={600}>
                  Custom Error Message *
                </Typography>
                <Tooltip title="Displays if the user enters an input that does not meet the requirements">
                  <InfoRounded
                    color="action"
                    sx={{
                      height: "12px",
                      width: "12px",
                    }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                data-cy="RegexMatchErrorMessageInput"
                value={regexMatchErrorMessage}
                onChange={(evt) => {
                  onChange({
                    inputName: "regexMatchErrorMessage",
                    value: evt.target.value,
                  });
                }}
              />
              <FormHelperText>{errors?.regexMatchErrorMessage}</FormHelperText>
            </FormControl>
          </Box>
        </>
      )}
      <FormControlLabel
        sx={{
          mt: 2.5,
          alignItems: "flex-start",
        }}
        control={
          <Checkbox
            data-cy="RegexCheckbox"
            checked={regexRestrictPattern !== null}
            size="small"
            onChange={(evt) => {
              if (evt.target.checked) {
                onChange({ inputName: "regexRestrictPattern", value: "" });
                onChange({
                  inputName: "regexRestrictErrorMessage",
                  value: regexTypeRestrictErrorMessageMap["custom"],
                });
              } else {
                onChange({ inputName: "regexRestrictPattern", value: null });
                onChange({
                  inputName: "regexRestrictErrorMessage",
                  value: null,
                });
              }
            }}
          />
        }
        label={
          <Box>
            <Typography variant="body2" fontWeight="600">
              Restrict a specific pattern
            </Typography>
            <Typography
              variant="body3"
              color="text.secondary"
              fontWeight="600"
              display="block"
            >
              Set the regular expression (e.g. email, URL, etc) the input should
              not match
            </Typography>
          </Box>
        }
      />
      {regexRestrictPattern !== null && (
        <>
          <Box display="flex" gap={2} mt={1} pl={3.5}>
            <Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <InputLabel>Type</InputLabel>
                <Tooltip title="Select from a list of preset Regex pattern types or write your own custom Regex pattern">
                  <InfoRounded
                    color="action"
                    sx={{
                      height: "12px",
                      width: "12px",
                    }}
                  />
                </Tooltip>
              </Box>
              <Select
                sx={{
                  width: 120,
                  "& .MuiSelect-select": {
                    color: (theme) =>
                      `${theme.palette.text.primary} !important`,
                  },
                }}
                MenuProps={{
                  MenuListProps: {
                    sx: {
                      minWidth: "unset",
                    },
                  },
                }}
                data-cy="RegexRestrictPatternSelect"
                value={
                  Object.keys(regexTypePatternMap).find(
                    (key) =>
                      regexTypePatternMap[
                        key as keyof typeof regexTypePatternMap
                      ] === regexRestrictPattern
                  ) || "custom"
                }
                onChange={(evt) => {
                  onChange({
                    inputName: "regexRestrictPattern",
                    value:
                      regexTypePatternMap[
                        evt.target.value as keyof typeof regexTypePatternMap
                      ],
                  });
                  onChange({
                    inputName: "regexRestrictErrorMessage",
                    value:
                      regexTypeRestrictErrorMessageMap[
                        evt.target
                          .value as keyof typeof regexTypeRestrictErrorMessageMap
                      ],
                  });
                }}
                displayEmpty
              >
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="url">URL</MenuItem>
                <MenuItem value="slug">Slug</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </Box>
            <FormControl fullWidth error={!!errors?.regexRestrictPattern}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2" mb={0.5} fontWeight={600}>
                  Pattern
                </Typography>
                <Tooltip title="Enter a regular expression (regex) pattern - a sequence of characters used for pattern matching in strings">
                  <InfoRounded
                    color="action"
                    sx={{
                      height: "12px",
                      width: "12px",
                    }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                data-cy="RegexRestrictPatternInput"
                value={regexRestrictPattern}
                onChange={(evt) => {
                  onChange({
                    inputName: "regexRestrictPattern",
                    value: evt.target.value,
                  });
                  if (
                    Object.keys(regexTypePatternMap).find(
                      (key) =>
                        regexTypePatternMap[
                          key as keyof typeof regexTypePatternMap
                        ] === regexRestrictPattern
                    )
                  ) {
                    onChange({
                      inputName: "regexRestrictErrorMessage",
                      value: regexTypeRestrictErrorMessageMap["custom"],
                    });
                  }
                }}
              />
              {errors?.regexRestrictPattern && (
                <FormHelperText>
                  Regex provided is not valid. <br /> Please{" "}
                  <Link href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions">
                    review regex documentation on MDN.
                  </Link>
                </FormHelperText>
              )}
            </FormControl>
          </Box>
          <Box width="100%" display="flex">
            <FormControl
              fullWidth
              sx={{
                mt: 1,
                ml: 3.5,
              }}
              error={!!errors?.regexRestrictErrorMessage}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2" mb={0.5} fontWeight={600}>
                  Custom Error Message *
                </Typography>
                <Tooltip title="Displays if the user enters an input that does not meet the requirements">
                  <InfoRounded
                    color="action"
                    sx={{
                      height: "12px",
                      width: "12px",
                    }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                data-cy="RegexRestrictErrorMessageInput"
                value={regexRestrictErrorMessage}
                onChange={(evt) => {
                  onChange({
                    inputName: "regexRestrictErrorMessage",
                    value: evt.target.value,
                  });
                }}
              />
              <FormHelperText>
                {errors?.regexRestrictErrorMessage}
              </FormHelperText>
            </FormControl>
          </Box>
        </>
      )}
    </Box>
  );
};
