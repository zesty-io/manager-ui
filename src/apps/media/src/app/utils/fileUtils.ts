import { File } from "../../../../../shell/services/types";
import { Filetype, DateRange } from "../../../../../shell/store/media-revamp";
import moment from "moment-timezone";
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

export function getExtensions(filetype: Filetype | null) {
  switch (filetype) {
    // top level types
    case "Image":
      return ["jpg", "jpeg", "png", "gif", "svg", "webp"];
    case "Video":
      return ["mp4", "webm", "mov", "avi", "wmv", "flv", "mpg", "mpeg"];
    case "Audio":
      return ["mp3", "wav", "ogg", "flac", "aac"];
    case "Document":
      return ["doc", "docx", "txt", "rtf", "md", "odt"];
    case "Spreadsheet":
      return ["xls", "xlsx", "ppt", "pptx", "csv", "ods", "odp"];
    case "PDF":
      return ["pdf"];
    case "Archive":
      return ["zip", "rar", "tar", "gz", "7z"];
    case "Code":
      return ["js", "css", "html", "php", "py", "rb", "java", "c", "cpp", "cs"];
    case "Font":
      return ["ttf", "otf", "woff", "woff2"];
    // image subtypes
    case "JPEG":
      return ["jpg", "jpeg"];
    case "PNG":
      return ["png"];
    case "GIF":
      return ["gif"];
    case "SVG":
      return ["svg"];
    case "WEBP":
      return ["webp"];
    // video subtypes
    case "MP4":
      return ["mp4"];
    case "WEBM":
      return ["webm"];
    case "MOV":
      return ["mov"];
    case "AVI":
      return ["avi"];
    case "WMV":
      return ["wmv"];
    case "FLV":
      return ["flv"];
    case "MPEG":
      return ["mpg", "mpeg"];
    default:
      return null;
  }
}

export function getDateFilterFn(dateRangeFilter: DateRange) {
  const { value, type } = dateRangeFilter;
  switch (type) {
    case "preset":
      switch (value) {
        case "today":
          return (date: string) => moment(date).isSame(moment(), "day");
        case "yesterday":
          return (date: string) =>
            moment(date).isSame(moment().subtract(1, "days"), "day");
        case "last 7 days":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(7, "days"), "day");
        case "last 30 days":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(30, "days"), "day");
        case "last 3 months":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(3, "months"), "day");
        case "last 12 months":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(12, "months"), "day");
        // should never happen
        default:
          return (date: string) => true;
      }
    case "on":
      return (date: string) => moment(date).isSame(moment(value), "day");
    case "before":
      return (date: string) =>
        moment(date).isSameOrBefore(moment(value), "day");
    case "after":
      return (date: string) => moment(date).isSameOrAfter(moment(value), "day");
    /*
    case "between":
      return (date: string) => {
        const [start, end] = value;
        return (
          moment(date).isSameOrAfter(moment(start), "day") &&
          moment(date).isSameOrBefore(moment(end), "day")
        );
      };
    */

    // should never happen
    default:
      return (date: string) => true;
  }
}
