import { useParams } from "react-router";
import { ContentBreadcrumbs } from "../../components/ContentBreadcrumbs";
import {
  Box,
  Button,
  CircularProgress,
  ThemeProvider,
  Typography,
} from "@mui/material";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelItemsQuery,
  useGetContentModelQuery,
} from "../../../../../../shell/services/instance";
import { theme } from "@zesty-io/material";
import { ItemListEmpty } from "./ItemListEmpty";
import { ItemListActions } from "./ItemListActions";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { useMemo, useRef, useState } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import noSearchResults from "../../../../../../../public/images/noSearchResults.svg";
import { ItemListFilters } from "./ItemListFilters";

export const ItemList2 = () => {
  const { modelZUID } = useParams<{ modelZUID: string }>();

  const { data: model, isFetching: isModelFetching } =
    useGetContentModelQuery(modelZUID);
  const { data: items, isFetching: isModelItemsFetching } =
    useGetContentModelItemsQuery(modelZUID);
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!search) return items;
    // filter items by all fields
    return items?.filter((item) => {
      return Object.values(item.data).some((value) => {
        if (!value) return false;
        return value.toString().toLowerCase().includes(search.toLowerCase());
      });
    });
  }, [items, search]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          height: "100%",
          "*": {
            boxSizing: "border-box",
          },
        }}
      >
        {isModelFetching || isModelItemsFetching || isFieldsFetching ? (
          <Box
            display="flex"
            height="100%"
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                px: 4,
                pt: 4,
                pb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                gap: 4,
              }}
            >
              <Box flex={1}>
                <ContentBreadcrumbs />
                <Typography
                  variant="h3"
                  mt={0.25}
                  fontWeight={700}
                  sx={{
                    display: "-webkit-box",
                    "-webkit-line-clamp": "2",
                    "-webkit-box-orient": "vertical",
                    wordBreak: "break-word",
                    wordWrap: "break-word",
                    hyphens: "auto",
                    overflow: "hidden",
                  }}
                >
                  {model?.label}
                </Typography>
              </Box>
              <ItemListActions
                onSearch={(value: string) => {
                  setSearch(value);
                }}
                ref={searchRef}
              />
            </Box>
            <Box
              height="100%"
              bgcolor="grey.50"
              px={4}
              sx={{
                overflowY: "auto",
              }}
            >
              {!items?.length ? (
                <ItemListEmpty />
              ) : (
                <>
                  <ItemListFilters />
                  {!filteredItems?.length ? (
                    <Box
                      data-cy="NoResults"
                      textAlign="center"
                      sx={{
                        maxWidth: 387,
                        mx: "auto",
                      }}
                    >
                      <img src={noSearchResults} alt="No search results" />
                      <Typography pt={4} pb={1} variant="h4" fontWeight={600}>
                        Your filter {search} could not find any results
                      </Typography>
                      <Typography variant="body2" pb={3} color="text.secondary">
                        Try adjusting your search. We suggest check all words
                        are spelled correctly or try using different keywords.
                      </Typography>
                      <Button
                        onClick={() => searchRef.current?.focus()}
                        variant="contained"
                        startIcon={<SearchRoundedIcon />}
                      >
                        Search Again
                      </Button>
                    </Box>
                  ) : (
                    <DataGridPro
                      rows={filteredItems?.map((item) => ({
                        id: item.meta.ZUID,
                        ...item.data,
                      }))}
                      columns={fields.map((field) => ({
                        field: field.name,
                        headerName: field.label,
                        sortable: false,
                        width: 150,
                      }))}
                    />
                  )}
                </>
              )}
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};
