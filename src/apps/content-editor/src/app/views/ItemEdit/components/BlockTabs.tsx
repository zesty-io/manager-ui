import { Tabs, Tab, Box } from "@mui/material";
import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { VerticalSplitRounded, InfoRounded } from "@mui/icons-material";
import { Actions } from "../Content/Actions";
import { customTheme } from "../../../ContentEditor";

export const BlockTabs = (props: any) => {
  const [value, setValue] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          borderBottom: (theme) => `2px solid ${theme.palette.border}`,
        }}
      >
        <Tabs
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          sx={{
            position: "relative",
            top: "2px",
          }}
        >
          <Tab
            label="Variants"
            icon={<VerticalSplitRounded fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label="Info"
            icon={<InfoRounded fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </Box>
      {value === 0 && <div>Tab 1</div>}
      {value === 1 && (
        <ThemeProvider theme={customTheme}>
          <Box
            // maxWidth={320}
            pb={3}
            height="100%"
            sx={{
              overflowY: "auto",
            }}
          >
            <Actions
              {...props}
              site={{}}
              set={{
                type: props.model?.type,
              }}
            />
          </Box>
        </ThemeProvider>
      )}
    </ThemeProvider>
  );
};
