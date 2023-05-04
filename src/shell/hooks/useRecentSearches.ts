import { useLocalStorage } from "react-use";

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

    // Remove the keyword if it was already saved previously
    let keywords = recentSearches.filter((term) => term !== keyword);

    // Add the keyword at the beginning
    keywords.unshift(keyword);

    // Limit the number of keywords saved
    setRecentSearches(keywords.slice(0, MaxSavedKeywords));
  };

  const deleteSearchTerm = (keyword: string) => {
    setRecentSearches(recentSearches.filter((term) => term !== keyword));
  };

  return [recentSearches, addSearchTerm, deleteSearchTerm];
};

export default useRecentSearches;
