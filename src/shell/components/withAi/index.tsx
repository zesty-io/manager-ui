import { Popover, IconButton } from "@mui/material";
import { Brain, theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import { ComponentType, useState } from "react";
import { AIGenerator } from "./AIGenerator";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";
import moment from "moment-timezone";

// This date is used determine if the AI feature is enabled
const enabledDate = "2023-01-13";

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

  if (moment(instanceCreatedAt).isSameOrBefore(moment(enabledDate))) {
    return (
      <>
        <WrappedComponent
          {...props}
          key={key}
          endLabel={
            <ThemeProvider theme={theme}>
              <IconButton
                data-cy="AIOpen"
                color="primary"
                sx={{
                  svg: {
                    color: (theme) =>
                      focused
                        ? "primary.main"
                        : `${theme.palette.action.active}`,
                  },
                  "svg:hover": {
                    color: "primary.main",
                  },
                }}
                onClick={handleClick}
                size="small"
              >
                <Brain fontSize="small" />
              </IconButton>
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
