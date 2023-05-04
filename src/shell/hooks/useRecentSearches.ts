import { useMemo } from "react";
import { useLocalStorage } from "react-use";
import { cloneDeep } from "lodash";

const MaxSavedKeywords = 50;

type UseRecentSearches = [
  string[],
  (keyword: string) => void,
  (keyword: string) => void
];
const useRecentSearches: () => UseRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useLocalStorage(
    "zesty:globalSearch:recentSearches",
    []
  );

  const addSearchTerm = (keyword: string) => {
    if (!Array.isArray(recentSearches)) {
      return;
    }

    let keywords = cloneDeep(recentSearches);

    // Remove the keyword if it was already saved
    if (keywords.includes(keyword)) {
      keywords = keywords.filter((term) => term !== keyword);
    }

    // Add the keyword at the beginning
    keywords.unshift(keyword);

    // Limit the number of keywords saved
    keywords = keywords.slice(0, MaxSavedKeywords);

    setRecentSearches(keywords);
  };

  const deleteSearchTerm = (keyword: string) => {
    let keywords = cloneDeep(recentSearches);
    keywords = keywords.filter((term) => term !== keyword);

    setRecentSearches(keywords);
  };

  return [recentSearches, addSearchTerm, deleteSearchTerm];
};

export default useRecentSearches;
