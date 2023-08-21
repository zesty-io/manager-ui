import { Switch, SwitchProps } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { useGetInstanceSettingsQuery } from "../../../../../../../../shell/services/instance";
import { useEffect } from "react";
import { actions } from "../../../../../../../../shell/store/ui";
import { styled } from "@mui/material/styles";

export const DuoModeSwitch = () => {
  const ui = useSelector((state: AppState) => state.ui);
  const dispatch = useDispatch();
  const instanceSettings2 = useSelector(
    (state: AppState) => state.settings.instance
  );
  const { data: instanceSettings, isFetching } = useGetInstanceSettingsQuery();
  const shouldHide = instanceSettings?.find((setting: any) => {
    // if any of these settings are present then DuoMode is unavailable
    return (
      (setting.key === "basic_content_api_key" && setting.value) ||
      (setting.key === "headless_authorization_key" && setting.value) ||
      (setting.key === "authorization_key" && setting.value) ||
      (setting.key === "x_frame_options" && setting.value)
    );
  });

  useEffect(() => {
    if (shouldHide) {
      dispatch(actions.setDuoMode(false));
    }
  }, [instanceSettings, shouldHide]);

  if (shouldHide || isFetching) {
    return null;
  }

  return (
    <IOSSwitch
      checked={ui.duoMode}
      onChange={(event) => {
        if (event.target.checked) {
          dispatch(actions.setDuoMode(true));
          dispatch(actions.setContentActions(false));
        } else {
          dispatch(actions.setDuoMode(false));
          dispatch(actions.setContentActions(true));
        }
      }}
    />
  );
};

// https://mui.com/material-ui/react-switch/#customization
const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 60,
  height: 32,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(28px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.grey[100],
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
      "& .MuiSwitch-thumb": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: theme.palette.grey[300],
      border: "6px solid #fff",
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 28,
    height: 28,
    backgroundColor: theme.palette.grey[300],
    "&:before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path fill="white" d="M336 -120v-35l84 -85H140q-24 0 -42 -18t-18 -42v-480q0 -24 18 -42t42 -18h680q24 0 42 18t18 42v480q0 24 -18 42t-42 18H540l84 85v35H336ZM140 -396h680v-384H140v384Zm0 0v-384Z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    borderRadius: 100,
    backgroundColor: theme.palette.grey[100],
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));
