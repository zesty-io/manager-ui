import { FC, useMemo } from "react";
import { ScheduleRounded, SearchRounded } from "@mui/icons-material";

import { GlobalSearchItem } from "./GlobalSearchItem";
import { ResourceType } from "../../../services/types";

interface KeywordSearchItem {
  text: string;
  recentSearches: string[];
  onItemClick: () => void;
  searchAccelerator?: ResourceType | null;
}
export const KeywordSearchItem: FC<KeywordSearchItem> = ({
  text,
  recentSearches,
  onItemClick,
  searchAccelerator,
  ...props
}) => {
  const isRecentKeyword: boolean = useMemo(() => {
    return recentSearches?.includes(text);
  }, [recentSearches, text]);

  const icon = useMemo(() => {
    return isRecentKeyword ? ScheduleRounded : SearchRounded;
  }, [isRecentKeyword]);

  return (
    <GlobalSearchItem
      {...props}
      text={text}
      data-cy="global-search-term"
      icon={icon}
      searchAccelerator={searchAccelerator}
      onClick={onItemClick}
    />
  );
};
