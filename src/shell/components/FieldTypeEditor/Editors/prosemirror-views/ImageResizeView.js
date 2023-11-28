/**
@see https://prosemirror.net/docs/guide/#view.node_views
@see https://glitch.com/edit/#!/toothsome-shoemaker
**/
export class ImageResizeView {
  constructor(node, view, getPos) {
    this.node = node;
    this.outerView = view;
    this.getPos = getPos;

    const figure = document.createElement("figure");
    figure.style.position = "relative";
    figure.style.width = node.attrs.width;
    figure.style.height = node.attrs.height;
    figure.style.display = "inline-block";
    figure.style.lineHeight = "0"; // necessary so the bottom right arrow is aligned nicely

    const img = document.createElement("img");

    Object.keys(node.attrs).forEach((attr) => {
      if (node.attrs[attr]) {
        img.setAttribute(attr, node.attrs[attr]);
      }
    });

    // Lets the image expand when dragging the handle
    img.style.width = "100%";
    img.style.height = "100%";

    figure.appendChild(img);

    this.dom = figure;
    this.img = img;
    this.handle = this.addHandle();
  }

  selectNode() {
    this.img.classList.add("ProseMirror-selectednode");
  }

  deselectNode() {
    this.img.classList.remove("ProseMirror-selectednode");
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

    handle.onmousedown = (e) => {
      e.preventDefault();

      const startX = e.pageX;
      const startY = e.pageY;
      const startWidth = this.dom.offsetWidth;
      const startHeight = this.dom.offsetHeight;

      const onMouseMove = (e) => {
        const currentX = e.pageX;
        const currentY = e.pageY;

        const endWidth = startWidth + (currentX - startX);
        const endHeight = startHeight + (currentY - startY);

        this.dom.style.width = `${endWidth}px`;
        this.dom.style.height = `${endHeight}px`;
      };

      const onMouseUp = (e) => {
        e.preventDefault();

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        let url = this.node.attrs.src;
        // if (this.node.attrs["data-zuid"]) {
        //   // TODO make API call to cut new image
        //   url = `${CONFIG.service.media_resolver}/resolve/${
        //     this.node.attrs["data-zuid"]
        //   }/getimage/?w=${this.dom.style.width}&h=${this.dom.style.height}`;
        // }

        const transaction = this.outerView.state.tr
          .setNodeMarkup(this.getPos(), null, {
            ...this.node.attrs,
            src: url,
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
