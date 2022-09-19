export function fileExtension(url: string) {
  return url.split(".").pop().toLowerCase();
}

export function isImage(file: any) {
  if (file.url && file.url.indexOf("blob:") !== -1) {
    return true;
  }

  switch (fileExtension(file.url)) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return true;
  }

  return false;
}
