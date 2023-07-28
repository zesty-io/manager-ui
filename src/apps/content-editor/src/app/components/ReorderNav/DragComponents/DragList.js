import { Component } from "react";
import DraggableItem from "./DraggableItem";

import styles from "./styles.less";

export default class DragList extends Component {
  state = {
    source: "",
    target: "",
  };

  render() {
    return (
      <ul
        className={styles.sort}
        onDragOver={(event) => {
          event.stopPropagation();
        }}
      >
        {this.props.children.map((item, i) => {
          const { parentZUID, contentModelZUID, ...rest } = item;
          return (
            <DraggableItem
              {...rest}
              key={item.ZUID}
              id={item.ZUID}
              draggable={true}
              onDrag={(event) => event.preventDefault()}
              onDragStart={(event) => {
                // firefox requires this event, it does nothing
                event.dataTransfer.setData("text", "");
              }}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDragEnd={(evt) => {
                evt.preventDefault();
                this.props.handleMove(item.ZUID, this.state.target);
              }}
              onDragEnter={(evt) => {
                evt.preventDefault();
                this.setState({ target: item.ZUID });
              }}
              onDrop={this.drop}
              handleNestChange={this.props.handleNestChange}
            />
          );
        })}
      </ul>
    );
  }
}
