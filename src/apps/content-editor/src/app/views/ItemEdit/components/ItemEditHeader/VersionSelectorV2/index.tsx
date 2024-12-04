import { useState, memo, useMemo, useRef } from "react";
import { Button, Tooltip, Chip, MenuList, Popover } from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { useParams } from "react-router";
import moment from "moment";
import { useDispatch } from "react-redux";
import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import { Row } from "./Row";

const dummyLabels = [
  "Approved",
  "Draft",
  "In Review",
  "For Publish",
  "Blocked",
  "Published",
  "Scheduled",
];
const generateDummyLabels = () => {
  let count = Math.floor(Math.random() * dummyLabels.length) + 1;
  const labels = [];

  while (count) {
    labels.push(dummyLabels[Math.floor(Math.random() * dummyLabels.length)]);
    count--;
  }

  return labels;
};

const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return "";

  const momentDate = moment(dateTimeString);
  const now = moment();

  if (momentDate.isSame(now, "day")) {
    return `Today ${momentDate.format("h:mm A")}`;
  } else if (momentDate.isSame(now.clone().subtract(1, "day"), "day")) {
    return `Yesterday ${momentDate.format("h:mm A")}`;
  } else if (momentDate.isSame(now.clone().add(1, "day"), "day")) {
    return `Tomorrow ${momentDate.format("h:mm A")}`;
  } else {
    return momentDate.format("MMM D h:mm A");
  }
};

import {
  useGetContentItemVersionsQuery,
  useGetItemPublishingsQuery,
} from "../../../../../../../../../shell/services/instance";
import { Version } from "./VersionItem";

type VersionSelectorProps = {
  activeVersion: number;
};
export const VersionSelector = memo(
  ({ activeVersion }: VersionSelectorProps) => {
    const dispatch = useDispatch();
    const listRef = useRef(null);
    const rowHeights = useRef(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);
    const { modelZUID, itemZUID } = useParams<{
      modelZUID: string;
      itemZUID: string;
    }>();
    const { data: itemPublishings } = useGetItemPublishingsQuery(
      {
        modelZUID,
        itemZUID,
      },
      { skip: !modelZUID || !itemZUID }
    );
    const { data: versions } = useGetContentItemVersionsQuery(
      {
        modelZUID,
        itemZUID,
      },
      { skip: !modelZUID || !itemZUID }
    );

    const mappedVersions: Version[] = useMemo(() => {
      if (!versions?.length) return [];

      const activeVersion = itemPublishings?.find(
        (itemPublishing) => itemPublishing._active
      );
      const scheduledVersion = itemPublishings?.find(
        (item) =>
          !item._active &&
          moment.utc(item.publishAt).isAfter(moment.utc()) &&
          !item.unpublishAt
      );

      return versions.map((v) => ({
        itemZUID: v?.meta?.ZUID,
        modelZUID: v?.meta?.contentModelZUID,
        itemVersionZUID: v?.web?.versionZUID,
        itemVersion: v?.meta?.version,
        // TODO: Change with actual values
        labels: generateDummyLabels(),
        createdAt: formatDateTime(v?.web?.createdAt),
        isPublished: activeVersion?.version === v?.meta?.version,
        isScheduled: scheduledVersion?.version === v?.meta?.version,
      }));
    }, [versions, itemPublishings]);

    const handleLoadVersion = (version: number) => {
      const versionToLoad = versions?.find((v) => v?.meta?.version === version);

      if (!!versionToLoad) {
        dispatch({
          type: "LOAD_ITEM_VERSION",
          itemZUID,
          data: versionToLoad,
        });
        setAnchorEl(null);
      }
    };

    const setRowHeight = (index: number, size: number) => {
      rowHeights.current = { ...rowHeights?.current, [index]: size };
      listRef.current?.resetAfterIndex(index);
    };

    const getRowHeight = (index: number) => {
      return rowHeights.current?.[index] || 90;
    };

    return (
      <>
        <Tooltip
          title="View Versions"
          enterDelay={1000}
          enterNextDelay={1000}
          placement="top-start"
        >
          <Button
            sx={{
              color: "text.disabled",
              fontWeight: 600,
              height: 28,
              minWidth: "unset",
              padding: 0.25,
              " .MuiButton-endIcon": {
                marginLeft: 0.5,
              },
            }}
            color="inherit"
            endIcon={<KeyboardArrowDownRounded color="action" />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            v{activeVersion}
            <Chip label="Draft" color="info" size="small" sx={{ ml: 0.5 }} />
          </Button>
        </Tooltip>
        <Popover
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: -26,
            horizontal: "right",
          }}
          anchorEl={anchorEl}
          open={!!anchorEl}
          slotProps={{
            paper: {
              sx: {
                height: "100%",
                maxHeight: 540,
                overflow: "auto",
                width: 379,
                bgcolor: "grey.50",
              },
            },
          }}
          sx={{
            "& .MuiMenu-list": {
              height: "100%",
              py: 0,
            },
          }}
        >
          <AutoSizer>
            {({ height, width }) => {
              return (
                <VariableSizeList
                  ref={listRef}
                  height={height}
                  width={width}
                  itemCount={mappedVersions?.length}
                  itemData={
                    {
                      versions: mappedVersions,
                      activeVersion,
                      handleLoadVersion,
                      setRowHeight,
                    } as any
                  }
                  itemSize={getRowHeight}
                  innerElementType={MenuList}
                >
                  {Row}
                </VariableSizeList>
              );
            }}
          </AutoSizer>
        </Popover>
      </>
    );
  }
);
VersionSelector.displayName = "VersionSelector";
