import { RefObject } from "react";
import TextField from "@mui/material/TextField";
import {
  Box,
  Typography,
  Autocomplete,
  PaperProps,
  Paper,
  Tooltip,
} from "@mui/material";

import { COLOR_MAP } from "../../configs";
import { getKeyValue, validateUrl } from "../../utils";
import { IntegrationTypes } from "../../../../services/types";

const CustomPaper = ({
  optionsDescription,
  ...props
}: PaperProps & { optionsDescription: string }) => {
  return (
    <Paper
      {...props}
      sx={{
        px: 0,
        py: 1,
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {!!optionsDescription && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 2, pt: 1, pb: 0.5, fontStyle: "italic" }}
        >
          {optionsDescription}
        </Typography>
      )}
      <Box
        sx={{
          width: "100%",

          "& ul.MuiAutocomplete-listbox": {
            py: 0,
          },
        }}
      >
        {props.children}
      </Box>
    </Paper>
  );
};

const KeyPathSelector = ({
  value,
  onChange,
  options,
  placeholder,
  optionsDescription = null,
  data,
  inputRef,
  type,
  restrictedTypes = [],
  name,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  optionsDescription?: string | null;
  data?: any;
  inputRef?: RefObject<HTMLInputElement>;
  type?: IntegrationTypes;
  restrictedTypes?: string[];
  name?: string;
}) => {
  const filteredOpions = !restrictedTypes?.length
    ? options
    : options.filter((option) => {
        const optionValue = getKeyValue(data, option);
        const valueType = typeof optionValue;

        return !restrictedTypes.includes(valueType);
      });

  return (
    <Autocomplete
      data-cy={`integrationKeyPathSelector-${name}`}
      fullWidth
      options={filteredOpions}
      value={value}
      size="small"
      disableClearable
      autoHighlight
      onChange={(_e, value) => {
        onChange(value || "");
      }}
      slots={{
        paper: (props) => (
          <CustomPaper {...props} optionsDescription={optionsDescription} />
        ),
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder || ""}
          inputRef={inputRef}
        />
      )}
      renderOption={(props, option) => {
        const optionValue = !data ? null : getKeyValue(data, option);
        let valueType: string = typeof optionValue;
        valueType =
          valueType === "object"
            ? Array.isArray(optionValue)
              ? "array"
              : "object"
            : valueType;

        const isUrl =
          valueType === "string" && validateUrl(optionValue as string);

        const typeColor =
          COLOR_MAP[valueType as keyof typeof COLOR_MAP] || COLOR_MAP.default;

        const hyphen = valueType === "string" ? '"' : "";

        const stringOptionValue = `${hyphen}${
          typeof optionValue === "object"
            ? JSON.stringify(optionValue, null, 3)
            : optionValue
        }${hyphen}`;

        const tooltipText = `${option}: ${stringOptionValue}`;

        const { key: keyProp, ...otherProps } = props;

        return (
          <li
            key={keyProp}
            {...otherProps}
            style={{
              width: "100%",
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            <Tooltip
              title={tooltipText}
              placement="right-start"
              arrow
              enterDelay={1000}
              enterNextDelay={1000}
              slotProps={{
                popper: {
                  sx: {
                    maxWidth: "500px",
                    maxHeight: "600px",
                    whiteSpace: "pre-wrap",
                    color: "cyan",
                  },
                },
                tooltip: {
                  sx: {
                    maxWidth: "500px",
                    maxHeight: "600px",
                    whiteSpace: "pre-wrap",
                    color: "red",
                  },
                },
              }}
            >
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems={"center"}
                width="100%"
                position="relative"
                boxSizing="border-box"
                whiteSpace="nowrap"
                overflow="hidden"
                sx={{
                  "& .MuiTypography-root, & .MuiChip-label": {
                    fontFamily: "monospace",
                    fontWeight: 400,
                  },
                }}
              >
                <Typography
                  variant="body3"
                  color="text.primary"
                  flexGrow={0}
                  maxWidth="50%"
                  overflow="hidden"
                  textAlign="right"
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                  noWrap
                >
                  {`${option}:`}
                </Typography>

                <Typography
                  variant="body3"
                  color={`${isUrl ? COLOR_MAP.url : typeColor}.600`}
                  flexGrow={1}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  noWrap
                  px={1}
                >
                  {stringOptionValue}
                </Typography>

                <Box
                  component="span"
                  sx={{
                    flexShrink: 0,
                    borderRadius: 1,
                    fontSize: "12px",
                    bgcolor: `${typeColor}.50`,
                    color: `${typeColor}.600`,
                    px: "4px",
                    py: 0,
                  }}
                >
                  {valueType}
                </Box>
              </Box>
            </Tooltip>
          </li>
        );
      }}
    />
  );
};

export default KeyPathSelector;
