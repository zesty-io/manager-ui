import { Component } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faBackward } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import DragList from "./DragComponents/DragList";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";

import styles from "./ReorderNav.less";
class ReorderNav extends Component {
  state = {
    current: "root",
    root: [
      ...Object.keys(this.props.nav).map((itemZUID) => {
        return {
          label: this.props.nav[itemZUID].label,
          ZUID: this.props.nav[itemZUID].ZUID,
          children: this.props.nav[itemZUID].children,
        };
      }),
    ].filter((item) => item.ZUID !== "Headless"),
    dirty: false,
    requesting: false,
  };

  requestForReorder = () => {
    this.setState({ requesting: true });
    const sortedNodes = this.state[this.state.current].map((item, index) => {
      return {
        zuid: item.ZUID,
        sort: index,
      };
    });
    request(`${CONFIG.API_INSTANCE}/env/nav`, {
      body: { data: sortedNodes },
      json: true,
    })
      .then(() => {
        this.props.dispatch({
          type: "REORDER_NAV",
        });
        this.props.dispatch(
          notify({
            message: "Changes have been saved",
            kind: "save",
          })
        );
        this.setState({
          dirty: false,
          requesting: false,
        });
      })
      .catch((err) => {
        this.props.dispatch(
          notify({ message: "Error saving changes", kind: "error" })
        );
        this.setState({ requesting: false });
      });
  };

  handleNestChange = (name) => {
    // set a key on state to the nesting level indicated
    // set 'current' to that ZUID
    if (this.state.current !== "root") {
      return this.setState({
        [name]: [
          ...this.state[this.state.current].find((item) => item.ZUID === name)
            .children,
        ],
        current: name,
      });
    }
    this.setState({
      [name]: [...this.props.nav.find((item) => item.ZUID === name).children],
      current: name,
    });
  };

  handleMove = (source, target) => {
    // filter out the source item
    let mutatedArray = this.state[this.state.current].filter(
      (item) => item.ZUID !== source
    );
    let indexOfTarget = 0;
    mutatedArray.map((item, i) => {
      if (item.ZUID === target) {
        indexOfTarget = i;
      }
    });
    // insert where it was dragged
    mutatedArray.splice(
      indexOfTarget,
      0,
      this.state[this.state.current].find((item) => item.ZUID === source)
    );

    this.setState({
      [this.state.current]: mutatedArray,
      dirty: true,
    });
  };

  render() {
    return (
      this.props.isOpen && (
        <Modal
          type="global"
          open={this.props.toggleOpen}
          onClose={this.props.toggleOpen}
          className={styles.ReorderNav}
        >
          <ModalContent className={styles.ModalContent}>
            <span className={styles.container}>
              <h3>Change the order of items in your navigation</h3>

              <DragList
                handleNestChange={this.handleNestChange}
                handleMove={this.handleMove}
              >
                {this.state[this.state.current]}
              </DragList>
            </span>
          </ModalContent>
          <ModalFooter className={styles.ModalFooter}>
            <ButtonGroup className={styles.ButtonGroup}>
              <Button
                onClick={() => this.setState({ current: "root" })}
                disabled={this.state.current === "root"}
              >
                <FontAwesomeIcon icon={faBackward} />
                Return to Root
              </Button>
              <Button
                type="save"
                onClick={this.requestForReorder}
                disabled={!this.state.dirty || this.state.requesting}
              >
                <FontAwesomeIcon icon={faSave} />
                Save Changes
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </Modal>
      )
    );
  }
}

export default connect((state) => {
  return { nav: state.navContent.nav };
})(ReorderNav);
