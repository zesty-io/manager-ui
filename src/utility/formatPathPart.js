export const formatPathPart = (str) =>
  str
    .replace(/[^a-zA-Z0-9\_\\s]+/gi, "-")
    .toLowerCase()
    .trim();
