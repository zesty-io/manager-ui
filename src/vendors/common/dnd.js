var DnD = {
  _cb: (cb, cancel, evt) => {
    if (cancel) {
      DnD.cancel(evt);
    }
    cb(evt);
  },

  _remove: (el, event, func) => {
    return () => {
      el.removeEventListener(event, func);
    };
  },

  cancel: function cancel(evt) {
    evt.stopImmediatePropagation();
    evt.stopPropagation();
    evt.preventDefault();
  },

  drop: function drop(el, cb = () => {}, cancel = true) {
    el.addEventListener("drop", DnD._cb.bind(null, cb, cancel));
    return DnD._remove(el, "drop", DnD._cb);
  },

  // Draggable Item Events
  start: function start(el, key, data, cancel = true) {
    el.addEventListener("dragstart", (evt) => {
      if (data && data.url) {
        var dragIcon = document.createElement("img");
        dragIcon.src = DnD.getFileIcon(data.url);
        dragIcon.width = "60px";
        dragIcon.height = "60px";

        evt.dataTransfer.setDragImage(dragIcon, -10, -10);
      }
      evt.dataTransfer.setData(key, JSON.stringify(data));
    });
  },

  // Target Events
  over: function over(el, cb = () => {}, cancel = true) {
    el.addEventListener("dragover", DnD._cb.bind(null, cb, cancel));
    return DnD._remove(el, "dragover", DnD._cb);
  },
  enter: function enter(el, cb = () => {}, cancel = true) {
    el.addEventListener("dragenter", DnD._cb.bind(null, cb, cancel));
    return DnD._remove(el, "dragenter", DnD._cb);
  },
  leave: function leave(el, cb = () => {}, cancel = true) {
    el.addEventListener("dragleave", DnD._cb.bind(null, cb, cancel));
    return DnD._remove(el, "dragleave", DnD._cb);
  },

  getFileExt: (filePath) => {
    return filePath.split(".").pop();
  },

  // TODO update this to use a file `type` property to make this decision
  getFileIcon: function getFileIcon(url, res = "48px") {
    const basePath = `${window.location.origin}/ui/images/icons/file_types/${res}/`;
    const ext = DnD.getFileExt(url);
    switch (ext.toLowerCase()) {
      case "png":
        return `${basePath}png.png`;
      case "jpg":
      case "jpeg":
        return `${basePath}jpg.png`;
      case "gif":
        return `${basePath}gif.png`;
      case "js":
        return `${basePath}js.png`;
      case "css":
        return `${basePath}css.png`;
      case "pdf":
        return `${basePath}pdf.png`;
      case "aac":
        return `${basePath}aac.png`;
      case "ai":
        return `${basePath}ai.png`;
      case "aiff":
        return `${basePath}aiff.png`;
      case "avi":
        return `${basePath}avi.png`;
      case "bmp":
        return `${basePath}bmp.png`;
      case "eps":
        return `${basePath}eps.png`;
      case "exe":
        return `${basePath}exe.png`;
      case "flv":
        return `${basePath}flv.png`;
      case "html":
        return `${basePath}html.png`;
      case "iso":
        return `${basePath}iso.png`;
      case "less":
        return `${basePath}less.png`;
      case "mid":
        return `${basePath}mid.png`;
      case "mp3":
        return `${basePath}mp3.png`;
      case "mp4":
        return `${basePath}mp4.png`;
      case "mpg":
      case "m4v":
      case "mov":
        return `${basePath}mpg.png`;
      case "ots":
        return `${basePath}ots.png`;
      case "ott":
        return `${basePath}ott.png`;
      case "php":
        return `${basePath}php.png`;
      case "ppt":
        return `${basePath}ppt.png`;
      case "psd":
        return `${basePath}psd.png`;
      case "py":
        return `${basePath}py.png`;
      case "qt":
        return `${basePath}qt.png`;
      case "rar":
        return `${basePath}rar.png`;
      case "rb":
        return `${basePath}rb.png`;
      case "rtf":
        return `${basePath}rtf.png`;
      case "sass":
        return `${basePath}sass.png`;
      case "scss":
        return `${basePath}scss.png`;
      case "sql":
        return `${basePath}sql.png`;
      case "tgz":
        return `${basePath}tgz.png`;
      case "tiff":
        return `${basePath}tiff.png`;
      case "txt":
        return `${basePath}txt.png`;
      case "wav":
        return `${basePath}wav.png`;
      case "xls":
        return `${basePath}xls.png`;
      case "xlsx":
        return `${basePath}xlsx.png`;
      case "xml":
        return `${basePath}xml.png`;
      case "yml":
        return `${basePath}yml.png`;
      case "zip":
        return `${basePath}zip.png`;
      default:
        return `${basePath}_blank.png`;
    }
  },
};

export default DnD;
