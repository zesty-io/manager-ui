/* 
  This function takes in an array of objects and a URLSearchParams object.
  It will filter the array of objects by matching keys and values of both objects.
  ex.
    given:
      arr = [{name: 'Tod', age: 30}, {name: 'John', age: 50}]
      params = {age: 50, job: 'Software Engineer'}
    returns:
      [{name: 'Tod', age: 30}]
*/

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
