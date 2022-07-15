export const getResourceType = (zuid) => {
  if (zuid.startsWith("7")) {
    return "content";
  } else if (zuid.startsWith("6")) {
    return "schema";
  } else if (zuid.startsWith("10") || zuid.startsWith("11")) {
    return "code";
  } else {
    return "settings";
  }
};
