export const validInput = (val) => {
  return /^[a-zA-Z0-9!@#?$%\^&\s*)(+=._-]*$/.test(val);
};
