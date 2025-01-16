import { useEffect, useState, useCallback } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  LinkRounded,
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded,
} from "@mui/icons-material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { ActiveItem } from "./ActiveItem";
import { FieldSelectorDialog } from "./FieldSelectorDialog";
import {
  useGetContentModelQuery,
  useGetContentModelItemsQuery,
  useSearchContentQuery,
  useGetLangsQuery,
  useGetContentModelFieldsQuery,
} from "../../services/instance";

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
  const [langCode, setLangCode] = useState("");
  const [itemZUIDs, setItemZUIDs] = useState<string[]>(value?.split(","));
  const [showAll, setShowAll] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  const { data: langs } = useGetLangsQuery({});
  const { data: modelData } = useGetContentModelQuery(relatedModelZUID, {
    skip: !relatedModelZUID,
  });
  const { data: contentItems } = useGetContentModelItemsQuery(
    {
      modelZUID: relatedModelZUID,
      params: {
        lang: langCode,
      },
    },
    { skip: !relatedModelZUID || !langCode }
  );
  const { data: modelFields } = useGetContentModelFieldsQuery(
    relatedModelZUID,
    { skip: !relatedModelZUID }
  );

  useEffect(() => {
    if (langs?.length) {
      setLangCode(langs?.find((lang) => lang.default)?.code);
    }
  }, [langs]);

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

  return (
    <Box component="section">
      <Stack gap={1}>
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
              draggable={multiselect}
            />
          ))}
        </DndProvider>
      </Stack>
      {itemZUIDs?.length > 5 && (
        <Button
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
        <Button
          variant="outlined"
          size="large"
          startIcon={<LinkRounded />}
          fullWidth
          onClick={(evt) => setAnchorEl(evt.currentTarget)}
          sx={{
            mt: 1,
          }}
        >
          Add Existing {modelData?.label}
        </Button>
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
        />
      )}
    </Box>
  );
};
