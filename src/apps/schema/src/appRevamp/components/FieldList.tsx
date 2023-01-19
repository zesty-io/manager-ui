import { useState, useMemo, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useParams } from "react-router";
import {
  useBulkUpdateContentModelFieldMutation,
  useGetContentModelFieldsQuery,
  useGetContentModelsQuery,
} from "../../../../../shell/services/instance";
import { Field } from "./Field";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchIcon from "@mui/icons-material/Search";
import { AddFieldDivider } from "./AddFieldDivider";
import { FieldsListRight } from "./FieldsListRight";
import { NoSearchResults } from "./NoSearchResults";

type Params = {
  id: string;
};

export const FieldList = () => {
  const params = useParams<Params>();
  const { id } = params;
  const [search, setSearch] = useState("");
  const { data: models } = useGetContentModelsQuery();
  const {
    data: fields,
    isLoading: isFieldsLoading,
    isFetching: isFieldsFetching,
  } = useGetContentModelFieldsQuery(id);
  const [bulkUpdateContentModelField, { isLoading: isBulkFieldsUpdating }] =
    useBulkUpdateContentModelFieldMutation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const showSpinner = isFieldsLoading;
  const model = models?.find((model) => model.ZUID === id);
  const searchRef = useRef<HTMLDivElement>();

  useMemo(() => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  }, [fields]);

  const sortedFields = useMemo(() => {
    if (draggedIndex === null || hoveredIndex === null) {
      return fields;
    } else {
      const newFields = [...fields];
      const draggedField = newFields[draggedIndex];
      newFields.splice(draggedIndex, 1);
      newFields.splice(hoveredIndex, 0, draggedField);
      return newFields;
    }
  }, [isFieldsFetching, isFieldsLoading, draggedIndex, hoveredIndex]);

  const filteredFields = useMemo(() => {
    if (search) {
      return sortedFields.filter(
        (field) =>
          field.label.toLowerCase().includes(search.toLowerCase()) ||
          field.name.toLowerCase().includes(search.toLowerCase())
      );
    } else {
      return sortedFields;
    }
  }, [search, sortedFields]);

  const handleReorder = () => {
    bulkUpdateContentModelField({
      modelZUID: id,
      fields: filteredFields.map((field, index) => ({
        ...field,
        sort: index,
      })),
    });
  };

  const handleSearchAgain = () => {
    setSearch("");

    searchRef.current.focus();
  };

  if (showSpinner) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" height="100%" sx={{ overflowY: "scroll" }}>
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        gap={2}
        flex={1}
        sx={{ pr: 3, pt: 2, overflowY: "scroll" }}
      >
        <TextField
          size="small"
          placeholder="Search Fields"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ width: "360px", px: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          inputRef={searchRef}
        />

        {!Boolean(filteredFields.length) && search && (
          <NoSearchResults
            searchTerm={search}
            onSearchAgain={handleSearchAgain}
            sx={{
              p: 3,
            }}
          />
        )}

        {!Boolean(filteredFields.length) && !search && (
          // TODO: Replace with the no fields state component when figma provided
          <Typography>No fields</Typography>
        )}

        {Boolean(filteredFields.length) && (
          <Box sx={{ overflowY: "scroll" }}>
            {filteredFields?.map((field, index) => {
              return (
                <Box key={field.ZUID}>
                  {index !== 0 && (
                    <AddFieldDivider
                      indexToInsert={index}
                      disabled={!!search}
                    />
                  )}
                  <Box sx={{ pl: 3 }}>
                    <Field
                      index={index}
                      field={field}
                      setDraggedIndex={setDraggedIndex}
                      setHoveredIndex={setHoveredIndex}
                      onReorder={handleReorder}
                      disableDrag={!!search}
                    />
                  </Box>
                </Box>
              );
            })}
            <Box pl={3}>
              <Button
                sx={{
                  justifyContent: "flex-start",
                  my: 1,
                }}
                size="large"
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                fullWidth
              >
                Add Another Field to {model?.label}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
      <FieldsListRight model={model} />
    </Box>
  );
};
