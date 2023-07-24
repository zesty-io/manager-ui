import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import googleAnalyticsIcon from "../../../../../../../../public/images/googleAnalyticsIcon.svg";

type Props = {
  title: string;
  subTitle: string;
  buttons: React.ReactNode;
};

export const AnalyticsDialog = ({ title, subTitle, buttons }: Props) => {
  return (
    <Dialog open sx={{ textAlign: "center" }}>
      <DialogTitle sx={{ p: 6 }}>
        <img src={googleAnalyticsIcon} alt="googleAnalyticsIcon" />
      </DialogTitle>
      <DialogContent sx={{ pb: 3, px: 6 }}>
        <Typography variant="h3" fontWeight="600">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          {subTitle}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", p: 6, pt: 0 }}>
        {buttons}
      </DialogActions>
    </Dialog>
  );
};
