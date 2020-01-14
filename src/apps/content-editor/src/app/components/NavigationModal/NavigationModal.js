import React, { Component } from "react";
import cx from "classnames";
import { Prompt } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";

import styles from "./NavigationModal.less";
export class NavigationModal extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
    // We expose this function globally
    // to give the router the ability to inform
    // this component on when to render
    window.openNavigationModal = this.show;
    window.closeNavigationModal = this.hide;
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.preventNavigation = null;
    window.closeNavigationModal = null;
  }

  show = () => {
    if (this._isMounted) {
      this.setState({
        open: true
      });
    }
  };

  hide = () => {
    if (this._isMounted) {
      this.setState({
        open: false
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <Prompt when={Boolean(this.props.when)} message={"confirm"} />
        {this.state.open && (
          <ModalAligner
            className={cx(styles.NavigationModal, this.props.className)}
          >
            <Modal onClose={this.props.onClose}>
              {/* Consumer providers Modal internals to render */}
              {this.props.children}
            </Modal>
          </ModalAligner>
        )}
      </React.Fragment>
    );
  }
}

export class Modal extends Component {
  close = evt => {
    if (this.props.onClose) {
      this.props.onClose();
    } else {
      closeNavigationModal();
    }
  };
  render() {
    return (
      <section className={styles.Modal}>
        <Button className={styles.Close} onClick={this.close}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </Button>
        {this.props.children}
      </section>
    );
  }
}
export class ModalHeader extends Component {
  render() {
    return (
      <header className={styles.ModalHeader}>{this.props.children}</header>
    );
  }
}
export class ModalContent extends Component {
  render() {
    return <main className={styles.ModalContent}>{this.props.children}</main>;
  }
}
export class ModalFooter extends Component {
  render() {
    return (
      <footer className={styles.ModalFooter}>{this.props.children}</footer>
    );
  }
}

export class ModalAligner extends Component {
  render() {
    return (
      <section className={styles.ModalAligner}>{this.props.children}</section>
    );
  }
}
