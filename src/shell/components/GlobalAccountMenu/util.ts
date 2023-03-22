export const handleOpenUrl = (url: string, closeMenuCb?: () => void) => {
  closeMenuCb && closeMenuCb();
  window.open(url, "_blank", "noopener");
};
