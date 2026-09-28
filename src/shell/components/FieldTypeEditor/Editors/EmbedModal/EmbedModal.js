import React from "react";
import { withTranslation } from "react-i18next";

import {
  Modal,
  ModalContent,
  ModalFooter,
} from "shell/components/legacy/Modal";
import { Button, TextField, InputLabel } from "@mui/material";

import { schema } from "../react-prosemirror-schema";

import styles from "./EmbedModal.less";
class EmbedModalBase extends React.Component {
  state = {
    id: "",
  };

  constructor(props) {
    super(props);
    if (!this.props.options && !this.props.options.service) {
      throw new Error(
        "EmbedModal is missing required `options` property with a service specified."
      );
    }
  }

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
    if (this.state.id) {
      this.props.view.dispatch(
        this.props.view.state.tr.replaceSelectionWith(
          schema.nodes.iframe.create({
            id: this.state.id,
            "data-service": this.props.options.service,
          })
        )
      );
    }

    zesty.trigger("PROSEMIRROR_DIALOG_CLOSE", "showEmbedModal");
    this.props.view.focus();
  };

  render() {
    const { t } = this.props;

    return (
      <Modal
        className={styles.EmbedModal}
        open={this.props.open}
        onClose={() => {
          zesty.trigger("PROSEMIRROR_DIALOG_CLOSE", "showEmbedModal");
        }}
      >
        <ModalContent>
          <InputLabel sx={{ my: 0.5 }}>
            {t("shell.editorEmbedIdLabel", {
              service: this.props.options.service,
            })}
          </InputLabel>
          <TextField
            required
            autoFocus
            fullWidth
            name="embed"
            placeholder="e.g. puXYPrrsrA"
            onChange={(evt) => this.setState({ id: evt.target.value })}
          />
        </ModalContent>
        <ModalFooter>
          <Button
            type="save"
            disabled={this.state.id.length === 0}
            onClick={this.onSave}
            variant="contained"
            color="success"
          >
            {t("shell.editorInsertEmbed")}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export const EmbedModal = withTranslation()(EmbedModalBase);
