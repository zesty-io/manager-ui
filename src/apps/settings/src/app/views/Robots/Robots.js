import { useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { useDomain } from "shell/hooks/use-domain";
import { useMetaKey } from "shell/hooks/useMetaKey";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import FormLabel from "@mui/material/FormLabel";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

import { Url } from "@zesty-io/core/Url";

import { Notice } from "@zesty-io/core/Notice";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";

import styles from "./Robots.less";

import Divider from "@mui/material/Divider";

export default connect((state) => {
  return {
    domain: state.instance.domain,
    platform: state.platform,
  };
})(function Robots(props) {
  const domain = useDomain();

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
        // We require this to be a number to properly convert to a boolean for the FeildTypeBinary compnent
        value: Number(robots_on.value),
      }));
    });
  }, []);

  const handleRobotsOn = (value) => {
    setRobotOn((prevRobotOn) => ({
      ...prevRobotOn,
      value,
    }));
  };

  const handleRobotsText = (value) => {
    setRobotText((prevRobotText) => ({
      ...prevRobotText,
      value,
    }));
  };

  const handleSave = () => {
    setLoading(true);

    const robotsOn = makeRequest({
      ...robotOn,
      value: String(robotOn.value), // The API requires this as a string
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
        setLoading(false);
      })
      .catch((err) => {
        props.dispatch(
          notify({
            kind: "warn",
            message: `Failed saving robots.txt settings. ${err}`,
          })
        );
        setLoading(true);
      });
  };

  const metaShortcut = useMetaKey("s", handleSave);

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

  const handleToggle = (val) => {
    if (val === null) return;
    handleRobotsOn(val);
  };

  return (
    <WithLoader condition={robotOn.ZUID} message="Finding robots.txt settings">
      <div className={styles.Robots}>
        <h1 className={styles.subheadline}>
          <FontAwesomeIcon icon={faFile} className={styles.titleIcon} />
          Robots.txt Editor
        </h1>
        <Divider
          sx={{
            my: 1,
            mx: 2,
          }}
        />

        <div className={styles.Row}>
          <FormLabel sx={{ color: "primary.dark" }}>
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                my: 1,
              }}
            >
              <Tooltip title={robotOn.tips} arrow placement="top-start">
                <InfoIcon fontSize="small" sx={{ mr: 1 }} />
              </Tooltip>
              {robotOn.keyFriendly}
            </Stack>
          </FormLabel>
          <ToggleButtonGroup
            color="secondary"
            size="small"
            value={robotOn.value}
            exclusive
            onChange={(evt, val) => handleToggle(val)}
          >
            <ToggleButton value={0}>No </ToggleButton>
            <ToggleButton value={1}>Yes </ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className={cx(styles.IframeWrapper, styles.Row)}>
          <h2>
            <Url href={robotURL} target="_blank" title={robotURL}>
              {robotURL}
            </Url>
          </h2>
          <iframe className={styles.Iframe} src={iframeURL}></iframe>
        </div>

        <div className={styles.Row}>
          <FieldTypeTextarea
            className={styles.CustomRules}
            name="settings[general][robots_text]"
            label={robotText.keyFriendly}
            tooltip={robotText.tips}
            onChange={handleRobotsText}
            defaultValue={robotText.value}
          />
        </div>
        <div className={styles.Row}>
          <Notice className={styles.Notice}>
            <p>Changes will not be reflected until a publish event occurs.</p>
          </Notice>
          <Notice>
            <p>
              Non-Live domains ALWAYS have robots.txt off to avoid being crawled
              by search engines. This include [hash]-dev.webengine.zesty.io,
              [hash]-dev.preview.zesty.io, and any registered domain set to the
              "dev" branch
            </p>
          </Notice>
        </div>

        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size="20px" /> : <SaveIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Save {metaShortcut}
        </Button>
      </div>
    </WithLoader>
  );
});
