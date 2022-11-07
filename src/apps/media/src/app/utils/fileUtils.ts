import { File } from "../../../../../shell/services/types";
export function fileExtension(url: string) {
  let extension = "No Extension";
  if (url.includes(".")) {
    extension =
      url.substring(url.lastIndexOf(".") + 1, url.length).toLowerCase() ||
      "No Extension";
  }
  return extension;
}

export function isImage(file: File) {
  if (!file) return false;
  if (file.url && file.url.indexOf("blob:") !== -1) {
    return true;
  }

  switch (fileExtension(file.url)) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return true;
  }

  return false;
}

export const fileTypeToColor = (extension: string) => {
  switch (extension) {
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "png":
    case "svg":
    case "docx":
    case "doc":
    case "rtf":
    case "html":
    case "js":
    case "css":
      return "blue";
    case "ots":
    case "xls":
    case "xlsx":
    case "csv":
    case "numbers":
      return "green";
    case "pdf":
    case "ppt":
    case "pptx":
    case "pptm":
    case "No Extension":
      return "red";
    case "aac":
    case "aiff":
    case "mid":
    case "mp3":
    case "wav":
    case "mp4":
    case "mov":
    case "avi":
    case "wmv":
    case "mkv":
    case "webm":
    case "flv":
    case "f4v":
    case "swf":
    case "avchd":
    case "html5":
      return "purple";
    default:
      return "grey";
  }
};
