export const formatName = str =>
  str
    .replace(/[^a-zA-Z0-9\_\\s]+/gi, "_")
    .toLowerCase()
    .trim();
