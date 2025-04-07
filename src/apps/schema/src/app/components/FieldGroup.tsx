import { useState, useMemo } from "react";
import { Box, Typography, Card, IconButton, Icon } from "@mui/material";
import { useParams } from "react-router";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import { useGetContentModelsQuery } from "../../../../../shell/services/instance";
import { Field } from "./Field";
import { AddFieldDivider } from "./AddFieldDivider";
import { ContentModelField } from "../../../../../shell/services/types";
import AddIcon from "@mui/icons-material/Add";
type Params = {
  id: string;
};

interface Props {
  onNewFieldModalClick: (sortIndex: number | null) => void;
  fields: ContentModelField[];
  groupName: string;
  onReorder?: () => void;
  onDraggedIndexGroup?: () => void;
  onHoveredIndexGroup?: () => void;
  disableDrag?: boolean;
}

export const FieldGroup = ({
  onNewFieldModalClick,
  fields,
  groupName,
  disableDrag,
  onDraggedIndexGroup,
  onHoveredIndexGroup,
  onReorder,
}: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const params = useParams<Params>();
  const { id } = params;
  const { data: models } = useGetContentModelsQuery();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const model = models?.find((model) => model.ZUID === id);
  // const [reorderQueue, setReorderQueue] = useState([]);
  const [localFields, setLocalFields] = useState<ContentModelField[] | null>(
    fields
  );

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDraggedIndexGroup();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onReorder();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    // if (e.target === e.currentTarget && !isDragOver) {
    //   onHoveredIndexGroup();
    // }
    if (e.target !== e.currentTarget) {
      return;
    }
    const targetRect = e.currentTarget.getBoundingClientRect();
    const threshold = 40; // Adjust this value as needed

    console.log(
      "testing",
      targetRect.bottom,
      e.clientY,
      targetRect.bottom - e.clientY
    );
    //Check if the pointer is within the top threshold or the bottom threshold
    // if (targetRect.bottom - e.clientY < threshold) {
    //   return
    // } else if(e.clientY - targetRect.top < threshold) {
    //   onHoveredIndexGroup(); // Call the parent function to set the hovered index
    // }
    if (e.clientY - targetRect.top < threshold) {
      onHoveredIndexGroup(); // Call the parent function to set the hovered index
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    console.log("testing on drag leave", e.target, e.currentTarget);
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // Retrieve the field data from the dataTransfer object
    const fieldData = e.dataTransfer.getData("field");
    if (fieldData) {
      const droppedField: ContentModelField = JSON.parse(fieldData);
      // Call your custom callback with the dropped field data
      console.log("ive been droped", droppedField);
    }
  };

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
  }, [draggedIndex, hoveredIndex, localFields]);

  const handleReorder = () => {
    const newLocalFields = [...localFields];
    const draggedField = newLocalFields[draggedIndex];
    newLocalFields.splice(draggedIndex, 1);
    newLocalFields.splice(hoveredIndex, 0, draggedField);

    setDraggedIndex(null);
    setHoveredIndex(null);
    setLocalFields(newLocalFields);
    // setReorderQueue([
    //   ...reorderQueue,
    //   {
    //     modelZUID: id,
    //     fields: filteredFields.map((field, index) => ({
    //       ...field,
    //       sort: index,
    //     })),
    //   },
    // ]);
  };

  // useEffect(() => {
  //   if (reorderQueue.length && !isBulkFieldsUpdating) {
  //     bulkUpdateContentModelField(reorderQueue[0]).then(() => {
  //       setReorderQueue(reorderQueue.slice(1));
  //     });
  //   }
  // }, [reorderQueue, isBulkFieldsUpdating]);

  const getStyle = () => {
    if (isDragging) {
      return { opacity: 0.01 };
    }

    return { opacity: 1 };
  };

  return (
    <Card
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnter={handleDragEnter}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      variant="outlined"
      sx={{
        px: 0.5,
        py: 2,
        ml: 4,
        borderRadius: "8px",
        borderColor: "border",
        ...getStyle(),
      }}
    >
      <Box display="flex" alignItems="center" gap={0.5} mb={1.5}>
        <IconButton
          className="drag-handle"
          size="small"
          disableRipple
          disabled={disableDrag}
          onMouseEnter={() => setIsDraggable(true)}
          onMouseLeave={() => setIsDraggable(false)}
          sx={{ cursor: "grab", pr: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <DragIndicatorRoundedIcon sx={{ width: "20px", height: "20px" }} />
        </IconButton>
        <Box mr={1.5} sx={{ fontSize: "24px" }}>
          🎩
        </Box>
        <Box>
          <Typography fontWeight={700}>{groupName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Some description
          </Typography>
        </Box>
      </Box>
      {isDragOver ? (
        <Box
          height={256}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          bgcolor="action.hover"
        >
          <Box mb={1.5} color="action">
            <AddIcon fontSize="large" color="action" />
          </Box>
          <Typography fontWeight={700} mb={0.5}>
            Drop and Add Field into Group
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This can be undone.
          </Typography>
        </Box>
      ) : Boolean(sortedFields?.length) ? (
        <div>test</div>
      ) : (
        <>
          {sortedFields?.map((field, index) => {
            return (
              <Box key={field.ZUID}>
                {index !== 0 && (
                  <AddFieldDivider
                    indexToInsert={index}
                    // disabled={!!search}
                    disabled={false}
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
                    disableDrag={disableDrag}
                    withDragIcon
                    withMenu
                    withHover
                  />
                </Box>
              </Box>
            );
          })}
        </>
      )}
    </Card>
  );
};
