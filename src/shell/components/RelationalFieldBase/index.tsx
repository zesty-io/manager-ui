import { useEffect, useState, useCallback } from "react";
import { Box, Button, Stack } from "@mui/material";
import {
  LinkRounded,
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded,
  AddRounded,
} from "@mui/icons-material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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

type RelationalFieldBaseProps = {
  name: string;
  value: string;
  relatedModelZUID: string;
  relatedFieldZUID: string;
  onChange: (value: string, name: string) => void;
  multiselect?: boolean;
};
export const RelationalFieldBase = ({
  name,
  value,
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
  const [isCreateNewItemDialogOpen, setIsCreateNewItemDialogOpen] =
    useState(false);

  const { data: modelData, isLoading: isLoadingModelData } =
    useGetContentModelQuery(relatedModelZUID, {
      skip: !relatedModelZUID,
    });
  const { data: modelFields, isLoading: isLoadingModelFields } =
    useGetContentModelFieldsQuery(relatedModelZUID, {
      skip: !relatedModelZUID,
    });

  useEffect(() => {
    if (!!relatedModelZUID) {
      dispatch(fetchItems(relatedModelZUID));
    }
  }, [relatedModelZUID]);

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

  const isRenderedAsDialog = params.get("isDialog") === "true";

  return (
    <Box component="section">
      <Stack gap={1}>
        {isLoadingModelData || isLoadingModelFields ? (
          [...Array(multiselect ? 5 : 1)].map((_, index) => (
            <ActiveItemLoading key={index} draggable />
          ))
        ) : (
          <DndProvider backend={HTML5Backend}>
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
                  setItemZUIDs((prev) =>
                    prev.filter((zuid) => zuid !== itemZUID)
                  );
                  onChange(
                    itemZUIDs.filter((zuid) => zuid !== itemZUID).join(","),
                    name
                  );
                }}
                draggable={multiselect}
              />
            ))}
          </DndProvider>
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
        <Stack direction="row" gap={1} mt={1}>
          <Button
            data-cy="add-relational-item-button"
            variant="outlined"
            size="large"
            startIcon={<LinkRounded />}
            fullWidth
            onClick={(evt) => setAnchorEl(evt.currentTarget)}
            disabled={isLoadingModelData || isLoadingModelFields}
          >
            Add Existing {modelData?.label}
          </Button>
          {multiselect && !isRenderedAsDialog && (
            <Button
              data-cy="create-new-relational-item-button"
              variant="outlined"
              size="large"
              startIcon={<AddRounded />}
              fullWidth
              onClick={() => setIsCreateNewItemDialogOpen(true)}
              disabled={isLoadingModelData || isLoadingModelFields}
            >
              Create & Add New {modelData?.label}
            </Button>
          )}
        </Stack>
      )}
      {!!anchorEl && (
        <FieldSelectorDialog
          multiselect={multiselect}
          onClose={() => setAnchorEl(null)}
          modelZUID={relatedModelZUID}
          modelName={modelData?.label}
          relatedFieldName={
            modelFields?.find((field) => field.ZUID === relatedFieldZUID)?.name
          }
          selectedZUIDs={itemZUIDs}
          onUpdateSelectedZUIDs={(selectedZUIDs) => {
            onChange(
              !!selectedZUIDs?.length ? selectedZUIDs.join(",") : null,
              name
            );
            setItemZUIDs(!!selectedZUIDs?.length ? selectedZUIDs : null);
            setAnchorEl(null);
          }}
        />
      )}
      {isCreateNewItemDialogOpen && (
        <CreateNewItemDialog
          modelZUID={relatedModelZUID}
          onItemCreated={(evt) => {
            setIsCreateNewItemDialogOpen(false);

            const { itemZUID } = evt.detail;
            const newItemZUIDs = [...itemZUIDs, itemZUID];

            onChange(
              !!newItemZUIDs?.length ? newItemZUIDs.join(",") : null,
              name
            );
            setItemZUIDs(!!newItemZUIDs?.length ? newItemZUIDs : null);
          }}
          onClose={() => setIsCreateNewItemDialogOpen(false)}
        />
      )}
    </Box>
  );
};
