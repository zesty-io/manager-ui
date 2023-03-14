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
import { LoadingButton } from "@mui/lab";
import { InstanceSetting } from "../../../../../../shell/services/types";
import { useUpdateInstanceSettingMutation } from "../../../../../../shell/services/instance";

type Props = {
  instanceSetting: InstanceSetting;
};

export const HeadlessSwitcher = ({ instanceSetting }: Props) => {
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
        Want to Access our Headless APIs?
      </Typography>
      <Typography color="text.secondary">
        You are currently in traditional web engine mode. Opt-in to change to
        Hybrid
        <br /> or Headless now. You can always change this from General
        Settings. Learn more
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
              Switch to Headless
            </Typography>
            <Typography color="text.secondary">
              Use Zesty as a headless back end with technologies such as NextJS,
              NuxtJS, React, Swift, Gatsby, Flutter, Angular, etc.
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
              Switch to Hybrid
            </Typography>
            <Typography color="text.secondary">
              Hybrid is best of both worlds. Pages still render HTML at their
              routes, but they can also render JSON with a simple get parameter.
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
            Switch Web Engine Mode to {startCase(selected)}
          </Typography>
          {selected === "headless" ? (
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              This is ideal for engineers who work fully outside of Zesty.io in
              technologies such as NextJS, NuxtJS, or Angular. When headless
              mode is on, all routes render as JavaScript object notation
              (JSON).
              <br />
              <br />
              Note: This change can be reverted later from General Settings
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              Hybrid is best of both worlds. Pages still render HTML at their
              routes, but they can also render JSON with a simple get parameter.
              For example /about/ would return HTML, but /about/?toJSON would
              return a fully hydrated JSON object of the about page.
              <br />
              <br />
              Note: This change can be reverted later from General Settings
            </Typography>
          )}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setSelected(null)} color="primary">
            Cancel
          </Button>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            onClick={handleSwitch}
          >
            Switch to {startCase(selected)}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
