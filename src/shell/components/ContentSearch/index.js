import React, { useState, useRef, useEffect, useCallback } from "react";
import { connect, useDispatch } from "react-redux";
import moment from "moment-timezone";
import debounce from "lodash.debounce";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faEdit
} from "@fortawesome/free-solid-svg-icons";

import { Search } from "@zesty-io/core/Search";
import { Loader } from "@zesty-io/core/Loader";

import { searchItems } from "shell/store/content";

import styles from "./styles.less";
export default React.forwardRef((props, providedRef) => {
  const dispatch = useDispatch();

  const [term, setTerm] = useState(props.value);
  const [loading, setLoading] = useState(false);
  const [refs, setRefs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSelected, setHasSelected] = useState(true);

  // Allow for consumer to externally update term
  useEffect(() => {
    setTerm(props.value);
  }, [props.value]);

  const debouncedSearch = useCallback(
    debounce(term => {
      dispatch(searchItems(term))
        .then(res => {
          if (res.status === 200) {
            let results = res.data;
            if (props.filterResults) {
              results = props.filterResults(results);
            }
            setRefs(results.map(() => React.createRef()));
            setSearchResults(results);
          } else {
            props.dispatch(
              notice({
                kind: "warn",
                message: `Error searching for term: ${term}`
              })
            );
          }
        })
        .finally(() => setLoading(false));
    }, 500),
    []
  );

  function handleKeyUp(evt) {
    // NOTE: Must happen before switch
    // If user starts typing into input reset hasSelected
    setHasSelected(false);

    switch (evt.key) {
      case "ArrowUp":
      case "ArrowDown":
        // Navigate up/down search results
        const index =
          evt.key === "ArrowUp" ? selectedIndex - 1 : selectedIndex + 1;

        // Only allow index within the range of indexes
        if (index >= 0 && index < refs.length) {
          const optionRef = refs[index];

          if (optionRef?.current) {
            optionRef.current.scrollIntoView({
              block: "center",
              inline: "nearest"
            });
          }

          setSelectedIndex(index);
        }
        break;

      case "Enter":
        handleSelect(searchResults[selectedIndex]);
        break;

      default:
        setLoading(true);
        debouncedSearch(evt.target.value);
        break;
    }
  }

  function handleFocus(evt) {
    setHasSelected(false);
  }

  function handleSelect(option) {
    props.onSelect(option);

    // Clear term to close options list
    setTerm("");
    setHasSelected(true);
  }

  // clear search results if user clicks outside of results list
  const searchRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(evt) {
      if (searchRef.current && !searchRef.current.contains(evt.target)) {
        setHasSelected(true);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  return (
    <div className={cx(styles.GlobalSearch, props.className)} ref={searchRef}>
      <Search
        className={styles.Search}
        placeholder={props.placeholder}
        onKeyUp={handleKeyUp}
        onChange={val => setTerm(val)}
        onFocus={handleFocus}
        ref={providedRef}
        value={term}
      />
      {term && !hasSelected && (
        <List
          term={term}
          loading={loading}
          options={searchResults}
          onSelect={handleSelect}
          refs={refs}
          selectedIndex={selectedIndex}
        />
      )}
    </div>
  );
});

const List = connect(state => {
  return {
    languages: state.languages,
    users: state.users
  };
})(props => {
  return (
    <ul
      className={cx(styles.SearchResults)}
      // NOTE we could get better performance if we handle the
      // onSelect event at this parent UL, by taking advantage of event bubbling
    >
      {props.loading && (
        <li>
          <Loader label="Searching" />
        </li>
      )}

      {!props.loading && !props.options.length && (
        <li>
          <FontAwesomeIcon icon={faExclamationTriangle} /> No results found for
          search term: <strong>{props.term}</strong>
        </li>
      )}

      {props.options.map((opt, i) => (
        <ListOption
          key={i}
          opt={opt}
          onSelect={props.onSelect}
          optRef={props.refs[i]}
          selectedIndex={props.selectedIndex}
          index={i}
          users={props.users}
          languages={props.languages}
        />
      ))}
    </ul>
  );
});

const ListOption = props => {
  const createdBy = props.users.find(
    user => user.ZUID === props.opt?.web?.createdByUserZUID
  );

  const lang = props.languages.find(
    lang => lang.ID === props.opt?.meta?.langID
  );

  return (
    <li
      onClick={() => props.onSelect(props.opt)}
      ref={props.optRef}
      className={cx(
        styles.bodyText,
        props.selectedIndex === props.index ? styles.SelectedRow : null
      )}
    >
      {/* main line */}
      <p className={styles.ItemName}>
        <span className={styles.subheadline}>
          {props.opt?.web?.metaTitle ? (
            <React.Fragment>
              {/* <span>TODO show model icon</span>  */}
              <span>
                <FontAwesomeIcon icon={faEdit} />
              </span>

              {/* TODO show item language */}
              {props.opt.web.metaTitle}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <FontAwesomeIcon icon={faExclamationTriangle} /> Item missing meta
              title
            </React.Fragment>
          )}
        </span>

        <span>{lang?.code || ""}</span>
      </p>

      {/* path */}
      {props.opt?.web?.path && <p>{props.opt.web.path}</p>}

      {/* meta */}
      <p>{`Created by ${
        createdBy
          ? createdBy.firstName + " " + createdBy.lastName
          : "Unknown User"
      } on ${moment(props.opt?.web?.createdAt).format(
        CONFIG.TIME_DISPLAY_FORMAT
      )}`}</p>
      <p>{`Version ${props.opt?.meta?.version} last edited ${moment(
        props.opt?.meta?.updatedAt
      ).from()}`}</p>
    </li>
  );
};
