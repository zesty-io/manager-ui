import { useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { useDomain } from "shell/hooks/use-domain";
import { useMetaKey } from "shell/hooks/useMetaKey";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import Link from "@mui/material/Link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

import { Notice } from "@zesty-io/core/Notice";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
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
          <FieldTypeBinary
            name="settings[general][robots_on]"
            label={robotOn.keyFriendly}
            tooltip={robotOn.tips}
            value={Boolean(robotOn.value)}
            offValue="No"
            onValue="Yes"
            onChange={handleRobotsOn}
          />
        </div>

        <div className={cx(styles.IframeWrapper, styles.Row)}>
          <h2>
            <Link
              underline="none"
              color="secondary"
              href={robotURL}
              target="_blank"
              title={robotURL}
            >
              {robotURL}
            </Link>
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
