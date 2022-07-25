export const filterByParams = (arr, params) => {
  const availableKeys = Object.keys(arr[0]);

  for (const [key, value] of params.entries()) {
    // Verify that object has a matching key to filter by
    if (availableKeys.includes(key)) {
      arr = arr.filter((action) => String(action?.[key]) === value);
    }
  }
  return [...arr];
};
