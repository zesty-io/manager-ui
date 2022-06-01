import { useMetaKey } from "shell/hooks/useMetaKey";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./Header.less";
export function Header(props) {
  const metaShortcut = useMetaKey("s", props.onSave);
  return (
    <header className={styles.Header}>
      <span>
        <AppLink to="/content">
          <FontAwesomeIcon icon={faHome} />
        </AppLink>
        <FontAwesomeIcon icon={faAngleRight} />
        <AppLink to={`/content/${props.model.ZUID}`}>
          {props.model.label}
        </AppLink>
        <FontAwesomeIcon icon={faAngleRight} />
        &nbsp;New Item
      </span>

      <ButtonGroup className={styles.Actions}>
        <Button
          variant="contained"
          color="success"
          id="CreateItemSaveButton"
          disabled={props.saving || !props.isDirty}
          onClick={props.onSave}
          startIcon={
            props.saving ? <CircularProgress size="20px" /> : <SaveIcon />
          }
        >
          Create Item&nbsp; {metaShortcut}
        </Button>
      </ButtonGroup>
    </header>
  );
}
