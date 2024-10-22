import { useRef, forwardRef, useImperativeHandle } from "react";
import { Popover, Button, IconButton, alpha } from "@mui/material";
import { Brain, theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import { ComponentType, MouseEvent, useState } from "react";
import { useSelector } from "react-redux";
import { keyframes } from "@mui/system";
import moment from "moment-timezone";

import { AppState } from "../../store/types";
import instanceZUID from "../../../utility/instanceZUID";
import { AIGenerator, TONE_OPTIONS } from "./AIGenerator";

const rotateAnimation = keyframes`
	0% {
		background-position: 0% 0%;
	}
	100% {
		background-position: 0% 100%;
	}
`;

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

export const withAI = (WrappedComponent: ComponentType) =>
  forwardRef((props: any, ref) => {
    const instanceCreatedAt = useSelector(
      (state: AppState) => state.instance.createdAt
    );
    const isEnabled =
      moment(instanceCreatedAt).isSameOrAfter(moment(enabledDate)) ||
      enabledZUIDs.includes(instanceZUID);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [focused, setFocused] = useState(false);
    const [key, setKey] = useState(0);
    const aiButtonRef = useRef(null);

    useImperativeHandle(
      ref,
      () => {
        return {
          triggerAIButton() {
            if (!anchorEl) {
              aiButtonRef.current?.scrollIntoView({ behavior: "smooth" });

              // Makes sure that the popup is placed correctly after
              // the scrollIntoView function is ran
              setTimeout(() => {
                aiButtonRef.current?.click();
              }, 500);
            }
          },
        };
      },
      []
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = (reason: "close" | "insert") => {
      if (
        reason === "close" ||
        (reason === "insert" && props.ZUID === "metaDescription")
      ) {
        // Reset the meta details flow type
        props.onResetFlowType?.();
      }
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
          { target: { value: `${props.value || ""}${generatedText}` } },
          props.name
        );
      }
    };

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
                ref={aiButtonRef}
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
            elevation={24}
            onClose={() => {
              console.log("closing ai generator");
              handleClose("close");
            }}
            slotProps={{
              paper: {
                sx: {
                  overflowY: "hidden",

                  "&:after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    background:
                      "linear-gradient(0deg, rgba(255,93,10,1) 0%, rgba(18,183,106,1) 25%, rgba(11,165,236,1) 50%, rgba(238,70,188,1) 75%, rgba(105,56,239,1) 100%)",
                    animation: `${rotateAnimation} 1.5s linear alternate infinite`,
                    backgroundSize: "300% 300%",
                  },
                },
              },
            }}
          >
            <AIGenerator
              fieldZUID={props.ZUID}
              onApprove={handleApprove}
              onClose={(reason) => handleClose(reason)}
              aiType={props.aiType}
              label={props.label}
              isAIAssistedFlow={props.isAIAssistedFlow}
            />
          </Popover>
        </ThemeProvider>
      </>
    );
  });
