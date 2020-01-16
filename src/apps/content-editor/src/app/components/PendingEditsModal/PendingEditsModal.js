import React, { PureComponent } from "react";

import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import {
  NavigationModal,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter
} from "../NavigationModal";

import styles from "./PendingEditsModal.less";
export class PendingEditsModal extends PureComponent {
  state = {
    selected: false
  };
  continueNavigation = () => {
    // Capture the requested hash
    const hash = window.location.hash;

    // Change router history so we can reload previous hash
    window.location.hash = "/content/home";
    window.location.hash = hash;
    this.setState({ selected: false }, () => {
      window.closeNavigationModal();
    });
  };
  render() {
    return (
      <NavigationModal
        when={this.props.show}
        className={styles.PendingEditsModal}
        onClose={this.props.onClose}
      >
        <ModalHeader>
          <h1>{this.props.title}</h1>
        </ModalHeader>
        <ModalContent>
          <p>{this.props.message}</p>
        </ModalContent>
        <ModalFooter>
          <ButtonGroup className={styles.Actions}>
            <Button
              disabled={this.props.saving || this.state.selected}
              kind="save"
              onClick={() => {
                this.setState({ selected: true });
                this.props.onSave().then(this.continueNavigation);
              }}
            >
              Save
            </Button>
            <Button
              disabled={this.props.saving || this.state.selected}
              kind="warn"
              onClick={() => {
                this.setState({ selected: true });
                this.props.onDiscard().then(this.continueNavigation);
              }}
            >
              Discard
            </Button>
            <Button
              disabled={this.props.saving || this.state.selected}
              kind="cancel"
              onClick={this.props.onCancel}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </NavigationModal>
    );
  }
}
