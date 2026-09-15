import { useTranslation } from "react-i18next";
import { TopBar } from "../../components/TopBar";
import { Box } from "@mui/material";
import { MainWrapper } from "../../components/Containers";
import { Head } from "../../../../../../shell/components/Head";

export const HeadTags = (props) => {
  const { t } = useTranslation();
  return (
    <>
      <TopBar title={t("settings.headTagsTitle")} isLoading={false} />
      <Box
        pl={4}
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
        <MainWrapper rowGap={3} fullWidth sx={{ height: "100%" }}>
          <Head resourceZUID={props?.resourceZUID} />
        </MainWrapper>
      </Box>
    </>
  );
};
