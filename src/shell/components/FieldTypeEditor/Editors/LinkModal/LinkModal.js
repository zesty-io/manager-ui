import React from "react";
import { withTranslation } from "react-i18next";
import { toggleMark } from "prosemirror-commands";

import {
  Modal,
  ModalContent,
  ModalFooter,
} from "shell/components/legacy/Modal";
import {
  Button,
  TextField,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import { schema } from "../react-prosemirror-schema";

import styles from "./LinkModal.less";
class LinkModalBase extends React.PureComponent {
  state = {
    target: "_blank",
    href: "",
  };

  componentDidMount() {
    window.addEventListener("keypress", this.onEnter);
  }

  componentWillUnmount() {
    window.removeEventListener("keypress", this.onEnter);
  }

  onEnter = (evt) => {
    if (evt.key === "Enter" || evt.keyCode == 13) {
      this.onSave();
    }
  };

  onSave = () => {
    // Trigger empty setState in order to wait for the state to settle
    // before triggering mark and exit
    this.setState({}, () => {
      if (this.state.href) {
        toggleMark(schema.marks.link, this.state)(
          this.props.view.state,
          this.props.view.dispatch
        );
      }
      zesty.trigger("PROSEMIRROR_DIALOG_CLOSE", "showLinkModal");
      this.props.view.focus();
    });
  };

  render() {
    const { t } = this.props;

    return (
      <Modal
        className={styles.LinkModal}
        open={this.props.open}
        onClose={() => {
          zesty.trigger("PROSEMIRROR_DIALOG_CLOSE", "showLinkModal");
        }}
      >
        <ModalContent>
          <InputLabel sx={{ mb: 0.5 }}>
            {t("shell.editorLinkUrlLabel")}
          </InputLabel>
          <TextField
            required
            autoFocus
            fullWidth
            name="linkUrl"
            placeholder="https://"
            onChange={(evt) => this.setState({ href: evt.target.value })}
          />
          <FormControlLabel
            label={t("shell.editorLinkNewWindow")}
            labelPlacement="start"
            slotProps={{
              typography: {
                color: "text.primary",
              },
            }}
            control={
              <Checkbox
                name="linkTarget"
                checked={this.state.target === "_blank"}
                onChange={() =>
                  this.setState({
                    target: this.state.target === "_blank" ? "_self" : "_blank",
                  })
                }
              />
            }
          />
        </ModalContent>
        <ModalFooter>
          <Button
            type="save"
            disabled={this.state.href.length === 0}
            onClick={this.onSave}
            variant="contained"
            color="success"
          >
            {t("shell.editorInsertLink")}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export const LinkModal = withTranslation()(LinkModalBase);
