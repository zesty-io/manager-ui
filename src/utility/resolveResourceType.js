export const resolveResourceType = (ZUID) => {
  if (ZUID.startsWith("7")) {
    return "content";
  } else if (ZUID.startsWith("6")) {
    return "schema";
  } else if (ZUID.startsWith("10") || ZUID.startsWith("11")) {
    return "code";
  } else {
    return "settings";
  }
};
