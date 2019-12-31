import React, { Component } from "react";
import DraggableItem from "./DraggableItem";

import styles from "./styles.less";

export default class DragList extends Component {
  state = {
    source: "",
    target: ""
  };
  render() {
    return (
      <ul
        className={styles.sort}
        onDragOver={event => {
          event.stopPropagation();
        }}
      >
        {this.props.children.map((item, i) => {
          return (
            <DraggableItem
              {...item}
              key={item.ZUID}
              id={item.ZUID}
              draggable={true}
              onDragStart={event => {
                // firefox requires this event, it does nothing
                event.dataTransfer.setData("text", "");
              }}
              onDragOver={event => {
                event.preventDefault();
              }}
              onDragEnd={evt => {
                this.props.handleMove(evt.target.id, this.state.target);
              }}
              onDragEnter={evt => this.setState({ target: evt.target.id })}
              onDrop={this.drop}
              handleNestChange={this.props.handleNestChange}
            />
          );
        })}
      </ul>
    );
  }
}
