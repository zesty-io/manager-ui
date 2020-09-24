import React, { useCallback, useState, useEffect } from "react";
import { connect } from "react-redux";
import debounce from "lodash/debounce";
import trimStart from "lodash/trimStart";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@zesty-io/core/Input";
import { InputIcon } from "@zesty-io/core/InputIcon";
import { Infotip } from "@zesty-io/core/Infotip";

import { request } from "utility/request";

import styles from "./ItemRoute.less";
export const ItemRoute = connect(state => {
  return {
    content: state.content
  };
})(
  React.memo(function ItemRoute(props) {
    const [pathPart, setPathPart] = useState(props.path_part);
    const [loading, setLoading] = useState(false);
    const [unique, setUnique] = useState(true);

    const validate = useCallback(
      debounce(path => {
        const parent = props.content[props.parentZUID];
        // if no parent match, assume root /
        const parentPath = parent ? parent.web.path : "/";
        // trimStart path because search endpoint can't handle leading slash
        const fullPath = trimStart(parentPath + path, "/");
        setLoading(true);

        return request(`${CONFIG.API_INSTANCE}/search/items?q=${fullPath}`)
          .then(res => {
            // check list of partial matches for exact path match
            const matches = res.data.filter(
              // result paths come with leading and trailing slashes
              val => val.web.path === "/" + fullPath + "/"
            );

            setLoading(false);
            setUnique(!matches.length);
          })
          .catch(err => {
            console.error(err);
            setLoading(false);
            throw err;
          });
      }, 1000),
      [props.parentZUID]
    );

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
  })
);
