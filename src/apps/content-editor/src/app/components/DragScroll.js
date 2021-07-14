import { Component } from "react";

/**
 * Adapted from https://github.com/qiaolb/react-dragscroll/blob/master/src/DragScroll.jsx
 */
export class DragScroll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
    };
  }

  componentDidMount() {
    window.addEventListener("mouseup", this.mouseUpHandle);
    window.addEventListener("mousemove", this.mouseMoveHandle);
  }

  componentWillUnmount() {
    window.removeEventListener("mouseup", this.mouseUpHandle);
    window.removeEventListener("mousemove", this.mouseMoveHandle);
  }

  mouseUpHandle = () => {
    this.setState({
      dragging: false,
    });
  };

  mouseDownHandle = (evt) => {
    evt.preventDefault();

    this.lastClientX = evt.clientX;
    this.lastClientY = evt.clientY;

    this.setState({
      dragging: true,
    });
  };

  mouseMoveHandle = (evt) => {
    if (this.state.dragging) {
      this.props.childRef.current.scrollLeft -=
        -this.lastClientX + (this.lastClientX = evt.clientX);
      this.props.childRef.current.scrollTop -=
        -this.lastClientY + (this.lastClientY = evt.clientY);
    }
  };

  render() {
    if (!this.props.childRef) {
      throw Error("DragScroll requires a childRef prop");
    }

    return (
      <div
        className={this.props.className}
        onMouseUp={this.mouseUpHandle}
        onMouseDown={this.mouseDownHandle}
        onMouseMove={this.mouseMoveHandle}
      >
        {this.props.children}
      </div>
    );
  }
}
