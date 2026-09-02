import { FC } from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import notFound from "../../../../../../public/images/notFound.jpg";
import BackupTableRoundedIcon from "@mui/icons-material/BackupTableRounded";
import { useSelector } from "react-redux";
import { State } from "../../../../../shell/store/media-revamp";

interface Props {
  title?: string;
  message?: string;
}

export const NotFoundState: FC<Props> = ({ title, message }) => {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("media.notFoundStateDefaultTitle");
  const resolvedMessage = message ?? t("media.notFoundStateDefaultMessage");
  const history = useHistory();
  const isSelectDialog = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.isSelectDialog
  );
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      textAlign={"center"}
      className="NotFoundState"
    >
      <Box width="400px">
        <img src={notFound} height="320px" />
        <Typography sx={{ mt: 8 }} variant="h4" fontWeight={600}>
          {resolvedTitle}
        </Typography>
        {!isSelectDialog && (
          <>
            <Typography
              sx={{ mt: 1, mb: 3 }}
              variant="body2"
              color="text.secondary"
            >
              {resolvedMessage}
            </Typography>
            <Button
              variant="contained"
              startIcon={<BackupTableRoundedIcon />}
              onClick={() => history.push("/media")}
            >
              {t("media.goToAllMedia")}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};
