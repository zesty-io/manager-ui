import React, { useState, useRef, useEffect, useCallback } from "react";
import { connect, useDispatch } from "react-redux";
import debounce from "lodash.debounce";
import cx from "classnames";

import { searchItems } from "shell/store/content";
import { Search } from "@zesty-io/core/Search";
import styles from "./styles.less";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faEdit,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

export default React.forwardRef(function ContentSearch(props, ref) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [skipSearch, setSkipSearch] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (searchTerm !== "" && !skipSearch) {
      setLoading(true);
      debouncedSearch(searchTerm);
    } else {
      // search term "" will cancel any inflight searches
      setSearchResults([]);
      debouncedSearch.cancel();
    }
  }, [searchTerm, skipSearch]);

  const refs = searchResults.map(() => React.createRef());

  const debouncedSearch = useCallback(
    debounce(term => {
      dispatch(searchItems(term))
        .then(res => {
          let results = res.data;
          if (props.filterResults) {
            results = props.filterResults(results);
          }
          setSearchResults(results);
        })
        .finally(() => setLoading(false));
    }, 500),
    []
  );

  function handleChange(term) {
    setSearchTerm(term);
    // reset skip after user input
    setSkipSearch(false);
  }

  function clearSearch() {
    setSearchTerm("");
  }

  function handleKeydown(evt) {
    if (searchResults.length === 0) {
      return;
    }
    if (evt.key === "ArrowDown") {
      let newIndex;
      if (selectedIndex === searchResults.length - 1) {
        newIndex = 0;
      } else {
        newIndex = selectedIndex + 1;
      }
      setSelectedIndex(newIndex);
      refs[newIndex].current.scrollIntoView({
        block: "center",
        inline: "nearest"
      });
    } else if (evt.key === "ArrowUp") {
      let newIndex;
      if (selectedIndex <= 0) {
        newIndex = searchResults.length - 1;
      } else {
        newIndex = selectedIndex - 1;
      }
      setSelectedIndex(newIndex);
      refs[newIndex].current.scrollIntoView({
        block: "center",
        inline: "nearest"
      });
    } else if (evt.key === "Enter") {
      if (props.clearSearchOnSelect) {
        clearSearch();
      }
      const item = searchResults[selectedIndex];
      // skip search on user select
      setSkipSearch(true);
      props.onSelect(item, setSearchTerm);
    }
  }

  return (
    <div className={cx(styles.GlobalSearch, props.className)}>
      <Search
        ref={ref}
        className={styles.Search}
        value={searchTerm}
        onKeyDown={handleKeydown}
        onChange={handleChange}
        placeholder={props.placeholder}
      />
      {searchResults && (
        <SearchResults
          loading={loading}
          results={searchResults}
          clearSearch={clearSearch}
          clearSearchOnClickOutside={props.clearSearchOnClickOutside}
          clearSearchOnSelect={props.clearSearchOnSelect}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSkipSearch={setSkipSearch}
          selectedIndex={selectedIndex}
          refs={refs}
          onSelect={props.onSelect}
        />
      )}
    </div>
  );
});

const SearchResults = connect(state => {
  return {
    languages: state.languages
  };
})(props => {
  const wrapperRef = useRef(null);
  // clear search results if user clicks outside of results
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (props.clearSearchOnClickOutside) {
          props.clearSearch();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <ul
      ref={wrapperRef}
      className={cx(styles.SearchResults)}
      onClick={() => {
        if (props.clearSearchOnSelect) {
          props.clearSearch();
        }
      }}
    >
      {props.loading && props.searchTerm && (
        <li className={styles.Start}>Searching for "{props.searchTerm}"</li>
      )}

      {/* {!props.searchTerm && (
        <li className={styles.Start}>Search by content title, URL or ZUID</li>
      )} */}

      {!props.loading && props.searchTerm && !props.results.length && (
        <li className={styles.NoResults}>
          No matches for the term: {props.searchTerm}
        </li>
      )}

      {props.results.map((result, index) => (
        <li
          key={result.meta.ZUID}
          ref={props.refs[index]}
          className={props.selectedIndex === index ? styles.SelectedRow : null}
        >
          <div
            className={styles.ListItem}
            onClick={() => {
              // skip search on user select
              props.setSkipSearch(true);
              props.onSelect(result, props.setSearchTerm);
            }}
          >
            <FontAwesomeIcon icon={faEdit} />
            <div>
              <div className={styles.SearchResultTitle}>
                [
                {props.languages.length
                  ? props.languages[result.meta.langID - 1].code
                  : "en-US"}
                ]&nbsp;
                {!result.web.pathPart ? (
                  result.web.metaTitle || result.web.metaLinkText
                ) : result.web.metaTitle ? (
                  result.web.metaTitle
                ) : (
                  <span>
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Missing
                    Meta Title
                  </span>
                )}
              </div>
              <div className={styles.SearchResultPath}>
                {result.web.path}
                {result.web.pathpart}
              </div>
            </div>
            <FontAwesomeIcon
              className={styles.faChevronRight}
              icon={faChevronRight}
            />
          </div>
        </li>
      ))}
    </ul>
  );
});
