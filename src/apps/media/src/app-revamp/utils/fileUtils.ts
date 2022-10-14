export function fileExtension(url: string) {
  let extension = "No Extension";
  if (url.includes(".")) {
    extension =
      url.substring(url.lastIndexOf(".") + 1, url.length) || "No Extension";
  }
  return extension;
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
