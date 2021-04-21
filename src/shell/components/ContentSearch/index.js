import React, { useState, useRef, useEffect, useCallback } from "react";
import { connect, useDispatch } from "react-redux";
import moment from "moment-timezone";
import debounce from "lodash.debounce";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faDatabase,
  faExclamationTriangle,
  faFile,
  faListAlt,
  faSort,
  faSortAlphaDown,
  faUser,
  faEye
} from "@fortawesome/free-solid-svg-icons";

import { Search } from "@zesty-io/core/Search";
import { Loader } from "@zesty-io/core/Loader";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Input } from "@zesty-io/core/Input";
import { Url } from "@zesty-io/core/Url";

import { searchItems } from "shell/store/content";
import { notify } from "shell/store/notifications";

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
      if (term) {
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
                notify({
                  kind: "warn",
                  message: `Error searching for term: ${term}`
                })
              );
            }
          })
          .finally(() => setLoading(false));
      }
    }, 650),
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
    users: state.users,
    models: state.models
  };
})(props => {
  const [sortType, setSortType] = useState("default");
  const [filterTerm, setFilterTerm] = useState("");

  const sortBy = {
    default: (a, b) => {
      if (a.meta.sort < b.meta.sort) {
        return -1;
      }
      if (a.meta.sort > b.meta.sort) {
        return 1;
      }
      return 0;
    },
    alpha: (a, b) => {
      if (a.web.metaTitle?.toLowerCase() < b.web.metaTitle?.toLowerCase()) {
        return -1;
      }
      if (a.web.metaTitle?.toLowerCase() > b.web.metaTitle?.toLowerCase()) {
        return 1;
      }
      return 0;
    },
    edited: (a, b) => {
      if (moment(a.meta.updatedAt) > moment(b.meta.updatedAt)) {
        return -1;
      }
      if (moment(a.meta.updatedAt) < moment(b.meta.updatedAt)) {
        return 1;
      }
      return 0;
    },
    created: (a, b) => {
      if (moment(a.web.createdAt) > moment(b.web.createdAt)) {
        return -1;
      }
      if (moment(a.web.createdAt) < moment(b.web.createdAt)) {
        return 1;
      }
      return 0;
    },
    user: (a, b) => {
      if (a.web.createdByUserZUID > b.web.createdByUserZUID) {
        return -1;
      }
      if (a.web.createdByUserZUID < b.web.createdByUserZUID) {
        return 1;
      }
      return 0;
    }
  };

  const filter = opt => {
    if (filterTerm) {
      const lang = props.languages.find(
        lang => lang.ID === props.opt?.meta?.langID
      );

      if (
        opt.web?.metaTitle?.includes(filterTerm) ||
        opt.web?.path?.includes(filterTerm) ||
        opt.meta?.version === filterTerm ||
        lang?.code?.includes(filterTerm)
      ) {
        return true;
      }
    } else {
      return true;
    }
  };

  return (
    <ul
      className={cx(styles.SearchResults)}
      // NOTE we could get better performance if we handle the
      // onSelect event at this parent UL, by taking advantage of event bubbling
    >
      <li className={styles.Actions}>
        <div className={styles.SortBy}>
          <p className={styles.Title}>Sort By</p>
          <ButtonGroup>
            <Button onClick={() => setSortType("default")}>
              <FontAwesomeIcon icon={faSort} /> Default
            </Button>
            <Button onClick={() => setSortType("alpha")}>
              <FontAwesomeIcon icon={faSortAlphaDown} /> Title
            </Button>
            <Button onClick={() => setSortType("edited")}>
              <FontAwesomeIcon icon={faCalendar} /> Edited
            </Button>
            <Button onClick={() => setSortType("created")}>
              <FontAwesomeIcon icon={faCalendar} /> Created
            </Button>
            <Button onClick={() => setSortType("user")}>
              <FontAwesomeIcon icon={faUser} /> User
            </Button>
          </ButtonGroup>
        </div>

        <div className={styles.FilterBy}>
          <p className={styles.Title}>Filter By</p>
          <Input onChange={evt => setFilterTerm(evt.target.value)} />
        </div>
      </li>

      {props.loading && (
        <li>
          <Loader label="Searching" />
        </li>
      )}

      {!props.loading && !props.options.length && (
        <li className={styles.headline}>
          No results found for search term: <strong>{props.term}</strong>
        </li>
      )}

      {props.options
        .filter(filter)
        .sort(sortBy[sortType])
        .map((opt, i) => (
          <ListOption
            key={i}
            opt={opt}
            onSelect={props.onSelect}
            optRef={props.refs[i]}
            selectedIndex={props.selectedIndex}
            index={i}
            users={props.users}
            languages={props.languages}
            models={props.models}
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

  let modelIcon;
  const model = props.models[props.opt.meta.contentModelZUID];
  if (model && model.type) {
    if (model.type === "dataset") {
      modelIcon = (
        <FontAwesomeIcon className={styles.ModelIcon} icon={faDatabase} />
      );
    }
    if (model.type === "templateset") {
      modelIcon = (
        <FontAwesomeIcon className={styles.ModelIcon} icon={faFile} />
      );
    }
    if (model.type === "pageset") {
      modelIcon = (
        <FontAwesomeIcon className={styles.ModelIcon} icon={faListAlt} />
      );
    }
  }

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
        <span className={styles.title}>
          {props.opt?.web?.metaTitle ? (
            <React.Fragment>
              {modelIcon}
              {props.opt.web.metaTitle}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <FontAwesomeIcon icon={faExclamationTriangle} /> Item missing meta
              title
            </React.Fragment>
          )}
        </span>

        <span className={styles.Lang}>{lang?.code || ""}</span>
      </p>

      {/* path */}
      {props.opt?.web?.path && (
        <p className={styles.bodyText}>
          <Url
            href={`${CONFIG.URL_PREVIEW_FULL}${props.opt.web.path}`}
            target="_blank"
          >
            <FontAwesomeIcon icon={faEye} />
            &nbsp;{props.opt.web.path}
          </Url>
        </p>
      )}

      {/* meta */}
      <p className={styles.caption}>{`Created by ${
        createdBy
          ? createdBy.firstName + " " + createdBy.lastName
          : "Unknown User"
      } on ${moment(props.opt?.web?.createdAt).format(
        CONFIG.TIME_DISPLAY_FORMAT
      )}`}</p>
      <p className={styles.caption}>{`Version ${
        props.opt?.meta?.version
      } was edited ${moment(props.opt?.meta?.updatedAt).from()}`}</p>
    </li>
  );
};
