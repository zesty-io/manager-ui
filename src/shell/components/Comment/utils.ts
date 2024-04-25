export const countCharUsage = (string: string, char: string) => {
  const regex = new RegExp(char, "g");
  return [...string.matchAll(regex)]?.length ?? 0;
};

export const getCursorPosition = (contentElement: Node) => {
  const selection = window.getSelection();
  const range = selection?.getRangeAt(0) as Range;
  const clonedRange = range?.cloneRange();

  clonedRange?.selectNodeContents(contentElement);
  clonedRange?.setEnd(range?.endContainer, range?.endOffset);

  return clonedRange?.toString().length || 0;
};
