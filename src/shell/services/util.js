import Cookies from "js-cookie";

export const getResponseData = (response) => response.data;

export const prepareHeaders = (headers) => {
  const token = Cookies.get(__CONFIG__.COOKIE_NAME);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

export const generateThumbnail = (file) =>
  `${file.url}?width=300&height=300&fit=bounds`;
