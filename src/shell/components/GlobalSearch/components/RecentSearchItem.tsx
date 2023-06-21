import { FC, useMemo } from "react";
import { ScheduleRounded } from "@mui/icons-material";

import { GlobalSearchItem } from "./GlobalSearchItem";
import { ResourceType } from "../../../services/types";
import { splitTextAndAccelerator } from "../utils";

interface RecentSearchItemProps {
  text: string;
  onRemove: (keyword: string) => void;
  onItemClick: (term: string, resourceType?: ResourceType | null) => void;
  searchAccelerator?: ResourceType | null;
}
export const RecentSearchItem: FC<RecentSearchItemProps> = ({
  text,
  onRemove,
  onItemClick,
  searchAccelerator,
  ...props
}) => {
  const splitTextResult = useMemo(() => {
    return splitTextAndAccelerator(text);
  }, [text]);

  return (
    <GlobalSearchItem
      {...props}
      text={splitTextResult.text}
      isRemovable
      data-cy="global-search-recent-keyword"
      icon={ScheduleRounded}
      onRemove={onRemove}
      searchAccelerator={splitTextResult.resourceType as ResourceType}
      onClick={() =>
        onItemClick(
          splitTextResult.text,
          splitTextResult.resourceType as ResourceType
        )
      }
    />
  );
};
