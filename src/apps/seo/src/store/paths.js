export const PATHS_FETCHING = "PATHS_FETCHING";
export const PATHS_FETCH_ERROR = "PATHS_FETCH_ERROR";
export const PATHS_FETCH_SUCCESS = "PATHS_FETCH_SUCCESS";

/**
 * All available site url paths
 * which can be redirected to.
 */
export function paths(state = {}, action) {
  switch (action.type) {
    case PATHS_FETCH_SUCCESS:
      return action.paths;
      break;
    default:
      return state;
  }
}

export function pathsFetch() {
  return dispatch => {
    dispatch({
      type: PATHS_FETCHING
    });
    request(`/ajax/all_node_paths.ajax.php`)
      .then(paths => {
        dispatch({
          type: PATHS_FETCH_SUCCESS,
          paths: Object.keys(paths).reduce((acc, zuid) => {
            // Key our paths state by the url
            // urls must be unique in the system and
            // allows for looks by path
            acc[paths[zuid].path_full] = paths[zuid];
            return acc;
          }, {})
        });
      })
      .catch(err => {
        console.error(err);
        dispatch({
          type: PATHS_FETCH_ERROR,
          err
        });
      });
  };
}
