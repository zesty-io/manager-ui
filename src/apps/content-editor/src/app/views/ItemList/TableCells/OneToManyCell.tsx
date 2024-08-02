import { useEffect, useRef, useState } from "react";
import { Box, Chip, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { AppState } from "../../../../../../../shell/store/types";
import { searchItems } from "../../../../../../../shell/store/content";

const getNumOfItemsToRender = (
  parentWidth: number,
  children: HTMLCollection
) => {
  if (!children) return;

  let validIndex = 0;
  let calculatedWidth = 32; //Padding

  [...children]?.forEach((chip, index) => {
    calculatedWidth = calculatedWidth + chip?.clientWidth + 4;

    if (calculatedWidth <= parentWidth) {
      validIndex = index;
    }
  });

  return validIndex;
};

type OneToManyCellProps = {
  items: any[];
};
export const OneToManyCell = ({ items }: OneToManyCellProps) => {
  const dispatch = useDispatch();
  const allItems = useSelector((state: AppState) => state.content);
  const chipContainerRef = useRef<HTMLDivElement>();
  const [lastValidIndex, setLastValidIndex] = useState(
    Object.keys(allItems)?.length - 1
  );
  const parentWidth = chipContainerRef.current?.parentElement?.clientWidth;
  const hiddenItems = items?.length - lastValidIndex - 1;

  useEffect(() => {
    items?.forEach((item) => {
      // If value starts with '7-', that means it was unable to find the item in the store so we need to fetch it
      if (item?.startsWith("7-")) {
        dispatch(searchItems(item));
      }
    });
  }, [items, dispatch]);

  useEffect(() => {
    setLastValidIndex(
      getNumOfItemsToRender(parentWidth, chipContainerRef.current?.children)
    );
  }, [parentWidth]);

  return (
    <>
      <Box display="flex" gap={0.5}>
        {items?.slice(0, lastValidIndex + 1)?.map((id: string) => {
          return (
            <Chip
              key={id}
              label={allItems?.[id]?.web?.metaTitle || id}
              size="small"
            />
          );
        })}
        {!!hiddenItems && (
          <Tooltip
            title={`${items?.slice(lastValidIndex + 1)?.join(", ")}`}
            placement="top-start"
          >
            <Chip label={`+${hiddenItems}`} size="small" />
          </Tooltip>
        )}
      </Box>
      {/** Element below is only needed to calculate the actual chip widths */}
      <Box visibility="hidden" display="flex" gap={0.5} ref={chipContainerRef}>
        {items?.map((id: string) => {
          return (
            <Chip
              key={id}
              label={allItems?.[id]?.web?.metaTitle || id}
              size="small"
            />
          );
        })}
      </Box>
    </>
  );
};
