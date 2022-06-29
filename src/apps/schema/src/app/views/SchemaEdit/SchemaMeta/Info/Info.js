import { connect } from "react-redux";
import { useFilePath } from "shell/hooks/useFilePath";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimesCircle,
  faCheckCircle,
  faBolt,
  faCog,
  faPlus,
  faCode,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import InfoIcon from "@mui/icons-material/Info";

import { AppLink } from "@zesty-io/core/AppLink";
import { CopyButton } from "@zesty-io/material";

import styles from "./Info.less";

export default connect((state) => {
  return {
    settings: state.settings,
  };
})(function Info(props) {
  const instantJSON = props.settings.instance.find(
    (setting) => setting.key === "basic_content_api_enabled"
  );

  const codePath = useFilePath(props.model.ZUID);

  return (
    <Card className={styles.ModelInfo} sx={{ m: 2 }}>
      <CardHeader
        avatar={<InfoIcon fontSize="small" />}
        title="Model Info"
      ></CardHeader>
      <CardContent>
        <ul className={styles.StaticInfo}>
          <li>
            Label: <strong>{props.model.label}</strong>
          </li>
          <li>
            Reference Name: <strong>{props.model.name}</strong>
          </li>
          <li>
            Type: <strong>{props.model?.type}</strong>
            <ul className={styles.SubList}>
              <li>
                Has item URLs:&nbsp;
                <strong>
                  {props.model?.type === "dataset" ? (
                    <span className={styles.no}>
                      <FontAwesomeIcon icon={faTimesCircle} title="false" />
                    </span>
                  ) : (
                    <span className={styles.yes}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </span>
                  )}
                </strong>
              </li>

              <li>
                Has multiple items:&nbsp;
                <strong>
                  {props.model?.type === "templateset" ? (
                    <span className={styles.no}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </span>
                  ) : (
                    <span className={styles.yes}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </span>
                  )}
                </strong>
              </li>
            </ul>
          </li>

          <li>
            Created On: <strong>{props.model.createdAt}</strong>
          </li>
          <li>
            <abbr title="Zesty Universal ID">ZUID</abbr>:&nbsp;
            <CopyButton size="small" value={props.model.ZUID} />
          </li>
          <li>
            Instant API:&nbsp;
            {instantJSON && instantJSON.value === "1" ? (
              <Link
                underline="none"
                color="secondary"
                target="_blank"
                title="Preview JSON"
                href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.model.ZUID}.json`}
              >
                <FontAwesomeIcon icon={faBolt} />
                &nbsp;{`/-/instant/${props.model.ZUID}.json`}
              </Link>
            ) : (
              <AppLink to="/settings/instance/developer">
                <FontAwesomeIcon icon={faCog} />
                &nbsp;Activate Instant JSON API
              </AppLink>
            )}
          </li>
        </ul>
      </CardContent>
      <CardActions>
        <ul className={styles.LinkList}>
          {props.model?.type !== "templateset" && (
            <li>
              <AppLink to={`/content/${props.model.ZUID}/new`}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Add Item
              </AppLink>
            </li>
          )}

          <li>
            <AppLink to={`/content/${props.model.ZUID}`}>
              <FontAwesomeIcon icon={faEdit} />
              &nbsp;Edit Item(s)
            </AppLink>
          </li>
          <li>
            <AppLink to={codePath}>
              <FontAwesomeIcon icon={faCode} />
              &nbsp;Edit Code
            </AppLink>
          </li>
        </ul>
      </CardActions>
    </Card>
  );
});
