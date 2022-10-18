import { DragEvent } from "react";
import { Card } from "@mui/material";

import { File } from "../../../../../../shell/services/types";

export const ThumbnailDrag = ({
  file,
  children,
  onClick,
}: {
  file: File;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const onDragStart = (evt: DragEvent) => {
    evt.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        id: file.id,
        filename: file.filename,
        groupd_id: file.group_id,
        bin_id: file.bin_id,
      })
    );
    evt.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        borderWidth: "1px",
        borderColor: "grey.100",
        borderStyle: "solid",
        borderRadius: "6px",
        cursor: onClick ? "pointer" : "default",
      }}
      elevation={0}
      onClick={onClick}
      draggable
      onDragStart={(evt: DragEvent) => onDragStart(evt)}
    >
      {children}
    </Card>
  );
};
