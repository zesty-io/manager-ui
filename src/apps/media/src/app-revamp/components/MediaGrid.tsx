import { useEffect, useRef, useMemo } from "react";
import { VariableSizeGrid } from "react-window";
import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useWindowSize } from "react-use";
import { Folder } from "../components/Folder";
import { File, Group } from "../../../../../shell/services/types";
import { xhrCallback } from "@sentry/tracing/types/browser/request";

const FILE_HEIGHT = 204;
const FOLDER_HEIGHT = 44;

interface Props {
  groups?: Group[];
  files?: File[];
  heightOffset?: number;
  widthOffset?: number;
}

export const MediaGrid = ({
  groups,
  files,
  heightOffset = 0,
  widthOffset = 0,
}: Props) => {
  const { width, height } = useWindowSize();

  const listRef = useRef<VariableSizeGrid>();

  const columns = useMemo(() => {
    // 258 px is the amount of extra space required to add a new column
    return Math.floor(width / 258);
  }, [width]);

  const grid = useMemo(() => {
    let tmp: string[] = [];
    // Adds group section if there are groups
    if (groups?.length) {
      // Add header cell and fill remaining column
      tmp = ["groups"].concat(new Array(columns - 1).fill("empty"));
      // Add item cells
      groups.forEach((group, i) => tmp.push(`group-${i}`));
      // Fill remaining columns
      const mod = groups.length % columns;
      tmp = tmp.concat(new Array(mod ? columns - mod : 0).fill("empty"));
    }
    // Adds file section if there are files
    if (files?.length) {
      tmp = tmp.concat(["files"]).concat(new Array(columns - 1).fill("empty"));
      files.forEach((file, i) => tmp.push(`file-${i}`));
      const mod = files.length % columns;
      tmp = tmp.concat(new Array(mod ? columns - mod : 0).fill("empty"));
    }

    return tmp;
  }, [groups, files, columns]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
  }, [width, widthOffset]);

  const getRowHeight = (index: number) => {
    const gridItem = grid[index * columns];

    if (gridItem.split("-")[0] === "file") {
      // + 16 row spacing
      return FILE_HEIGHT + 16;
    } else if (gridItem.split("-")[0] === "group") {
      // + 20 row spacing
      return FOLDER_HEIGHT + 20;
    } else {
      return 42;
    }
  };

  const Row = ({ columnIndex, rowIndex, style }: any) => {
    const gridItemType = grid[rowIndex * columns + columnIndex].split("-")[0];
    const gridItemIndex = Number(
      grid[rowIndex * columns + columnIndex].split("-")[1]
    );
    return (
      <div style={style}>
        {gridItemType === "empty" && <div></div>}
        {gridItemType === "groups" && (
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight={600}
            sx={{ px: 1 }}
          >
            Folders
          </Typography>
        )}
        {gridItemType === "group" && (
          <Box sx={{ height: "44px", px: 1 }}>
            {/* TODO: Construct path folder should navigate to */}
            <Folder name={groups[gridItemIndex].name} path="" />
          </Box>
        )}
        {gridItemType === "files" && (
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight={600}
            sx={{ px: 1 }}
          >
            Files
          </Typography>
        )}
        {gridItemType === "file" && (
          <Box sx={{ height: "204px", px: 1 }}>
            {/* TODO: Replace with Thumbnail component */}
            <Card>
              <CardMedia
                component="img"
                height="160"
                image={`${files[gridItemIndex].thumbnail}`}
                loading="lazy"
              />
              <CardContent>
                <Typography variant="body2">
                  {files[gridItemIndex].title}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </div>
    );
  };

  return (
    <VariableSizeGrid
      height={height - heightOffset}
      ref={listRef}
      columnCount={columns}
      columnWidth={(index) => (width - (widthOffset + 15)) / columns}
      rowHeight={(index) => getRowHeight(index)}
      rowCount={grid.length / columns}
      width={width - widthOffset}
    >
      {Row}
    </VariableSizeGrid>
  );
};
