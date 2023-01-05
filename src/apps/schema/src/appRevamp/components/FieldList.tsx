import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router";
import { useGetContentModelFieldsQuery } from "../../../../../shell/services/instance";
import { Field } from "./Field";

type Params = {
  id: string;
};

export const FieldList = () => {
  const params = useParams<Params>();
  const { id } = params;
  const { data: fields } = useGetContentModelFieldsQuery(id);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
  }, [fields, draggedIndex, hoveredIndex]);

  const handleReorder = () => {
    // PERFORM REORDER MUTATION HERE BASED ON NEW SORTED FIELDS
    console.log("Current field sort state", sortedFields);
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  return (
    <Box
      display="flex"
      gap={1}
      flexDirection="column"
      height="100%"
      sx={{ px: 3, py: 2, overflowY: "scroll" }}
    >
      {sortedFields?.map((field, index) => (
        <Field
          hasDragIcon
          isStatic={false}
          key={field.ZUID}
          index={index}
          field={field}
          setDraggedIndex={setDraggedIndex}
          setHoveredIndex={setHoveredIndex}
          onReorder={handleReorder}
        />
      ))}
    </Box>
  );
};
