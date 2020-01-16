import React, { Component } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core";

import DraggableItem from "./DragComponents/DraggableItem";
import DragList from "./DragComponents/DragList";

import { notify } from "shell/store/notifications";
import { fetchNav } from "../../../store/contentNav";

import styles from "./ReorderNav.less";
class ReorderNav extends Component {
  state = {
    current: "root",
    root: [
      ...Object.keys(this.props.nav).map(itemZUID => {
        return {
          label: this.props.nav[itemZUID].label,
          ZUID: this.props.nav[itemZUID].ZUID,
          children: this.props.nav[itemZUID].children
        };
      })
    ].filter(item => item.ZUID !== "Headless"),
    dirty: false,
    requesting: false
  };

  requestForReorder = () => {
    this.setState({ requesting: true });
    const saveOrderNodes = this.state[this.state.current]
      .map(item => item.ZUID)
      .join("|");
    const bodyString = `ordered_znodes=${saveOrderNodes}`;
    request(`${CONFIG.service.manager}/ajax/content_update_sort.ajax.php`, {
      body: bodyString,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      }
    })
      .then(() => {
        this.props.dispatch(
          notify({ message: "Changes have been saved", kind: "save" })
        );
        this.setState({ dirty: false, requesting: false });
        // fetch new Nav
        this.props.dispatch(fetchNav());
      })
      .catch(err => {
        this.props.dispatch(
          notify({ message: "Error saving changes", kind: "error" })
        );
        this.setState({ requesting: false });
      });
  };

  handleNestChange = name => {
    // set a key on state to the nesting level indicated
    // set 'current' to that ZUID
    if (this.state.current !== "root") {
      return this.setState({
        [name]: [
          ...this.state[this.state.current].find(item => item.ZUID === name)
            .children
        ],
        current: name
      });
    }
    this.setState({
      [name]: [...this.props.nav.find(item => item.ZUID === name).children],
      current: name
    });
  };
  handleMove = (source, target) => {
    // filter out the source item
    let mutatedArray = this.state[this.state.current].filter(
      item => item.ZUID !== source
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
      this.state[this.state.current].find(item => item.ZUID === source)
    );

    this.setState({
      [this.state.current]: mutatedArray,
      dirty: true
    });
  };
  render() {
    const currentNest = this.state.current;
    return (
      <section className={styles.Matte}>
        <span className={styles.container}>
          <span className={styles.buttons}>
            <Button
              kind="cancel"
              className={styles.close}
              onClick={this.props.handleClose}
              id="CloseReorderModal"
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
            {this.state.dirty ? (
              <Button
                kind="save"
                onClick={this.requestForReorder}
                disabled={this.state.requesting}
              >
                Save Changes
              </Button>
            ) : (
              <p />
            )}
          </span>
          <h3>Change the order of items in your navigation</h3>
          {this.state.current === "root" ? null : (
            <Button onClick={() => this.setState({ current: "root" })}>
              Return to Root
            </Button>
          )}
          <DragList
            handleNestChange={this.handleNestChange}
            handleMove={this.handleMove}
          >
            {this.state[this.state.current]}
          </DragList>
        </span>
      </section>
    );
  }
}

export default connect(state => {
  return { nav: state.contentNav.nav };
})(ReorderNav);
