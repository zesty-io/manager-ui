import React from "react";
import { toggleMark } from "prosemirror-commands";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Button } from "@zesty-io/core/Button";
import { Input } from "@zesty-io/core/Input";

import { schema } from "../react-prosemirror-schema";

import styles from "./LinkModal.less";
export class LinkModal extends React.PureComponent {
  url = React.createRef();

  state = {
    target: "_blank",
    href: "",
  };

  componentDidMount() {
    this.url.current.querySelector("input").focus();
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
    return (
      <Modal
        className={styles.LinkModal}
        open={this.props.open}
        onClose={() => {
          zesty.trigger("PROSEMIRROR_DIALOG_CLOSE", "showLinkModal");
        }}
      >
        <ModalContent>
          <FieldTypeText
            innerRef={this.url}
            label="What url should this link to?"
            name="linkUrl"
            placeholder="https://"
            required={true}
            autoFocus={true}
            onChange={(href) => this.setState({ href })}
          />
          <label>
            Open link in a new browser window?{" "}
            <Input
              name="linkTarget"
              type="checkbox"
              checked={this.state.target === "_blank" ? true : false}
              onChange={() =>
                this.setState({
                  target: this.state.target === "_blank" ? "_self" : "_blank",
                })
              }
            />
          </label>
        </ModalContent>
        <ModalFooter>
          <Button
            type="save"
            disabled={this.state.href.length === 0}
            onClick={this.onSave}
          >
            <i className="fa fa-plus" aria-hidden="true" />
            Insert Link
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
