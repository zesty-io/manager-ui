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

export const withAI = (WrappedComponent: ComponentType) => (props: any) => {
  const instanceCreatedAt = useSelector(
    (state: AppState) => state.instance.createdAt
  );
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [focused, setFocused] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGenerate = (generatedText: string) => {
    props.onChange(
      { target: { value: `${props.value}${generatedText}` } },
      props.name
    );
  };

  if (moment(instanceCreatedAt).isSameOrAfter(moment(enabledDate))) {
    return (
      <>
        <WrappedComponent
          {...props}
          endLabel={
            <ThemeProvider theme={theme}>
              <IconButton
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
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <AIGenerator
              onApprove={handleGenerate}
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
