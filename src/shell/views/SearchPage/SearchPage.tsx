import { FC, useMemo, useEffect } from "react";

import { useParams } from "../../../shell/hooks/useParams";
import { Typography, Box, Stack, Skeleton } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import moment from "moment-timezone";
import { cloneDeep } from "lodash";
import { useSelector } from "react-redux";

import { NoSearchResults } from "../../components/NoSearchResults";
import { useSearchContentQuery } from "../../services/instance";
import { SearchPageList } from "./List/SearchPageList";
import { BackButton } from "./BackButton";
import { Filters } from "./Filters";
import { getDateFilterFn } from "../../components/Filters/DateFilter";
import { useSearchModelsByKeyword } from "../../hooks/useSearchModelsByKeyword";
import {
  ContentItem,
  ContentModel,
  ResourceType,
  File as MediaFile,
} from "../../services/types";
import {
  useSearchCodeFilesByKeywords,
  File,
} from "../../hooks/useSearchCodeFilesByKeyword";
import {
  useSearchBinFilesQuery,
  useGetBinsQuery,
} from "../../services/mediaManager";

export interface SearchPageItem {
  ZUID: string;
  title: string;
  type: ResourceType;
  updatedAt: string;
  createdAt: string;
  createdByUserZUID: string;
  data: ContentItem | ContentModel | File | MediaFile;
}
export const SearchPage: FC = () => {
  const [params, setParams] = useParams();
  const query = params.get("q") || "";
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: contents, isFetching: isFetchingContent } =
    useSearchContentQuery(
      { query, order: "created", dir: "desc" },
      { skip: !query }
    );
  const [models, setModelKeyword] = useSearchModelsByKeyword();
  const [codeFiles, setCodeFileKeyword] = useSearchCodeFilesByKeywords();
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const { data: mediaFiles, isFetching: isFetchingMedia } =
    useSearchBinFilesQuery(
      { binIds: bins?.map((bin) => bin.id), term: query },
      {
        skip: !bins?.length || !query,
      }
    );

  const isLoading = isFetchingContent || isFetchingMedia;

  useEffect(() => {
    setModelKeyword(query);
    setCodeFileKeyword(query);
  }, [query]);

  // Combine results from contents, models, code files and media files
  const results: SearchPageItem[] = useMemo(() => {
    const sortBy = params.get("sort") || "";
    const contentResults: SearchPageItem[] =
      contents?.map((content) => {
        return {
          ZUID: content.meta?.ZUID,
          title: content.web?.metaTitle,
          type: "content",
          updatedAt: content.meta?.updatedAt,
          createdAt: content.meta?.createdAt,
          createdByUserZUID: content.web?.createdByUserZUID,
          data: content,
        };
      }) || [];

    const modelResults: SearchPageItem[] =
      models?.map((model) => {
        return {
          ZUID: model.ZUID,
          title: model.label,
          type: "schema",
          updatedAt: model.updatedAt,
          createdAt: model.createdAt,
          createdByUserZUID: model.createdByUserZUID,
          data: model,
        };
      }) || [];

    const fileResults: SearchPageItem[] =
      codeFiles?.map((file) => {
        return {
          ZUID: file.ZUID,
          title: file.fileName,
          type: "code",
          updatedAt: file.updatedAt,
          createdAt: file.createdAt,
          createdByUserZUID: "",
          data: file,
        };
      }) || [];

    const mediaResults: SearchPageItem[] =
      mediaFiles?.map((file) => {
        return {
          ZUID: file.id,
          title: file.filename,
          type: "media",
          updatedAt: file.updated_at,
          createdAt: file.created_at,
          createdByUserZUID: file.created_by ?? "",
          data: file,
        };
      }) || [];

    const consolidatedResults = [
      ...contentResults,
      ...modelResults,
      ...fileResults,
      ...mediaResults,
    ];

    // Sort the results
    switch (sortBy) {
      case "":
      case "modified":
        return consolidatedResults?.sort((a, b) => {
          return moment(b.updatedAt).diff(moment(a.updatedAt));
        });

      case "created":
        return consolidatedResults?.sort((a, b) => {
          return moment(b.createdAt).diff(moment(a.createdAt));
        });

      case "AtoZ":
        return consolidatedResults?.sort((a, b) => {
          return a.title?.localeCompare(b.title);
        });

      case "ZtoA":
        return consolidatedResults?.sort((a, b) => {
          return b.title?.localeCompare(a.title);
        });

      default:
        return consolidatedResults;
    }
  }, [contents, models, params, codeFiles, mediaFiles]);

  const filteredResults = useMemo(() => {
    let _results = cloneDeep(results);
    const resourceTypeFilter = params.get("resource") || "";
    const userFilter = params.get("user") || "";
    const dateFilter = {
      preset: params.get("datePreset") || "",
      from: params.get("from") || "",
      to: params.get("to") || "",
    };
    const isPreset = Boolean(dateFilter.preset);
    const isBefore = Boolean(dateFilter.to) && !Boolean(dateFilter.from);
    const isAfter = Boolean(dateFilter.from) && !Boolean(dateFilter.to);
    const isOn =
      Boolean(dateFilter.to) &&
      Boolean(dateFilter.from) &&
      dateFilter.to === dateFilter.from;
    const isRange =
      Boolean(dateFilter.to) &&
      Boolean(dateFilter.from) &&
      dateFilter.to !== dateFilter.from;
    let dateFilterFn: (date: string) => boolean;

    // Filter by user
    if (userFilter) {
      _results = _results.filter(
        (result) => result.createdByUserZUID === userFilter
      );
    }

    // Filter by resource type
    if (resourceTypeFilter) {
      _results = _results.filter(
        (result) => result.type === resourceTypeFilter
      );
    }

    // Determine the date filter function to use
    if (isPreset) {
      dateFilterFn = getDateFilterFn({
        type: "preset",
        value: dateFilter.preset,
      });
    }

    if (isBefore) {
      dateFilterFn = getDateFilterFn({ type: "before", value: dateFilter.to });
    }

    if (isAfter) {
      dateFilterFn = getDateFilterFn({ type: "after", value: dateFilter.from });
    }

    if (isOn) {
      dateFilterFn = getDateFilterFn({ type: "on", value: dateFilter.from });
    }

    if (isRange) {
      dateFilterFn = getDateFilterFn({
        type: "daterange",
        value: { from: dateFilter.from, to: dateFilter.to },
      });
    }

    // Apply date filter if there is any
    if (dateFilterFn) {
      _results = _results.filter((result) => {
        if (result.updatedAt) {
          return dateFilterFn(result.updatedAt);
        }

        return false;
      });
    }

    return _results;
  }, [results, params]);

  const renderBody = () => {
    if (!isLoading && !filteredResults?.length) {
      return <NoSearchResults query={query} />;
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          px: 3,
          py: 0,
          gap: 2,
          backgroundColor: "grey.50",
          height: "100%",
        }}
      >
        <SearchPageList results={filteredResults} loading={isLoading} />
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Stack
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 24px",
            gap: "10px",
            minHeight: "52px",
            boxSizing: "border-box",
            borderColor: "grey.100",
            borderStyle: "solid",
            borderWidth: "0px 1px 1px 1px",
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h6" color="text.primary">
            {isLoading ? (
              <Skeleton variant="text" width={200} />
            ) : (
              `${filteredResults?.length} results for "${query}"`
            )}
          </Typography>
          <BackButton />
        </Box>
        <Box
          py={2}
          px={3}
          sx={{
            backgroundColor: "grey.50",
          }}
        >
          <Filters />
        </Box>
        {renderBody()}
      </Stack>
    </ThemeProvider>
  );
};
