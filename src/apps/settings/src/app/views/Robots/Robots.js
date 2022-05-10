import { useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { useDomain } from "shell/hooks/use-domain";
import { useMetaKey } from "shell/hooks/useMetaKey";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faSave, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";
import { Notice } from "@zesty-io/core/Notice";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";

import styles from "./Robots.less";
import { Divider } from "@zesty-io/core/Divider";

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
        <Divider />

        <div className={styles.Row}>
          <FieldTypeBinary
            name="settings[general][robots_on]"
            label={
              robotOn.tips ? (
                <>
                  <Tooltip title={robotOn.tips} arrow placement="top-start">
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                  &nbsp;
                  {robotOn.keyFriendly}
                </>
              ) : (
                robotOn.keyFriendly
              )
            }
            value={Boolean(robotOn.value)}
            offValue="No"
            onValue="Yes"
            onChange={handleRobotsOn}
          />
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
            label={
              robotText.tips ? (
                <>
                  <Tooltip title={robotText.tips} arrow placement="top-start">
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                  &nbsp;
                  {robotText.keyFriendly}
                </>
              ) : (
                robotText.keyFriendly
              )
            }
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
          type="save"
          className={styles.SaveBtn}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <FontAwesomeIcon spin icon={faSpinner} />
          ) : (
            <FontAwesomeIcon icon={faSave} />
          )}
          Save {metaShortcut}
        </Button>
      </div>
    </WithLoader>
  );
});
