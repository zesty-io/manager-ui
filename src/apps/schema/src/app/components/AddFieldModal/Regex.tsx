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
import { useTranslation } from "react-i18next";
import { Errors } from "./views/FieldForm";

type RegexProps = {
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

const getRegexTypeErrorMessageMap = (t: (key: string) => string) => ({
  custom: t("schema.regexNotMatchingPattern"),
  url: t("schema.regexMatchErrorUrl"),
  slug: t("schema.regexMatchErrorSlug"),
  email: t("schema.regexMatchErrorEmail"),
});

const getRegexTypeRestrictErrorMessageMap = (t: (key: string) => string) => ({
  custom: t("schema.regexNotMatchingPattern"),
  url: t("schema.regexRestrictErrorUrl"),
  slug: t("schema.regexRestrictErrorSlug"),
  email: t("schema.regexRestrictErrorEmail"),
});

export const Regex = ({
  onChange,
  regexMatchPattern,
  regexMatchErrorMessage,
  regexRestrictPattern,
  regexRestrictErrorMessage,
  errors,
}: RegexProps) => {
  const { t } = useTranslation();
  const regexTypeErrorMessageMap = getRegexTypeErrorMessageMap(t);
  const regexTypeRestrictErrorMessageMap =
    getRegexTypeRestrictErrorMessageMap(t);
  return (
    <Box>
      <Typography fontWeight={700}>
        {t("schema.regexPatternMatchingRules")}
      </Typography>
      <Typography variant="body3" color="text.secondary" fontWeight={600}>
        {t("schema.regexKnowledgeRequired")}
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
              {t("schema.regexMatchSpecificPattern")}
            </Typography>
            <Typography
              variant="body3"
              color="text.secondary"
              fontWeight="600"
              display="block"
            >
              {t("schema.regexSetMatchExpression")}
            </Typography>
          </Box>
        }
      />
      {regexMatchPattern !== null && (
        <>
          <Box display="flex" gap={2} mt={1} pl={3.5}>
            <Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <InputLabel>{t("schema.regexType")}</InputLabel>
                <Tooltip title={t("schema.regexTypeTooltip")}>
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
                <MenuItem value="custom">
                  {t("schema.regexTypeCustom")}
                </MenuItem>
                <MenuItem value="url">{t("schema.regexTypeUrl")}</MenuItem>
                <MenuItem value="slug">{t("schema.regexTypeSlug")}</MenuItem>
                <MenuItem value="email">{t("schema.regexTypeEmail")}</MenuItem>
              </Select>
            </Box>
            <FormControl fullWidth error={!!errors?.regexMatchPattern}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2" mb={0.5} fontWeight={600}>
                  {t("schema.regexPattern")}
                </Typography>
                <Tooltip title={t("schema.regexPatternTooltip")}>
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
                  {t("schema.regexInvalidHelper")}
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
                  {t("schema.regexCustomErrorMessage")}
                </Typography>
                <Tooltip title={t("schema.regexCustomErrorMessageTooltip")}>
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
              {t("schema.regexRestrictSpecificPattern")}
            </Typography>
            <Typography
              variant="body3"
              color="text.secondary"
              fontWeight="600"
              display="block"
            >
              {t("schema.regexSetRestrictExpression")}
            </Typography>
          </Box>
        }
      />
      {regexRestrictPattern !== null && (
        <>
          <Box display="flex" gap={2} mt={1} pl={3.5}>
            <Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <InputLabel>{t("schema.regexType")}</InputLabel>
                <Tooltip title={t("schema.regexTypeTooltip")}>
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
                <MenuItem value="custom">
                  {t("schema.regexTypeCustom")}
                </MenuItem>
                <MenuItem value="url">{t("schema.regexTypeUrl")}</MenuItem>
                <MenuItem value="slug">{t("schema.regexTypeSlug")}</MenuItem>
                <MenuItem value="email">{t("schema.regexTypeEmail")}</MenuItem>
              </Select>
            </Box>
            <FormControl fullWidth error={!!errors?.regexRestrictPattern}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2" mb={0.5} fontWeight={600}>
                  {t("schema.regexPattern")}
                </Typography>
                <Tooltip title={t("schema.regexPatternTooltip")}>
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
                  {t("schema.regexInvalidHelper")}
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
                  {t("schema.regexCustomErrorMessage")}
                </Typography>
                <Tooltip title={t("schema.regexCustomErrorMessageTooltip")}>
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
