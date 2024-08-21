import { memo, useMemo } from "react";
import { Popover, Button, IconButton, alpha } from "@mui/material";
import { Brain, theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import { ComponentType, MouseEvent, useState } from "react";
import { AIGenerator } from "./AIGenerator";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";
import moment from "moment-timezone";
import instanceZUID from "../../../utility/instanceZUID";

// This date is used determine if the AI feature is enabled
const enabledDate = "2023-01-13";
// This array is used to determine if the AI feature is enabled for a specific instance ZUID
const enabledZUIDs = [
  "8-ccaa9ae88b-j7gv1p",
  "8-da90a8a6fd-mz0q4d",
  "8-8afecde885-314dm",
  "8-dad89bd3a5-q7wz9h",
];

const paragraphFormat = (text: string) => {
  return `<p>${text
    .split(/\n/)
    .filter((s) => s)
    .join("</p><p>")}</p>`;
};

export const withAI = (WrappedComponent: ComponentType) => (props: any) => {
  const instanceCreatedAt = useSelector(
    (state: AppState) => state.instance.createdAt
  );
  const isEnabled =
    moment(instanceCreatedAt).isSameOrAfter(moment(enabledDate)) ||
    enabledZUIDs.includes(instanceZUID);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [key, setKey] = useState(0);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApprove = (generatedText: string) => {
    if (
      props.datatype === "article_writer" ||
      props.datatype === "markdown" ||
      props.datatype === "wysiwyg_advanced" ||
      props.datatype === "wysiwyg_basic"
    ) {
      props.onChange(
        `${props.value || ""}${
          props.datatype === "markdown"
            ? generatedText
            : paragraphFormat(generatedText)
        }`,
        props.name,
        props.datatype
      );
      // Force re-render after appending generated AI text due to uncontrolled component
      setKey(key + 1);
    } else {
      props.onChange(
        { target: { value: `${props.value}${generatedText}` } },
        props.name
      );
    }
  };

  if (isEnabled) {
    return (
      <>
        <WrappedComponent
          {...props}
          key={key}
          endLabel={
            <ThemeProvider theme={theme}>
              <Button
                data-cy="AIOpen"
                size="xsmall"
                endIcon={<Brain />}
                variant="text"
                color="inherit"
                onClick={handleClick}
                sx={{
                  backgroundColor: (theme) =>
                    Boolean(anchorEl)
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                  minWidth: 0,
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: "14px",
                  px: 0.5,
                  py: 0.25,
                  color: Boolean(anchorEl) ? "primary.main" : "text.disabled",

                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  },

                  "&:hover .MuiButton-endIcon .MuiSvgIcon-root": {
                    fill: (theme) => theme.palette.primary.main,
                  },

                  "& .MuiButton-endIcon": {
                    ml: 0.5,
                    mr: 0,
                  },

                  "& .MuiButton-endIcon .MuiSvgIcon-root": {
                    fontSize: 16,
                    fill: (theme) =>
                      Boolean(anchorEl)
                        ? theme.palette.primary.main
                        : theme.palette.action.active,
                  },
                }}
              >
                AI
              </Button>
            </ThemeProvider>
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <ThemeProvider theme={theme}>
          <Popover
            data-cy="AIPopover"
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <AIGenerator
              onApprove={handleApprove}
              onClose={handleClose}
              aiType={props.aiType}
              label={props.label}
            />
          </Popover>
        </ThemeProvider>
      </>
    );
  } else {
    return <WrappedComponent {...props} />;
  }
};
