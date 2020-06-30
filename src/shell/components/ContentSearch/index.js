import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import debounce from "lodash.debounce";
import cx from "classnames";

import { searchItems } from "shell/store/content";
import { Search } from "@zesty-io/core/Search";
import styles from "./styles.less";

export default React.memo(function ContentSearch(props) {
  const dispatch = useDispatch();
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (searchTerm !== "" && searchTerm.charAt(0) !== "/") {
      debouncedSearch(searchTerm);
    } else {
      // search term "" will cancel any inflight searches
      setSearchResults([]);
      debouncedSearch.cancel();
    }
  }, [searchTerm]);

  const debouncedSearch = useCallback(
    debounce(term => {
      dispatch(searchItems(term)).then(res => {
        let results = res.data;
        if (props.filterResults) {
          results = props.filterResults(results);
        }
        setSearchResults(results);
      });
    }, 500),
    []
  );

  function handleChange(term) {
    setSearchTerm(term);
  }

  function clearSearch() {
    setSearchTerm("");
  }

  function handleKeydown(evt) {
    if (searchResults.length === 0) {
      return;
    }
    if (evt.key === "ArrowDown") {
      if (selectedIndex === searchResults.length - 1) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex(selectedIndex + 1);
      }
    } else if (evt.key === "ArrowUp") {
      if (selectedIndex <= 0) {
        setSelectedIndex(searchResults.length - 1);
      } else {
        setSelectedIndex(selectedIndex - 1);
      }
    } else if (evt.key === "Enter") {
      if (props.clearSearchOnSelect) {
        clearSearch();
      }
      const item = searchResults[selectedIndex];
      props.onSelect(item, setSearchTerm);
    }
  }

  return (
    <div className={cx(styles.GlobalSearch, props.className)}>
      <Search
        value={searchTerm}
        onKeyDown={handleKeydown}
        onChange={handleChange}
        placeholder="Global Search (CMD + Shift + K) "
      />
      {searchResults && (
        <SearchResults
          results={searchResults}
          clearSearch={clearSearch}
          clearSearchOnClickOutside={props.clearSearchOnClickOutside}
          clearSearchOnSelect={props.clearSearchOnSelect}
          setSearchTerm={setSearchTerm}
          selectedIndex={selectedIndex}
          onSelect={props.onSelect}
        />
      )}
    </div>
  );
});

function SearchResults(props) {
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
      className={styles.SearchResults}
      onClick={() => {
        if (props.clearSearchOnSelect) {
          props.clearSearch();
        }
      }}
    >
      {props.results.map((result, index) => (
        <li
          key={result.meta.ZUID}
          className={props.selectedIndex === index ? styles.SelectedRow : null}
        >
          <div
            onClick={() => {
              props.onSelect(result, props.setSearchTerm);
            }}
          >
            <div className={styles.SearchResultTitle}>
              {result.web.metaTitle}
            </div>
            <div className={styles.SearchResultPath}>
              {result.web.path}
              {result.web.pathpart}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
