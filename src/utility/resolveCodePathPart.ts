// Maps a code file type to its API/route path segment
export const resolveCodePathPart = (type?: string): string => {
  switch (type) {
    case "templateset":
    case "dataset":
    case "pageset":
    case "snippet":
    case "ajax-json":
    case "ajax-html":
    case "404":
    case "loader":
    case "block":
      return "views";

    case "text/js":
    case "text/javascript":
      return "scripts";

    case "text/css":
    case "text/less":
    case "text/scss":
    case "text/sass":
      return "stylesheets";

    default:
      return type as string;
  }
};
