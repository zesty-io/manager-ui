import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useDomain } from "shell/hooks/use-domain";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Link from "@mui/material/Link";
import { FieldTypeText } from "@zesty-io/material";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { notify } from "shell/store/notifications";
import { request } from "utility/request";
import { TopBar } from "../../components/TopBar";
import { FieldWrapper, MainWrapper } from "../../components/Containers";
import { Typography, Box } from "@mui/material";
import { Alert } from "@mui/lab";

export default connect((state) => {
  return {
    domain: state.instance.domain,
    platform: state.platform,
  };
})(function Robots(props) {
  const domain = useDomain();
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [robotOn, setRobotOn] = useState({
    admin: false,
    category: "general",
    dataType: "checkbox",
    key: "robots_on",
    keyFriendly: "Search Engine Crawlable?",
    parsleyAccess: false,
    tips: "Search engines will have permission to index each page of your site allowing for greater visibility",
  });
  const [robotText, setRobotText] = useState({
    admin: false,
    category: "general",
    dataType: "textarea",
    key: "robots_text",
    keyFriendly: "Custom Robots.txt Content",
    parsleyAccess: false,
  });

  const robotURL = `${domain}/robots.txt`;

  //https url required for iframe to prevent cross-site attacks
  const iframeURL = `https://${robotURL.slice(7)}?q=${Math.random()
    .toString(36)
    .substring(2, 15)}`;

  useEffect(() => {
    setIsDirty(false);
    request(`${CONFIG.API_INSTANCE}/env/settings`).then((res) => {
      const robots_on = res.data.find((setting) => setting.key === "robots_on");
      const robots_text = res.data.find(
        (setting) => setting.key === "robots_text"
      );

      // Merge current local state with incoming remote state
      setRobotText((prevRobotText) => ({
        ...prevRobotText,
        ...robots_text,
      }));
      setRobotOn((prevRobotOn) => ({
        ...prevRobotOn,
        ...robots_on,
        value: robots_on.value,
      }));
    });
  }, []);

  const handleRobotsOn = (value) => {
    if (value === null) return;
    setRobotOn((prevRobotOn) => ({
      ...prevRobotOn,
      value,
    }));
    setIsDirty(true);
  };

  const handleRobotsText = (value) => {
    setRobotText((prevRobotText) => ({
      ...prevRobotText,
      value,
    }));
    setIsDirty(true);
  };

  const handleSave = (callBack) => {
    setLoading(true);

    const robotsOn = makeRequest({
      ...robotOn,
      value: robotOn.value, // The API requires this as a string
    });
    const robotsText = makeRequest(robotText);

    Promise.all([robotsOn, robotsText])
      .then((res) => {
        props.dispatch(
          notify({
            kind: "success",
            message: "robots.txt file settings have been updated",
          })
        );
      })
      .catch((err) => {
        props.dispatch(
          notify({
            kind: "warn",
            message: `Failed saving robots.txt settings. ${err}`,
          })
        );
      })
      .finally(() => {
        setLoading(false);
        setIsDirty(false);
        callBack && callBack();
      });
  };

  const makeRequest = (data) => {
    return request(
      `${CONFIG.API_INSTANCE}/env/settings${data.ZUID ? `/${data.ZUID}` : ""}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: data.ZUID ? "PUT" : "POST",
        body: JSON.stringify(data),
      }
    );
  };

  return (
    <WithLoader condition={robotOn.ZUID} message="Finding robots.txt settings">
      <TopBar
        title="Robot.txt"
        onSave={handleSave}
        isNotSaved={isDirty}
        isLoading={loading}
        matchPath={props.match.path}
      />
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
        <MainWrapper rowGap={3}>
          <FieldWrapper label={robotOn.keyFriendly} tooltip={robotOn.tips}>
            <ToggleButtonGroup
              color="primary"
              size="small"
              value={robotOn.value}
              exclusive
              onChange={(evt, val) => handleRobotsOn(val)}
            >
              <ToggleButton value={"0"}>No </ToggleButton>
              <ToggleButton value={"1"}>Yes </ToggleButton>
            </ToggleButtonGroup>
          </FieldWrapper>
          <FieldWrapper>
            <Typography
              component={Link}
              underline="none"
              href={robotURL}
              target="_blank"
              title={robotURL}
              variant="h5"
              color="info.main"
            >
              {robotURL}
            </Typography>
            <iframe src={iframeURL} width="100%" height="350px" />
          </FieldWrapper>
          <FieldWrapper
            label={robotText.keyFriendly}
            tooltip={robotText.tips}
            pb="22px"
          >
            <FieldTypeText
              name="settings[general][robots_text]"
              onChange={(evt) =>
                handleRobotsText(
                  evt.target.value,
                  "settings[general][robots_text]"
                )
              }
              value={robotText.value}
              multiline
              rows={6}
              sx={{
                "& .MuiInputAdornment-root.MuiInputAdornment-positionEnd": {
                  height: "20px",
                  position: "absolute",
                  right: 0,
                  bottom: "-22px",
                },
              }}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Alert severity="warning">
              <Typography variant="body2" component="p">
                Changes will not be reflected until a publish event occurs.
              </Typography>
            </Alert>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" component="p">
                Non-Live domains ALWAYS have robots.txt off to avoid being
                crawled by search engines. This include
                [hash]-dev.webengine.zesty.io, [hash]-dev.preview.zesty.io, and
                any registered domain set to the "dev" branch
              </Typography>
            </Alert>
          </FieldWrapper>
        </MainWrapper>
      </Box>
    </WithLoader>
  );
});
