import { useEffect, useState, useCallback, useContext } from "react";
import { Box, Button, Stack } from "@mui/material";
import {
  LinkRounded,
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded,
  AddRounded,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";

import { ActiveItem } from "./ActiveItem";
import { FieldSelectorDialog } from "./FieldSelectorDialog";
import {
  useGetContentModelQuery,
  useGetContentModelFieldsQuery,
} from "../../services/instance";
import { fetchItems } from "../../store/content";
import { ActiveItemLoading } from "./ActiveItem/ActiveItemLoading";
import { CreateNewItemDialog } from "./CreateNewItemDialog";
import { useParams } from "../../hooks/useParams";
import { CreateContentItemDialogContext } from "../../contexts/CreateContentItemDialogProvider";
import DndContextProvider from "../DndContextProvider";

type RelationalFieldBaseProps = {
  name: string;
  value: string;
  fieldLabel: string;
  fieldZUID: string;
  relatedModelZUID: string;
  relatedFieldZUID: string;
  onChange: (value: string, name: string) => void;
  multiselect?: boolean;
};
export const RelationalFieldBase = ({
  name,
  value,
  fieldLabel,
  fieldZUID,
  relatedModelZUID,
  relatedFieldZUID,
  onChange,
  multiselect,
}: RelationalFieldBaseProps) => {
  const dispatch = useDispatch();
  const [params] = useParams();
  const [itemZUIDs, setItemZUIDs] = useState<string[]>(value?.split(",") || []);
  const [showAll, setShowAll] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);
  const [replace, setReplace] = useState<string | null>(null);
  const [
    initiatorZUID,
    setInitiatorZUID,
    newlyCreatedItemZUID,
    setNewlyCreatedItemZUID,
  ] = useContext(CreateContentItemDialogContext);

  const { data: modelData, isLoading: isLoadingModelData } =
    useGetContentModelQuery(relatedModelZUID, {
      skip: !relatedModelZUID,
    });
  const { data: modelFields, isLoading: isLoadingModelFields } =
    useGetContentModelFieldsQuery(
      { modelZUID: relatedModelZUID },
      {
        skip: !relatedModelZUID,
      }
    );

  useEffect(() => {
    // Ensures that the values always synced
    setItemZUIDs(value?.split(",") || []);
  }, [value]);

  useEffect(() => {
    if (!!relatedModelZUID) {
      dispatch(fetchItems(relatedModelZUID));
    }
  }, [relatedModelZUID]);

  useEffect(() => {
    if (!!newlyCreatedItemZUID && initiatorZUID === fieldZUID) {
      const newItemZUIDs = [...itemZUIDs, newlyCreatedItemZUID];

      onChange(!!newItemZUIDs?.length ? newItemZUIDs.join(",") : null, name);
      setInitiatorZUID(null);
      setNewlyCreatedItemZUID(null);
    }
  }, [newlyCreatedItemZUID, itemZUIDs, initiatorZUID]);

  const handleMoveCard = useCallback(
    (draggedItemZUID: string, dropIndex: number) => {
      const draggedIndex = itemZUIDs.indexOf(draggedItemZUID);
      const _itemZUIDs = [...itemZUIDs];

      _itemZUIDs.splice(draggedIndex, 1);
      _itemZUIDs.splice(dropIndex, 0, draggedItemZUID);

      setItemZUIDs(_itemZUIDs);
    },
    [itemZUIDs]
  );

  const handleReorder = useCallback(() => {
    onChange(itemZUIDs?.join(","), name);
  }, [itemZUIDs]);

  const closeFieldSelectorDialog = () => {
    setReplace(null);
    setAnchorEl(null);
  };

  const isRenderedAsDialog = params.get("isDialog") === "true";
  const isLoading = isLoadingModelData || isLoadingModelFields;

  return (
    <Box component="section">
      <Stack gap={1}>
        {isLoading ? (
          [...Array(multiselect ? 5 : 1)].map((_, index) => (
            <ActiveItemLoading key={index} draggable />
          ))
        ) : (
          <DndContextProvider>
            {itemZUIDs?.slice(0, showAll ? undefined : 5)?.map((val, index) => (
              <ActiveItem
                key={val}
                index={index}
                itemZUID={val}
                relatedModelData={modelData}
                relatedFieldData={modelFields?.find(
                  (field) => field.ZUID === relatedFieldZUID
                )}
                onMoveCard={handleMoveCard}
                onDropCard={handleReorder}
                onRemoveCard={(itemZUID) => {
                  onChange(
                    itemZUIDs.filter((zuid) => zuid !== itemZUID).join(","),
                    name
                  );
                }}
                draggable={multiselect}
                openFieldSelectorDialog={(evt) => {
                  setReplace(val);
                  setAnchorEl(evt.currentTarget);
                }}
              />
            ))}
          </DndContextProvider>
        )}
      </Stack>
      {itemZUIDs?.length > 5 && (
        <Button
          data-cy="show-all-button"
          fullWidth
          size="large"
          color="inherit"
          variant="text"
          onClick={() => setShowAll((prev) => !prev)}
          sx={{
            mt: 1,
          }}
          startIcon={
            showAll ? <KeyboardArrowUpRounded /> : <KeyboardArrowDownRounded />
          }
        >
          Viewing {showAll ? itemZUIDs?.length : "5"} of {itemZUIDs?.length}{" "}
          items. See {showAll ? "Less" : "All"}.
        </Button>
      )}
      {(multiselect || (!multiselect && !value)) && (
        <Stack
          direction="row"
          gap={1}
          mt={!!itemZUIDs?.length || isLoading ? 1 : 0}
        >
          <Button
            data-cy="add-relational-item-button"
            variant="outlined"
            size="large"
            startIcon={<LinkRounded />}
            fullWidth
            onClick={(evt) => setAnchorEl(evt.currentTarget)}
            disabled={isLoading || !modelData}
          >
            Add Existing {fieldLabel}
          </Button>
          {!isRenderedAsDialog && (
            <Button
              data-cy="create-new-relational-item-button"
              variant="outlined"
              size="large"
              startIcon={<AddRounded />}
              fullWidth
              onClick={() => setInitiatorZUID(fieldZUID)}
              disabled={isLoading || !modelData}
            >
              Create & Add New {fieldLabel}
            </Button>
          )}
        </Stack>
      )}
      {!!anchorEl && (
        <FieldSelectorDialog
          multiselect={!!replace ? false : multiselect}
          onClose={closeFieldSelectorDialog}
          modelZUID={relatedModelZUID}
          fieldLabel={fieldLabel}
          relatedFieldName={
            modelFields?.find((field) => field.ZUID === relatedFieldZUID)?.name
          }
          selectedZUIDs={itemZUIDs}
          onUpdateSelectedZUIDs={(selectedZUIDs) => {
            onChange(
              !!selectedZUIDs?.length ? selectedZUIDs.join(",") : null,
              name
            );
            closeFieldSelectorDialog();
          }}
          replace={replace}
        />
      )}
      {initiatorZUID === fieldZUID && (
        <CreateNewItemDialog
          modelZUID={relatedModelZUID}
          onClose={() => setInitiatorZUID(null)}
        />
      )}
    </Box>
  );
};
