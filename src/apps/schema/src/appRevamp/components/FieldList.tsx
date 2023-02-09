import { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useParams } from "react-router";
import { isEqual } from "lodash";

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
import { ContentModelField } from "../../../../../shell/services/types";
import { FieldEmptyState } from "./FieldEmptyState";

type Params = {
  id: string;
};

interface Props {
  onNewFieldModalClick: (sortIndex: number | null) => void;
}
export const FieldList = ({ onNewFieldModalClick }: Props) => {
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
  const [reorderQueue, setReorderQueue] = useState([]);
  const [localFields, setLocalFields] = useState<ContentModelField[] | null>(
    null
  );
  const [deactivatedFields, setDeactivatedFields] = useState<
    ContentModelField[] | null
  >(null);

  useEffect(() => {
    if (fields?.length && !isEqual(localFields, fields)) {
      setLocalFields([...fields.filter((field) => !field?.deletedAt)]);
      setDeactivatedFields([...fields.filter((field) => field?.deletedAt)]);
    }
  }, [fields]);

  const sortedFields = useMemo(() => {
    if (draggedIndex === null || hoveredIndex === null) {
      return localFields;
    } else {
      const newFields = [...localFields];
      const draggedField = newFields[draggedIndex];
      newFields.splice(draggedIndex, 1);
      newFields.splice(hoveredIndex, 0, draggedField);
      return newFields;
    }
  }, [
    isFieldsFetching,
    isFieldsLoading,
    draggedIndex,
    hoveredIndex,
    localFields,
  ]);

  const filteredFields = useMemo(() => {
    if (search) {
      return sortedFields?.filter(
        (field) =>
          field.label.toLowerCase().includes(search.toLowerCase()) ||
          field.name.toLowerCase().includes(search.toLowerCase())
      );
    } else {
      return sortedFields;
    }
  }, [search, sortedFields]);

  const handleReorder = () => {
    const newLocalFields = [...localFields];
    const draggedField = newLocalFields[draggedIndex];
    newLocalFields.splice(draggedIndex, 1);
    newLocalFields.splice(hoveredIndex, 0, draggedField);

    setDraggedIndex(null);
    setHoveredIndex(null);
    setLocalFields(newLocalFields);
    setReorderQueue([
      ...reorderQueue,
      {
        modelZUID: id,
        fields: filteredFields.map((field, index) => ({
          ...field,
          sort: index,
        })),
      },
    ]);
  };

  const handleSearchAgain = () => {
    setSearch("");

    searchRef.current.focus();
  };

  useEffect(() => {
    if (reorderQueue.length && !isBulkFieldsUpdating) {
      bulkUpdateContentModelField(reorderQueue[0]).then(() => {
        setReorderQueue(reorderQueue.slice(1));
      });
    }
  }, [reorderQueue, isBulkFieldsUpdating]);

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

        {/* No search results */}
        {!Boolean(filteredFields?.length) && search && (
          <NoSearchResults
            searchTerm={search}
            onSearchAgain={handleSearchAgain}
            sx={{
              p: 3,
            }}
          />
        )}

        {/* No active or inactive fields in model */}
        {!Boolean(filteredFields?.length) &&
          !Boolean(deactivatedFields?.length) &&
          !search && (
            <FieldEmptyState onAddField={() => onNewFieldModalClick(null)} />
          )}

        <Box sx={{ overflowY: "scroll" }}>
          {/* Active fields are present */}
          {Boolean(filteredFields?.length) && (
            <>
              {filteredFields?.map((field, index) => {
                return (
                  <Box key={field.ZUID}>
                    {index !== 0 && (
                      <AddFieldDivider
                        indexToInsert={index}
                        disabled={!!search}
                        onDividerClick={() => onNewFieldModalClick(index)}
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
                    px: 4.5,
                    borderRadius: "8px",
                    fontWeight: 700,
                  }}
                  size="large"
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  fullWidth
                  onClick={() => onNewFieldModalClick(null)}
                >
                  Add Another Field to {model?.label}
                </Button>
              </Box>
            </>
          )}

          {/* No active fields BUT there are Deactivated fields and not searching */}
          {!Boolean(filteredFields?.length) &&
            Boolean(deactivatedFields?.length) &&
            !search && (
              <Box pl={3} pb={2}>
                <Typography variant="body2" color="text.secondary">
                  There are no active fields in this model.
                </Typography>
              </Box>
            )}

          {/* Inactive fields are present and not searching */}
          {Boolean(deactivatedFields?.length) && !search && (
            <Box mb={2}>
              <Box pl={3} pb={1.5}>
                <Typography variant="h6">Deactivated Fields</Typography>
                <Typography variant="body2" color="text.secondary">
                  These fields can be re-activated at any time if you'd like to
                  bring them back to the content model.
                </Typography>
              </Box>
              {deactivatedFields?.map((field, index) => {
                return (
                  <Box sx={{ pl: 3 }} key={field.ZUID}>
                    <Field
                      index={index}
                      field={field}
                      setDraggedIndex={setDraggedIndex}
                      setHoveredIndex={setHoveredIndex}
                      onReorder={handleReorder}
                      disableDrag
                      isDeactivated
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
      <FieldsListRight model={model} />
    </Box>
  );
};
