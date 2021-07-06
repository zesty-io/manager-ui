import { notify } from "shell/store/notifications";
import { request } from "utility/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faEnvelope,
  faFont,
  faTools,
} from "@fortawesome/free-solid-svg-icons";

export function settings(
  state = {
    // These are hard coded because there is no endpoint for font navigation
    // and we can not derive it from the fonts request
    catFonts: [
      {
        label: "Installed fonts",
        value: "installed_fonts",
        path: "/settings/fonts/installed",
        icon: faFont,
      },
      {
        label: "Browse fonts",
        value: "browse_fonts",
        path: "/settings/fonts/browse",
        icon: faFont,
      },
    ],
    fonts: [],
    fontsInstalled: [],

    catInstance: [],
    instance: [],

    catStyles: [],
    styles: [],
  },
  action
) {
  switch (action.type) {
    case "FETCH_SETTINGS_SUCCESS":
      return {
        ...state,
        instance: action.payload,

        // derived from instance settings
        catInstance: action.payload
          .filter((item, index, self) => {
            return (
              index === self.findIndex((t) => t.category === item.category)
            );
          })
          .map((item) => {
            return {
              label: item.category.replace(/_|-/g, " "),
              value: item.category,
              path: `/settings/instance/${item.category}`,
              icon: ICONS[item.category] || faCog,
            };
          }),
      };

    case "FETCH_STYLES_CATEGORIES_SUCCESS":
      return {
        ...state,
        catStyles: action.payload.map((item) => {
          return {
            label: item.name,
            value: item.ID,
            path: `/settings/styles/${item.ID}`,
            icon: ICONS[item.icon] || faCog,
          };
        }),
      };

    case "FETCH_STYLES_VARIABLES":
      return { ...state, styles: action.payload };

    case "FETCH_FONTS_SUCCESS":
      return { ...state, fonts: action.payload };

    case "FETCH_FONTS_INSTALLED":
      return { ...state, fontsInstalled: action.payload };

    case "UPDATE_SETTINGS_SUCCESS":
      const arrInstances = state.instance;
      arrInstances[
        arrInstances.map((item) => item.ZUID).indexOf(action.payload.ZUID)
      ] = action.payload;
      return {
        ...state,
        instance: arrInstances,
      };
    case "UPDATE_STYLES_SUCCESS":
      const styles = state.styles;
      const styleIndex = styles
        .map((item) => item.ZUID)
        .indexOf(action.payload.ZUID);
      styles[styleIndex] = action.payload;
      return {
        ...state,
        styles,
      };

    default:
      return state;
  }
}

const ICONS = {
  general: faCog,
  tools: faTools,
  contact: faEnvelope,
};

const sortNav = (a, b) => {
  let labelA = a.sort;
  let labelB = b.sort;
  if (labelA < labelB) {
    return -1;
  }
  if (labelA > labelB) {
    return 1;
  }

  // names must be equal
  return 0;
};

export function fetchSettings() {
  return (dispatch) => {
    return request(`${CONFIG.API_INSTANCE}/env/settings`)
      .then((res) => {
        res.data.forEach((data) => {
          // this make the legacy key:value,key:value option values work by fixing it to key:value;key:value
          // we cleaing the data before it goes to the memory store which allows it to be saved correctly
          if (data.dataType === "dropdown") {
            data.options = data.options.replaceAll(",", ";");
          }
        });

        dispatch({
          type: "FETCH_SETTINGS_SUCCESS",
          payload: res.data.sort(sortNav),
        });
      })
      .catch((err) => {
        console.error(err);
        dispatch(
          notify({
            kind: "warn",
            message: err.message,
          })
        );
      });
  };
}

export function fetchStylesCategories() {
  return (dispatch) => {
    return request(
      `${CONFIG.API_INSTANCE}/web/stylesheets/variables/categories`
    )
      .then((res) => {
        dispatch({
          type: "FETCH_STYLES_CATEGORIES_SUCCESS",
          payload: res.data.sort(sortNav),
        });
      })
      .catch((err) => {
        console.error(err);
        dispatch(
          notify({
            kind: "warn",
            message: err.message,
          })
        );
      });
  };
}

export function fetchStylesVariables() {
  return (dispatch) => {
    return request(`${CONFIG.API_INSTANCE}/web/stylesheets/variables`)
      .then((res) => {
        dispatch({
          type: "FETCH_STYLES_VARIABLES",
          // payload: dummy.variables
          payload: res.data,
        });
      })
      .catch((err) => {
        console.error(err);
        dispatch(
          notify({
            kind: "warn",
            message: err.message,
          })
        );
      });
  };
}

export function saveStyleVariable(zuid, data) {
  return (dispatch) => {
    return request(`${CONFIG.API_INSTANCE}/web/stylesheets/variables/${zuid}`, {
      method: "PUT",
      json: true,
      body: data,
    })
      .then((res) => {
        if (res) {
          dispatch({
            type: "UPDATE_STYLES_SUCCESS",
            payload: data,
          });
        }
      })
      .catch((err) => console.log("err", err));
  };
}

export function updateSettings(zuid, data) {
  return (dispatch) => {
    request(`${CONFIG.API_INSTANCE}/env/settings/${zuid}`, {
      method: "PUT",
      json: true,
      body: data,
    })
      .then((res) => {
        if (res) {
          dispatch({
            type: "UPDATE_SETTINGS_SUCCESS",
            payload: data,
          });
        }
      })
      .catch((err) => err);
  };
}

export function fetchFonts() {
  return (dispatch) => {
    request(
      "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAWGIDvIvAF69UQZR9vIOtz88s55deGs8Y"
    )
      .then((res) => {
        dispatch({
          type: "FETCH_FONTS_SUCCESS",
          payload: res.items,
        });
      })
      .catch((err) => console.log(err));
  };
}

export function installSiteFont(font, variants) {
  return (dispatch, getState) => {
    font = font.replace(/\s/g, "+");
    variants = variants.join();

    return request(`${CONFIG.API_INSTANCE}/web/headtags`, {
      method: "POST",
      json: true,
      body: {
        type: "link",
        attributes: {
          rel: "stylesheet",
          href: `https://fonts.googleapis.com/css?family=${font}:${variants}`,
        },
        sort: 1,
        resourceZUID: getState().instance.ZUID,
      },
    })
      .then((res) => res.data)
      .catch((err) => {
        console.log(err);
        return err;
      });
  };
}

export function fetchFontsInstalled() {
  return (dispatch) => {
    return request(`${CONFIG.API_INSTANCE}/web/headtags`)
      .then((res) => {
        return dispatch({
          type: "FETCH_FONTS_INSTALLED",
          payload: res.data.filter(
            (item) =>
              item.type === "link" &&
              item.attributes.href &&
              item.attributes.href.indexOf("https://fonts.googleapis.com/") ===
                0
          ),
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };
}

export function updateSiteFont(zuid, href) {
  return request(`${CONFIG.API_INSTANCE}/web/headtags/${zuid}`, {
    method: "PUT",
    json: true,
    body: {
      type: "link",
      sort: 1,
      attributes: {
        rel: "stylesheet",
        href: href,
      },
    },
  })
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return err;
    });
}

export function deleteSiteFont(zuid) {
  return request(`${CONFIG.API_INSTANCE}/web/headtags/${zuid}`, {
    method: "DELETE",
  })
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return err;
    });
}
