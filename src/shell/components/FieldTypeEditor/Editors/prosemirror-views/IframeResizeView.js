/**
@see https://prosemirror.net/docs/guide/#view.node_views
@see https://glitch.com/edit/#!/toothsome-shoemaker
**/
export class IframeResizeView {
  constructor(node, view, getPos) {
    this.node = node;
    this.outerView = view;
    this.getPos = getPos;

    const iframe = document.createElement("iframe");

    // Need to send attributes through dom creation process
    // as that is when we determine the embeded service url
    const attrs = node.type.spec.toDOM(node)[1];
    Object.keys(attrs).forEach((attr) => {
      if (attrs[attr]) {
        iframe.setAttribute(attr, attrs[attr]);
      }
    });

    // Lets the image expand when dragging the handle
    iframe.style.width = "100%";
    iframe.style.height = "100%";

    const figure = document.createElement("figure");
    figure.style.position = "relative";
    figure.style.width = attrs.width;
    figure.style.height = attrs.height;
    figure.style.display = "inline-block";
    figure.style.lineHeight = "0"; // necessary so the bottom right arrow is aligned nicely
    figure.appendChild(iframe);

    this.dom = figure;
    this.iframe = iframe;
    this.handle = this.addHandle();
  }

  selectNode() {
    this.iframe.classList.add("ProseMirror-selectednode");
  }

  deselectNode() {
    this.iframe.classList.remove("ProseMirror-selectednode");
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
