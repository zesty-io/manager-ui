import { useState, memo, useMemo, useRef, useEffect } from "react";
import { Button, Tooltip, Chip, MenuList, Popover } from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { useParams } from "react-router";
import { useDispatch } from "react-redux";
import { List, useDynamicRowHeight } from "react-window";

import { Row } from "./Row";
import { BG_COLOR_MAPPING } from "./VersionItem";

import {
  useGetContentItemVersionsQuery,
  useGetItemPublishingsQuery,
  useGetItemWorkflowStatusQuery,
  useGetWorkflowStatusLabelsQuery,
} from "../../../../../../../../../shell/services/instance";
import { Version } from "./VersionItem";
import { WorkflowStatusLabel } from "../../../../../../../../../shell/services/types";
import { format, isValid } from "date-fns";

export let ROW_HEIGHTS: Record<number, number> = {};
export const DEFAULT_ROW_HEIGHT = 66;
const DEFAULT_LIST_HEIGHT = 540;

type VersionSelectorProps = {
  activeVersion: number;
  modelZUIDOverride?: string;
  itemZUIDOverride?: string;
};
export const VersionSelector = memo(
  ({
    activeVersion,
    modelZUIDOverride,
    itemZUIDOverride,
  }: VersionSelectorProps) => {
    const dispatch = useDispatch();
    const listRef = useRef(null);
    const rowHeights = useRef(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);
    const [listHeight, setListHeight] = useState(DEFAULT_LIST_HEIGHT);
    const rowHeight = useDynamicRowHeight({
      defaultRowHeight: DEFAULT_ROW_HEIGHT,
    });
    const { modelZUID, itemZUID } = useParams<{
      modelZUID: string;
      itemZUID: string;
    }>();
    const resolvedModelZUID = modelZUIDOverride || modelZUID;
    const resolvedItemZUID = itemZUIDOverride || itemZUID;
    const { data: statusLabels, isLoading: isLoadingStatusLabels } =
      useGetWorkflowStatusLabelsQuery();
    const { data: itemWorkflowStatus, isLoading: isLoadingItemWorkflowStatus } =
      useGetItemWorkflowStatusQuery(
        { itemZUID: resolvedItemZUID, modelZUID: resolvedModelZUID },
        { skip: !resolvedItemZUID || !resolvedModelZUID }
      );
    const { data: itemPublishings, isLoading: isLoadingItemPublishings } =
      useGetItemPublishingsQuery(
        {
          modelZUID: resolvedModelZUID,
          itemZUID: resolvedItemZUID,
        },
        { skip: !resolvedModelZUID || !resolvedItemZUID }
      );
    const { data: versions, isLoading: isLoadingVersions } =
      useGetContentItemVersionsQuery(
        {
          modelZUID: resolvedModelZUID,
          itemZUID: resolvedItemZUID,
        },
        { skip: !resolvedModelZUID || !resolvedItemZUID }
      );

    const mappedVersions: Version[] = useMemo(() => {
      if (!versions?.length) return [];

      const activeVersion = itemPublishings?.find(
        (itemPublishing) => itemPublishing._active
      );

      const now = Date.now();
      const scheduledVersion = itemPublishings?.find((item) => {
        if (item._active) return false;
        if (item.unpublishAt) return false;
        const t = item.publishAt ? new Date(item.publishAt).getTime() : NaN;
        return Number.isFinite(t) && t > now;
      });

      return versions.map((v) => {
        let labels: WorkflowStatusLabel[] = [];
        let itemWorkflowZUID = "";

        if (statusLabels?.length && itemWorkflowStatus?.length) {
          const workflowStatusData = itemWorkflowStatus.find(
            (status) => status.itemVersion === v.meta?.version
          );
          const labelZUIDs = workflowStatusData?.labelZUIDs || [];
          itemWorkflowZUID = workflowStatusData?.ZUID;

          labels = labelZUIDs?.map((labelZUID) =>
            statusLabels.find((statusLabel) => statusLabel.ZUID === labelZUID)
          );
        }

        return {
          itemZUID: v.meta?.ZUID,
          modelZUID: v.meta?.contentModelZUID,
          itemVersionZUID: v.web?.versionZUID,
          itemVersion: v.meta?.version,
          itemWorkflowZUID,
          labels,
          createdAt: isValid(new Date(v.web?.createdAt))
            ? format(new Date(v.web?.createdAt), "MMM d yyyy, h:mm a")
            : "",
          isPublished: activeVersion?.version === v.meta?.version,
          isScheduled: scheduledVersion?.version === v.meta?.version,
        };
      });
    }, [versions, itemPublishings, itemWorkflowStatus, statusLabels]);

    const activeVersionLabels = useMemo(() => {
      return mappedVersions
        ?.find((version) => version.itemVersion === activeVersion)
        ?.labels?.filter((label) => !!label);
    }, [mappedVersions, activeVersion]);

    useEffect(() => {
      ROW_HEIGHTS = {};
    }, []);

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

    return (
      <>
        <Tooltip
          title="View Versions"
          enterDelay={1000}
          enterNextDelay={1000}
          placement="top-start"
        >
          <Button
            data-amp-track-id="content-version-selector-open-button"
            data-cy="VersionSelector"
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
            disabled={
              isLoadingVersions ||
              isLoadingStatusLabels ||
              isLoadingItemPublishings ||
              isLoadingItemWorkflowStatus
            }
          >
            v{activeVersion}
            {!!activeVersionLabels?.length && (
              <>
                <Chip
                  label={activeVersionLabels.slice(-1)?.[0]?.name}
                  size="small"
                  sx={{
                    ml: 0.5,
                    color: activeVersionLabels.slice(-1)?.[0]?.color,
                    maxWidth: 144,
                    bgcolor:
                      BG_COLOR_MAPPING[
                        activeVersionLabels.slice(-1)?.[0]?.color?.toLowerCase()
                      ],

                    "&:hover": {
                      bgcolor:
                        BG_COLOR_MAPPING[
                          activeVersionLabels
                            .slice(-1)?.[0]
                            ?.color?.toLowerCase()
                        ],
                    },
                    "&:focus": {
                      bgcolor:
                        BG_COLOR_MAPPING[
                          activeVersionLabels
                            .slice(-1)?.[0]
                            ?.color?.toLowerCase()
                        ],
                    },
                  }}
                />
                {activeVersionLabels?.length > 1 && (
                  <Chip
                    size="small"
                    label={`+${activeVersionLabels.length - 1}`}
                    sx={{ ml: 0.5 }}
                  />
                )}
              </>
            )}
          </Button>
        </Tooltip>
        <Popover
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: -8,
            horizontal: "right",
          }}
          anchorEl={anchorEl}
          open={!!anchorEl}
          slotProps={{
            paper: {
              sx: {
                height: listHeight,
                overflow: "auto",
                width: 379,
                bgcolor: "grey.50",
              },
            },
          }}
          sx={{
            "& .MuiList-root": {
              py: 0,
            },
          }}
        >
          <MenuList>
            <List
              rowCount={mappedVersions?.length}
              rowProps={
                {
                  versions: mappedVersions,
                  activeVersion,
                  handleLoadVersion,
                } as any
              }
              rowHeight={rowHeight}
              rowComponent={Row}
            />
          </MenuList>
        </Popover>
      </>
    );
  }
);
VersionSelector.displayName = "VersionSelector";
