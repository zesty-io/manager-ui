import {
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
} from "@mui/material";
import { useState } from "react";
import { startCase } from "lodash";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import headlessLogos from "../../../../../../../public/images/headlessLogos.jpg";
import hybridLogos from "../../../../../../../public/images/hybridLogos.jpg";
import { InstanceSetting } from "../../../../../../shell/services/types";
import { useUpdateInstanceSettingMutation } from "../../../../../../shell/services/instance";
import { useTranslation } from "react-i18next";

type Props = {
  instanceSetting: InstanceSetting;
};

export const HeadlessSwitcher = ({ instanceSetting }: Props) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<"hybrid" | "headless" | null>(null);
  const [updateInstanceSetting, { isLoading }] =
    useUpdateInstanceSettingMutation();

  const handleSwitch = () => {
    updateInstanceSetting({
      ...instanceSetting,
      value: selected,
      options: instanceSetting?.options?.replaceAll(",", ";"),
    });
  };

  return (
    <>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
        {t("schema.headlessSwitcherTitle")}
      </Typography>
      <Typography color="text.secondary">
        {t("schema.headlessSwitcherSubtitle")}
      </Typography>
      <Box mt={3} display="flex" gap={2} maxWidth="1200px">
        <Box
          borderRadius="8px"
          width="100%"
          sx={{
            border: (theme) => `1px solid ${theme.palette.border}`,
            cursor: "pointer",
          }}
          onClick={() => setSelected("headless")}
        >
          <Box
            component="img"
            borderRadius="8px 8px 0 0"
            width="100%"
            src={headlessLogos}
          />
          <Box p={2}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
              {t("schema.switchToHeadless")}
            </Typography>
            <Typography color="text.secondary">
              {t("schema.headlessDescription")}
            </Typography>
          </Box>
        </Box>
        <Box
          width="100%"
          borderRadius="8px"
          sx={{
            border: (theme) => `1px solid ${theme.palette.border}`,
            cursor: "pointer",
          }}
          onClick={() => setSelected("hybrid")}
        >
          <Box
            component="img"
            borderRadius="8px 8px 0 0"
            width="100%"
            src={hybridLogos}
          />
          <Box p={2}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
              {t("schema.switchToHybrid")}
            </Typography>
            <Typography color="text.secondary">
              {t("schema.hybridDescription")}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Box
            sx={{
              backgroundColor: "warning.light",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ApiRoundedIcon color="error" />
          </Box>
          <Typography variant="h5" sx={{ mt: 1.5 }}>
            {t("schema.switchWebEngineModeTitle", {
              mode: startCase(selected),
            })}
          </Typography>
          {selected === "headless" ? (
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              {t("schema.headlessModeDescription")}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              {t("schema.hybridModeDescription")}
            </Typography>
          )}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setSelected(null)} color="primary">
            {t("common.cancel")}
          </Button>
          <Button
            loading={isLoading}
            variant="contained"
            onClick={handleSwitch}
          >
            {t("schema.switchToMode", { mode: startCase(selected) })}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
