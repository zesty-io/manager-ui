import { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Switch,
  FormControlLabel,
  Link,
  Divider,
} from "@mui/material";
import { useParams } from "react-router";
import { isEqual } from "lodash";
import { useLocalStorage } from "react-use";

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
import { NoResults } from "./NoResults";
import { ContentModelField } from "../../../../../shell/services/types";
import { FieldEmptyState } from "./FieldEmptyState";
import { SEO_FIELDS, SYSTEM_FIELDS, SystemField } from "./configs";

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
  const [isSystemFieldsVisible, setIsSystemFieldsVisible] = useLocalStorage(
    "zesty:schemaSystemFields:open",
    "false"
  );

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
    <Box display="flex" height="100%" sx={{ overflowY: "auto" }}>
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        flex={1}
        pt={2}
        borderRight="1px solid"
        borderColor="border"
      >
        <Box
          mb={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          pr={2}
          pl={4}
        >
          <TextField
            data-cy="FieldListFilter"
            size="small"
            placeholder="Search Fields"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: "360px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            inputRef={searchRef}
          />
          <FormControlLabel
            label={
              <Typography variant="body2" color="text.secondary">
                Show system fields
              </Typography>
            }
            control={
              <Switch
                data-cy="ShowSystemFieldsBtn"
                checked={isSystemFieldsVisible === "true"}
                size="small"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setIsSystemFieldsVisible(String(e.target.checked));
                }}
              />
            }
            sx={{
              mr: 0,
            }}
          />
        </Box>

        <Box sx={{ overflowY: "auto", height: "100%", pr: 2 }}>
          {/* NO SEARCH RESULTS */}
          {!Boolean(filteredFields?.length) && search && (
            <NoResults
              type="search"
              searchTerm={search}
              onButtonClick={handleSearchAgain}
            />
          )}

          {/* NO ACTIVE OR INACTIVE FIELDS */}
          {!Boolean(filteredFields?.length) &&
            !Boolean(deactivatedFields?.length) &&
            !search && (
              <FieldEmptyState onAddField={() => onNewFieldModalClick(null)} />
            )}

          {/* ACTIVE FIELDS ARE PRESENT */}
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
                    <Box pl={4}>
                      <Field
                        index={index}
                        field={field}
                        setDraggedIndex={setDraggedIndex}
                        setHoveredIndex={setHoveredIndex}
                        onReorder={handleReorder}
                        disableDrag={!!search}
                        withDragIcon
                        withMenu
                        withHover
                      />
                    </Box>
                  </Box>
                );
              })}
              <Box pl={4} mb={!!deactivatedFields?.length ? 2 : 4}>
                <Button
                  data-cy="EndOfListAddFieldBtn"
                  sx={{
                    justifyContent: "flex-start",
                    mt: 1.5,
                    px: 4.5,
                    borderRadius: "8px",
                    fontWeight: 700,
                    height: "40px",
                    "& .MuiButton-startIcon": {
                      mr: 2,
                    },
                  }}
                  size="large"
                  variant="outlined"
                  startIcon={
                    <AddRoundedIcon sx={{ width: "24px", height: "24px" }} />
                  }
                  fullWidth
                  onClick={() => onNewFieldModalClick(null)}
                >
                  Add Another Field to {model?.label}
                </Button>
              </Box>
            </>
          )}

          {/* NO ACTIVE FIELDS BUT HAS INACTIVE FIELDS */}
          {!Boolean(filteredFields?.length) &&
            Boolean(deactivatedFields?.length) &&
            !search && (
              <Box pb={2.5} pl={4}>
                <Typography variant="body2" color="text.secondary">
                  There are no active fields in this model.
                </Typography>
              </Box>
            )}

          {/* INACTIVE FIELDS ARE PRESENT */}
          {Boolean(deactivatedFields?.length) && !search && (
            <Box
              mb={2.5}
              pl={4}
              display="flex"
              flexDirection="column"
              gap={1.5}
            >
              <Box>
                <Typography variant="h6" mb={1} fontWeight={700}>
                  Deactivated Fields
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  These fields can be re-activated at any time if you'd like to
                  bring them back to the content model.
                </Typography>
              </Box>
              {deactivatedFields?.map((field, index) => {
                return (
                  <Box key={field.ZUID}>
                    <Field
                      index={index}
                      field={field}
                      setDraggedIndex={setDraggedIndex}
                      setHoveredIndex={setHoveredIndex}
                      onReorder={handleReorder}
                      disableDrag
                      isDeactivated
                      withDragIcon
                      withMenu
                      withHover
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          {/* SEO Meta Fields */}
          {(!!filteredFields?.length || !!deactivatedFields?.length) &&
            !search && (
              <Box
                data-cy="SEOFields"
                ml={4}
                pt={2.5}
                mb={2.5}
                borderTop="1px solid"
                borderColor="grey.200"
              >
                <Typography variant="h6" mb={1} fontWeight={700}>
                  SEO Meta Fields
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Content models for single-page, multi-page and dataset models
                  come with SEO meta fields that are accessible via API or
                  Parsley. These fields are available to help with discovery on
                  search and are used for mass search in the Zesty API. The
                  value of these fields can be found under the{" "}
                  <strong>meta key</strong> in the{" "}
                  <Link
                    href="https://instances-api.zesty.org/#a630bb24-0760-a273-d125-88dce3bcb5b2"
                    target="_blank"
                    rel="noopener"
                  >
                    Instances API end point
                  </Link>
                  .
                </Typography>
                <Box display="flex" flexDirection="column" gap={1} mt={1.5}>
                  {SEO_FIELDS.map((field, index) => (
                    <Field
                      key={index}
                      field={field}
                      index={index}
                      disableDrag
                      withDragIcon={false}
                      withMenu={false}
                      withHover={false}
                    />
                  ))}
                </Box>
              </Box>
            )}

          {/* SYSTEM FIELDS */}
          {isSystemFieldsVisible === "true" && !search && (
            <Box
              data-cy="SystemFields"
              ml={4}
              pt={2.5}
              mb={2.5}
              borderTop="1px solid"
              borderColor="grey.200"
            >
              <Typography variant="h6" mb={1} fontWeight={700}>
                System Fields
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Each content item (child) of a model in Zesty comes included
                with non-editable system fields that represent the state of the
                content such as when it was created, updated, and the version.
                The value of these fields can be found under the{" "}
                <strong>meta key</strong> in the{" "}
                <Link
                  href="https://instances-api.zesty.org/#a630bb24-0760-a273-d125-88dce3bcb5b2"
                  target="_blank"
                  rel="noopener"
                >
                  Instances API end point
                </Link>
                .
              </Typography>
              <Box display="flex" flexDirection="column" gap={1} mt={1.5}>
                {SYSTEM_FIELDS.map((field, index) => (
                  <Field
                    key={index}
                    field={field}
                    index={index}
                    disableDrag
                    withDragIcon={false}
                    withMenu={false}
                    withHover={false}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <FieldsListRight model={model} />
    </Box>
  );
};
