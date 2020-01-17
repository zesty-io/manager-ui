import React, { useState, useEffect } from "react";
import debounce from "lodash.debounce";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@zesty-io/core/Input";
import { InputIcon } from "@zesty-io/core/InputIcon";
import { Infotip } from "@zesty-io/core/Infotip";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";

import styles from "./ItemRoute.less";
export const ItemRoute = React.memo(function ItemRoute(props) {
  const [pathPart, setPathPart] = useState(props.path_part);
  const [loading, setLoading] = useState(false);
  const [unique, setUnique] = useState(true);

  const validate = debounce(path => {
    setLoading(true);

    return request(
      `${CONFIG.service.sites}/content/path-part-availability/${path}?zuid=${props.ZUID}`
    )
      .then(res => {
        if (!res.data.available) {
          props.dispatch(
            notify({
              message: "This URL path is already in use",
              kind: "error"
            })
          );
        }

        setLoading(false);
        setUnique(Boolean(res.data.available));
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        throw err;
      });
  }, 1000);

  const onChange = evt => {
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
      value: path
    });
  };

  // update internal state if external path part changes
  useEffect(() => setPathPart(props.path_part), [props.path_part]);

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
          <React.Fragment>
            <Input
              type={"text"}
              name="pathPart"
              className={styles.Part}
              value={pathPart}
              onChange={onChange}
            />

            {loading && (
              <InputIcon className={styles.Checking}>
                <FontAwesomeIcon icon={faSpinner} />
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
          </React.Fragment>
        )}
      </div>
    </article>
  );
});
