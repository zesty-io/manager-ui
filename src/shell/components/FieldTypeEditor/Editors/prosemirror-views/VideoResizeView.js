/**
@see https://prosemirror.net/docs/guide/#view.node_views
@see https://glitch.com/edit/#!/toothsome-shoemaker
**/
export class VideoResizeView {
  constructor(node, view, getPos) {
    this.node = node;
    this.outerView = view;
    this.getPos = getPos;

    const video = document.createElement("video");

    // Need to send attributes through dom creation process
    // as that is when we determine the embeded service url
    // const attrs = node.type.spec.toDOM(node)[1];
    Object.keys(node.attrs).forEach((attr) => {
      if (node.attrs[attr]) {
        video.setAttribute(attr, node.attrs[attr]);
      }
    });

    // Lets the image expand when dragging the handle
    video.style.width = "100%";
    video.style.height = "100%";

    const figure = document.createElement("figure");
    figure.style.position = "relative";
    figure.style.width = node.attrs.width;
    figure.style.height = node.attrs.height;
    figure.style.display = "inline-block";
    figure.style.lineHeight = "0"; // necessary so the bottom right arrow is aligned nicely
    figure.appendChild(video);

    this.dom = figure;
    this.video = video;
    this.handle = this.addHandle();
  }

  selectNode() {
    this.video.classList.add("ProseMirror-selectednode");
  }

  deselectNode() {
    this.video.classList.remove("ProseMirror-selectednode");
  }

  addHandle() {
    const handle = document.createElement("span");
    handle.style.position = "absolute";
    handle.style.bottom = "0px";
    handle.style.right = "0px";
    handle.style.width = "10px";
    handle.style.height = "10px";
    handle.style.border = "3px solid orange";
    handle.style.borderTop = "none";
    handle.style.borderLeft = "none";
    handle.style.cursor = "nwse-resize";

    handle.onmousedown = (evt) => {
      evt.preventDefault();

      const startX = evt.pageX;
      const startY = evt.pageY;
      const startWidth = this.dom.offsetWidth;
      const startHeight = this.dom.offsetHeight;

      const onMouseMove = (evt) => {
        const currentX = evt.pageX;
        const currentY = evt.pageY;

        const endWidth = startWidth + (currentX - startX);
        const endHeight = startHeight + (currentY - startY);

        this.dom.style.width = `${endWidth}px`;
        this.dom.style.height = `${endHeight}px`;
      };

      const onMouseUp = (evt) => {
        evt.preventDefault();

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        const transaction = this.outerView.state.tr
          .setNodeMarkup(this.getPos(), null, {
            ...this.node.attrs,
            width: this.dom.style.width,
            height: this.dom.style.height,
          })
          .setSelection(this.outerView.state.selection);

        this.outerView.dispatch(transaction);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    this.dom.appendChild(handle);

    return handle;
  }
}
