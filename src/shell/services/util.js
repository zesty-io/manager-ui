import Cookies from "js-cookie";

export const getResponseData = (response) => response.data;

export const prepareHeaders = (headers) => {
  const token = Cookies.get(__CONFIG__.COOKIE_NAME);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

export const generateThumbnail = (file) => {
  if (!!file.updated_at && !isNaN(new Date(file.updated_at).getTime())) {
    // Prevents browser image cache when a certain file has been already replaced
    return `${file.url}?width=300&height=300&fit=bounds&versionHash=${new Date(
      file.updated_at
    ).getTime()}`;
  }

  return `${file.url}?width=300&height=300&fit=bounds`;
};
