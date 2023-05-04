import { useMemo } from "react";
import { useLocalStorage } from "react-use";
import { cloneDeep } from "lodash";

const MaxSavedKeywords = 5;

type UseRecentSearches = [
  string[],
  (keyword: string) => void,
  (keyword: string) => void
];
const useRecentSearches: () => UseRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useLocalStorage(
    "zesty:globalSearch:recentSearches",
    "[]"
  );

  const recentSearchesArray: string[] = useMemo(() => {
    return JSON.parse(recentSearches || "[]");
  }, [recentSearches]);

  const addSearchTerm = (keyword: string) => {
    if (!Array.isArray(recentSearchesArray)) {
      return;
    }

    let keywords = cloneDeep(recentSearchesArray);

    // Remove the keyword if it was already saved
    if (keywords.includes(keyword)) {
      keywords = keywords.filter((term) => term !== keyword);
    }

    // Add the keyword at the beginning
    keywords.unshift(keyword);

    // Make sure only 5 keywords are saved
    keywords = keywords.slice(0, MaxSavedKeywords);

    setRecentSearches(JSON.stringify(keywords));
  };

  const deleteSearchTerm = (keyword: string) => {
    let keywords = cloneDeep(recentSearchesArray);
    keywords = keywords.filter((term) => term !== keyword);

    setRecentSearches(JSON.stringify(keywords));
  };

  return [recentSearchesArray, addSearchTerm, deleteSearchTerm];
};

export default useRecentSearches;
