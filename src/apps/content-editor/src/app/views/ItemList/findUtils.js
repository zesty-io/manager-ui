export const findFields = (fields, modelZUID) => {
  return Object.keys(fields)
    .filter((key) => {
      return (
        !fields[key].deletedAt &&
        fields[key].settings &&
        fields[key].settings.list == 1 &&
        fields[key].contentModelZUID === modelZUID
      );
    })
    .map((key) => fields[key])
    .sort((a, b) => a.sort - b.sort);
};

export const findItems = (items, modelZUID, langID = 1) => {
  return Object.keys(items)
    .filter((key) => {
      return (
        items[key] &&
        items[key].meta &&
        items[key].meta.contentModelZUID === modelZUID &&
        items[key].meta.langID === langID
      );
    })
    .map((key) => items[key])
    .sort((a, b) => {
      if (a.meta.createdAt < b.meta.createdAt) {
        return 1;
      }
      if (a.meta.createdAt > b.meta.createdAt) {
        return -1;
      }
      return 0;
    });
};
