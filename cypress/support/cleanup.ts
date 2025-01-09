import instanceZUID from "../../src/utility/instanceZUID";
import CONFIG from "../../src/shell/app.config";
import { StatusLabelQuery } from "src/shell/services/types";

const API_ENDPOINTS = {
  devInstance: `${
    CONFIG[process.env.NODE_ENV as keyof typeof CONFIG]?.API_INSTANCE_PROTOCOL
  }${instanceZUID}${
    CONFIG[process.env.NODE_ENV as keyof typeof CONFIG]?.API_INSTANCE
  }`,
};

export function preCleanUp(token: string) {
  statusLabelCleanUp(token);
}

// =========================   CLEANUP FUNCTIONS STARTS HERE   =========================//

// Status Labels
function statusLabelCleanUp(token: string) {
  const DEFAULT_STATUS_LABELS_ZUIDS = [
    "36-14b315-4pp20v3d",
    "36-14b315-d24ft",
    "36-n33d5-23v13w",
  ];
  const DEFAULT_STATUS_LABELS_NAMES = ["Approved", "Needs Review", "Draft"];
  sendRequest({
    method: "GET",
    url: `${API_ENDPOINTS.devInstance}/env/labels?showDeleted=true`,
    token: token,
  }).then((response) => {
    response?.data
      ?.filter(
        (resData: StatusLabelQuery) =>
          !resData?.deletedAt &&
          !DEFAULT_STATUS_LABELS_NAMES.includes(resData?.name) &&
          !DEFAULT_STATUS_LABELS_ZUIDS.includes(resData?.ZUID)
      )
      .forEach((labelForDelete: StatusLabelQuery) => {
        sendRequest({
          url: `${API_ENDPOINTS.devInstance}/env/labels/${labelForDelete.ZUID}`,
          method: "DELETE",
          token: token,
        });
      });
  });
}

// =========================   CLEANUP FUNCTIONS ENDS HERE   =========================//

function sendRequest({
  method = "GET",
  url = "",
  body = undefined,
  token = "",
}: {
  method?: string;
  url: string;
  body?: any;
  token: string;
}) {
  return cy
    .request({
      method,
      url,
      headers: { authorization: `Bearer ${token}` },
      ...(body ? { body: body } : {}),
    })
    .then((response) => ({
      status: response?.isOkStatusCode ? "success" : "error",
      data: response?.body?.data,
    }));
}
