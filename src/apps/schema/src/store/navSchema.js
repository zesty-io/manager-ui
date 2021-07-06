import {
  faFile,
  faListAlt,
  faDatabase,
  faExternalLinkSquareAlt,
  faLink,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

const ICONS = {
  templateset: faFile,
  pageset: faListAlt,
  dataset: faDatabase,
  external: faExternalLinkSquareAlt,
  internal: faLink,
  item: faFile,
  homepage: faHome,
  socialfeed: faDatabase,
};

const sortNav = (a, b) => {
  let labelA = a?.label?.toLowerCase().trim(); // ignore upper and lowercase
  let labelB = b?.label?.toLowerCase().trim(); // ignore upper and lowercase
  if (labelA < labelB) {
    return -1;
  }
  if (labelA > labelB) {
    return 1;
  }

  // names must be equal
  return 0;
};

export function navSchema(state = [], action) {
  switch (action.type) {
    case "FETCH_MODELS_SUCCESS":
      return Object.keys(action.payload)
        .map((modelZUID) => {
          return {
            ...action.payload[modelZUID],
            path: `/schema/${modelZUID}`,
            icon: ICONS[action.payload[modelZUID].type],
          };
        })
        .sort(sortNav);

    case "FETCH_MODEL_SUCCESS":
    case "CREATE_MODEL_SUCCESS":
      return [
        ...state,
        {
          ...action.payload,
          path: `/schema/${action.payload.ZUID}`,
          icon: action.payload.type,
        },
      ].sort(sortNav);

    default:
      return state;
  }
}
