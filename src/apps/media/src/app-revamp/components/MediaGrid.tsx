import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { VariableSizeGrid } from "react-window";
import { Box, Typography } from "@mui/material";
import { Folder } from "../components/Folder";
import { File, Group } from "../../../../../shell/services/types";
import { Thumbnail } from "./Thumbnail";
import { useHistory, useLocation } from "react-router-dom";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { useSelector } from "react-redux";
import { State } from "../../../../../shell/store/media-revamp";

const FILE_HEIGHT = 204;
const FOLDER_HEIGHT = 44;

interface Props {
  groups?: Group[];
  files?: File[];
  hideHeaders?: boolean;
}

export const MediaGrid = ({ groups, files, hideHeaders = false }: Props) => {
  const location = useLocation();
  const history = useHistory();
  const [columns, setColumns] = useState(4);
  const listRef = useRef<VariableSizeGrid>();
  const isSelectDialog = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.isSelectDialog
  );

  const onResize = (size: Size) => {
    setColumns(Math.floor(size.width / (225 + 16)));
    if (listRef.current != null) {
      listRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
  }, [groups, files]);

  const grid = useMemo(() => {
    let tmp: string[] = [];
    // Adds group section if there are groups
    if (groups?.length && columns) {
      if (!hideHeaders) {
        // Add header cell and fill remaining column
        tmp = ["groups"].concat(new Array(columns - 1).fill("empty"));
      }
      // Add item cells
      groups.forEach((group, i) => tmp.push(`group-${i}`));
      // Fill remaining columns
      const mod = groups.length % columns;
      tmp = tmp.concat(new Array(mod ? columns - mod : 0).fill("empty"));
    }
    // Adds file section if there are files
    if (files?.length && columns) {
      if (!hideHeaders) {
        tmp = tmp
          .concat(["files"])
          .concat(new Array(columns - 1).fill("empty"));
      }
      files.forEach((file, i) => tmp.push(`file-${i}`));
      const mod = files.length % columns;
      tmp = tmp.concat(new Array(mod ? columns - mod : 0).fill("empty"));
    }

    return tmp;
  }, [groups, files, columns]);

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

  const Row = useCallback(
    ({ columnIndex, rowIndex, style }: any) => {
      const gridItemType = grid[rowIndex * columns + columnIndex].split("-")[0];
      const gridItemIndex = Number(
        grid[rowIndex * columns + columnIndex].split("-")[1]
      );

      return (
        <div style={style} className="ThumbnailContainer">
          {gridItemType === "empty" && <div></div>}
          {gridItemType === "groups" && (
            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={600}
              sx={{
                px: 1,
              }}
            >
              Folders
            </Typography>
          )}
          {gridItemType === "group" && (
            <Box
              sx={{
                height: "44px",
                px: 1,
              }}
            >
              {/* TODO: Construct path folder should navigate to */}
              <Folder
                name={groups[gridItemIndex].name}
                id={groups[gridItemIndex].id}
              />
            </Box>
          )}
          {gridItemType === "files" && (
            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={600}
              sx={{
                px: 1,
              }}
            >
              Files
            </Typography>
          )}
          {gridItemType === "file" && (
            <Box
              sx={{
                height: "204px",
                px: 1,
              }}
            >
              <Thumbnail
                id={files[gridItemIndex].id}
                url={files[gridItemIndex].url}
                src={files[gridItemIndex].thumbnail}
                filename={files[gridItemIndex].filename}
                group_id={files[gridItemIndex].group_id}
                bin_id={files[gridItemIndex].bin_id}
                file={files[gridItemIndex]}
                selectable={isSelectDialog}
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  params.set("fileId", files[gridItemIndex]?.id);
                  history.replace({
                    pathname: location.pathname,
                    search: params.toString(),
                  });
                }}
              />
            </Box>
          )}
        </div>
      );
    },
    [grid]
  );

  return (
    <Box sx={{ pl: 2, width: "100%", height: "100%" }}>
      <AutoSizer onResize={onResize}>
        {({ width, height }) => (
          <VariableSizeGrid
            height={height}
            ref={listRef}
            columnCount={columns}
            columnWidth={(index) => (width - 16) / columns}
            rowHeight={(index) => getRowHeight(index)}
            rowCount={grid.length / columns}
            width={width}
          >
            {Row}
          </VariableSizeGrid>
        )}
      </AutoSizer>
    </Box>
  );
};
