import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import debounce from "lodash.debounce";
import { Link } from "react-router-dom";

import { searchItems } from "shell/store/content";
import { Search } from "@zesty-io/core/Search";
import styles from "./styles.less";

export default React.memo(function GlobalSearch(props) {
  const dispatch = useDispatch();
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
    // console.log(evt.keyCode);
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
        <SearchResults results={searchResults} clearSearch={clearSearch} />
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
      {props.results.map(result => (
        <li key={result.meta.ZUID}>
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
