import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import debounce from "lodash.debounce";
import { Link, useHistory } from "react-router-dom";

import { searchItems } from "shell/store/content";
import { Search } from "@zesty-io/core/Search";
import styles from "./styles.less";

export default React.memo(function GlobalSearch(props) {
  const dispatch = useDispatch();
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const history = useHistory();

  useEffect(() => {
    if (searchTerm !== "") {
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
        setSearchResults(res.data);
      });
    }, 500),
    []
  );

  function onChange(term) {
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
      clearSearch();
      const item = searchResults[selectedIndex];
      history.push(`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`);
    }
  }

  return (
    <div
      className={cx(styles.GlobalSearch, props.className)}
      onKeyDown={handleKeydown}
      tabIndex={-1}
    >
      <h1 className={styles.InstanceName}>zesty.pw prod testing instance</h1>
      <Search
        value={searchTerm}
        placeholder="Global Search (CMD + Shift + K) "
        onChange={onChange}
      />
      {searchResults && (
        <SearchResults
          results={searchResults}
          clearSearch={clearSearch}
          selectedIndex={selectedIndex}
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
        props.clearSearch();
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
      onClick={props.clearSearch}
    >
      {props.results.map((result, index) => (
        <li
          key={result.meta.ZUID}
          className={props.selectedIndex === index ? styles.SelectedRow : null}
        >
          <Link
            to={`/content/${result.meta.contentModelZUID}/${result.meta.ZUID}`}
          >
            <div className={styles.SearchResultTitle}>{result.data.title}</div>
            <div className={styles.SearchResultPath}>
              {result.web.path}
              {result.web.pathpart}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
