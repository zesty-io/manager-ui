import { Box } from "@mui/material";
import { Sidebar } from "./components/Sidebar";
import CustomApp from "./view/CustomApp";
import { ResizableContainer } from "../../../../shell/components/ResizeableContainer";

export const MarketplaceWrapper = () => {
  return (
    <Box
      sx={{
        color: "text.primary",
        backgroundColor: "background.paper",
        height: "100%",
        display: "flex",
        "*": {
          boxSizing: "border-box",
        },
      }}
    >
      <ResizableContainer
        id="appsNav"
        defaultWidth={220}
        minWidth={220}
        maxWidth={360}
      >
        <Sidebar />
      </ResizableContainer>
      <CustomApp />
    </Box>
  );
};
