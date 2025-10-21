import { File } from "../../../../../shell/services/types";
import { Filetype, DateRange } from "../../../../../shell/store/media-revamp";
import {
  parse,
  isValid,
  isSameDay,
  isAfter,
  isBefore,
  subDays,
  subMonths,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";

export function fileExtension(url: string) {
  let extension = "No Extension";
  if (url?.includes(".")) {
    extension =
      url.substring(url.lastIndexOf(".") + 1, url.length).toLowerCase() ||
      "No Extension";
  }
  return extension;
}

export function isImage(file: File) {
  if (!file) return false;
  if (file.url && file.url.indexOf("blob:") !== -1) return true;

  switch (fileExtension(file.url)) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
    case "ico":
    case "avif":
      return true;
    default:
      return false;
  }
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
    case "ico":
    case "avif":
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
    case "folder":
      return "deepPurple";
    default:
      return "grey";
  }
};

export function getExtensions(filetype: Filetype | null) {
  switch (filetype) {
    // top level types
    case "Image":
      return ["jpg", "jpeg", "png", "gif", "svg", "webp", "avif"];
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
    case "AVIF":
      return ["avif"];
    default:
      return null;
  }
}

const parseYMD = (s?: string | null) =>
  s ? parse(s, "yyyy-MM-dd", new Date()) : null;

const validLocal = (s?: string | null) => {
  const d = parseYMD(s);
  return d && isValid(d) ? d : null;
};

const sameDay = (a: Date, b: Date) => isSameDay(startOfDay(a), startOfDay(b));
const onOrAfterDay = (a: Date, b: Date) =>
  sameDay(a, b) || isAfter(startOfDay(a), startOfDay(b));
const onOrBeforeDay = (a: Date, b: Date) =>
  sameDay(a, b) || isBefore(startOfDay(a), startOfDay(b));

export function getDateFilterFn(dateRangeFilter: DateRange) {
  const { value, type } = dateRangeFilter;
  const today = startOfDay(new Date());

  switch (type) {
    case "preset": {
      switch (value) {
        case "today":
          return (date: string) => {
            const d = validLocal(date);
            return d ? sameDay(d, today) : false;
          };
        case "yesterday": {
          const y = startOfDay(subDays(today, 1));
          return (date: string) => {
            const d = validLocal(date);
            return d ? sameDay(d, y) : false;
          };
        }
        case "last 7 days": {
          const from = startOfDay(subDays(today, 7));
          const to = endOfDay(today);
          return (date: string) => {
            const d = validLocal(date);
            return d ? isWithinInterval(d, { start: from, end: to }) : false;
          };
        }
        case "last 30 days": {
          const from = startOfDay(subDays(today, 30));
          const to = endOfDay(today);
          return (date: string) => {
            const d = validLocal(date);
            return d ? isWithinInterval(d, { start: from, end: to }) : false;
          };
        }
        case "last 3 months": {
          const from = startOfDay(subMonths(today, 3));
          const to = endOfDay(today);
          return (date: string) => {
            const d = validLocal(date);
            return d ? isWithinInterval(d, { start: from, end: to }) : false;
          };
        }
        case "last 12 months": {
          const from = startOfDay(subMonths(today, 12));
          const to = endOfDay(today);
          return (date: string) => {
            const d = validLocal(date);
            return d ? isWithinInterval(d, { start: from, end: to }) : false;
          };
        }
        default:
          return () => true; // should never happen
      }
    }

    case "on": {
      const target = validLocal(value as string | null);
      return (date: string) => {
        const d = validLocal(date);
        return d && target ? sameDay(d, target) : false;
      };
    }

    case "before": {
      const cutoff = validLocal(value as string | null);
      return (date: string) => {
        const d = validLocal(date);
        return d && cutoff ? onOrBeforeDay(d, cutoff) : false;
      };
    }

    case "after": {
      const cutoff = validLocal(value as string | null);
      return (date: string) => {
        const d = validLocal(date);
        return d && cutoff ? onOrAfterDay(d, cutoff) : false;
      };
    }

    case "range": {
      const [start, end] = value as [string | null, string | null];
      const from = validLocal(start);
      const to = validLocal(end);
      return (date: string) => {
        const d = validLocal(date);
        if (!d || !from || !to) return false;
        return isWithinInterval(d, {
          start: startOfDay(from),
          end: endOfDay(to),
        });
      };
    }

    default:
      return () => true; // should never happen
  }
}

// ---------- query param -> DateRange ----------
type GetDateFilter = (params: URLSearchParams) => DateRange | undefined;

export const getDateFilter: GetDateFilter = (params) => {
  // presets
  if (params.has("dateFilter")) {
    const preset = params.get("dateFilter");
    const presetMap = {
      today: "today",
      yesterday: "yesterday",
      last7days: "last 7 days",
      last30days: "last 30 days",
      last3months: "last 3 months",
      last12months: "last 12 months",
    } as const;

    if (preset && preset in presetMap) {
      return {
        type: "preset",
        value: presetMap[preset as keyof typeof presetMap],
      };
    }
  }

  const from = params.get("from");
  const to = params.get("to");

  if (to && from) {
    if (to === from) {
      return { type: "on", value: to };
    }
    return { type: "range", value: [from, to] };
  } else if (to) {
    return { type: "before", value: to };
  } else if (from) {
    return { type: "after", value: from };
  }

  return undefined;
};
