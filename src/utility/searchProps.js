export default function searchProps(obj, term) {
  if (typeof obj === "object") {
    return Object.keys(obj).some(key => {
      const value = obj[key];

      if (typeof value === "string") {
        const haystack = value.toLowerCase();
        const needle = term.toLowerCase();

        if (haystack.indexOf(needle) !== -1) {
          return true;
        }
      } else if (typeof value === "number") {
        if (value == term) {
          return true;
        }
      } else if (typeof value === "object") {
        return searchProps(value, term);
      }

      return false;
    });
  } else {
    return false;
  }
}
