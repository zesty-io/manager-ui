import { memo, Fragment, useCallback, useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import debounce from "lodash/debounce";
import { searchItems } from "shell/store/content";
import { notify } from "shell/store/notifications";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@zesty-io/core/Input";
import { InputIcon } from "@zesty-io/core/InputIcon";
import { Infotip } from "@zesty-io/core/Infotip";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./ItemRoute.less";
export const ItemRoute = connect((state) => {
  return {
    content: state.content,
  };
})(
  memo(function ItemRoute(props) {
    const dispatch = useDispatch();
    const [pathPart, setPathPart] = useState(props.path_part);
    const [loading, setLoading] = useState(false);
    const [unique, setUnique] = useState(true);

    const validate = useCallback(
      debounce((path) => {
        if (!path) {
          setUnique(false);
          return;
        }

        const parent = props.content[props.parentZUID];
        const fullPath = parent ? parent.web.path + path : path;

        setLoading(true);

        return dispatch(searchItems(fullPath))
          .then((res) => {
            if (res) {
              if (res.data) {
                if (Array.isArray(res.data) && res.data.length) {
                  // check list of partial matches for exact path match
                  const matches = res.data.filter((item) => {
                    /**
                     * Exclude currently viewed item zuid, as it's currently saved path would match.
                     * Check if other results have a matching path, if so then it is already taken and
                     * can not be used.
                     * Result paths come with leading and trailing slashes
                     */
                    return (
                      item.meta.ZUID !== props.ZUID &&
                      item.web.path === "/" + fullPath + "/"
                    );
                  });
                  if (matches.length) {
                    props.dispatch(
                      notify({
                        kind: "warn",
                        message: (
                          <p>
                            URL <strong>{matches[0].web.path}</strong> is
                            unavailable. Used by&nbsp;
                            <AppLink
                              to={`/content/${matches[0].meta.contentModelZUID}/${matches[0].meta.ZUID}`}
                            >
                              {matches[0].web.metaLinkText ||
                                matches[0].web.metaTitle}
                            </AppLink>
                          </p>
                        ),
                      })
                    );
                  }

                  setUnique(!matches.length);
                } else {
                  props.dispatch(
                    notify({
                      kind: "warn",
                      message: `Path not found ${res.status}`,
                    })
                  );
                }
              } else {
                props.dispatch(
                  notify({
                    kind: "warn",
                    message: `API failed to return data ${res.status}`,
                  })
                );
              }
            } else {
              props.dispatch(
                notify({
                  kind: "warn",
                  message: `API failed to return response ${res.status}`,
                })
              );
            }
          })
          .finally(() => setLoading(false));
      }, 500),
      [props.parentZUID]
    );

    const onChange = (evt) => {
      // All URLs are lowercased
      // Replace ampersand characters with 'and'
      // Only allow alphanumeric characters
      const path = evt.target.value
        .trim()
        .toLowerCase()
        .replace(/\&/g, "and")
        .replace(/[^a-zA-Z0-9]/g, "-");

      validate(path);
      setPathPart(path);

      props.dispatch({
        type: "SET_ITEM_WEB",
        itemZUID: props.ZUID,
        key: "pathPart",
        value: path,
      });
    };

    // update internal state if external path part changes
    useEffect(() => {
      if (props.path_part) {
        validate(props.path_part);
        setPathPart(props.path_part);
      }
    }, [props.path_part, props.parentZUID]);

    return (
      <article className={styles.ItemRoute} data-cy="itemRoute">
        <label>
          <Infotip title="Path parts must be unique within your instance, lowercased and can not contain non-alphnumeric characters. This ensures you create SEO friendly structured and crawlable URLs." />
          &nbsp;URL Path Part
        </label>

        <div className={styles.Path}>
          {props.path_part === "zesty_home" ? (
            <h1>
              <FontAwesomeIcon icon={faHome} />
              &nbsp;Homepage
            </h1>
          ) : (
            <Fragment>
              <Input
                type={"text"}
                name="pathPart"
                className={styles.Part}
                value={pathPart}
                onChange={onChange}
              />

              {loading && (
                <InputIcon className={styles.Checking}>
                  <FontAwesomeIcon icon={faSpinner} spin />
                </InputIcon>
              )}

              {!loading && unique && (
                <InputIcon className={styles.Valid}>
                  <FontAwesomeIcon icon={faCheck} />
                </InputIcon>
              )}

              {!loading && !unique && (
                <InputIcon className={styles.Invalid}>
                  <FontAwesomeIcon icon={faTimes} />
                </InputIcon>
              )}
            </Fragment>
          )}
        </div>
      </article>
    );
  })
);
