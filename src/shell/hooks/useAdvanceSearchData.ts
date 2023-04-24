import { useReducer } from "react";
import { User } from "../services/types";

export interface SearchData {
  keyword: string;
  user: Partial<User>;
  date: string;
}
type UseAdvanceSearchData = [
  SearchData,
  (payload: Partial<SearchData>) => void
];
export const useAdvanceSearchData: () => UseAdvanceSearchData = () => {
  const [searchData, updateSearchData] = useReducer(
    (state: SearchData, payload: Partial<SearchData>) => {
      return {
        ...state,
        ...payload,
      };
    },
    { keyword: "", user: {}, date: "" }
  );

  return [searchData, updateSearchData];
};
