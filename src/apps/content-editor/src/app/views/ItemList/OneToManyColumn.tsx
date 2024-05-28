import { useEffect, useRef, useState } from "react";
import { Box, Chip } from "@mui/material";
import { useSelector } from "react-redux";

import { AppState } from "../../../../../../shell/store/types";

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

type OneToManyColumnProps = {
  items: any[];
};
export const OneToManyColumn = ({ items }: OneToManyColumnProps) => {
  const allItems = useSelector((state: AppState) => state.content);
  const chipContainerRef = useRef<HTMLDivElement>();
  const [lastValidIndex, setLastValidIndex] = useState(allItems?.length - 1);
  const parentWidth = chipContainerRef.current?.parentElement?.clientWidth;
  const hiddenItems = items?.length - lastValidIndex - 1;

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
        {!!hiddenItems && <Chip label={`+${hiddenItems}`} size="small" />}
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
