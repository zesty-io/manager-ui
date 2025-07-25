import { TopBar } from "../../components/TopBar";
import { Box } from "@mui/material";
import { MainWrapper } from "../../components/Containers";
import { Head } from "../../../../../../shell/components/Head";

export const HeadTags = (props) => {
  return (
    <>
      <TopBar title="Head Tags" isLoading={false} />
      <Box
        px="32px"
        py="16px"
        sx={{
          width: "100%",
          height: "calc(100% - 84px)",
          overflowY: "auto",
          overflowX: "hidden",
          margin: "0",
          display: "block",
          maxHeight: "calc(100% - 84px)",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <MainWrapper rowGap={3} fullWidth>
          <Head resourceZUID={props?.resourceZUID} />
        </MainWrapper>
      </Box>
    </>
  );
};
