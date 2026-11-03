import { Box } from "@mui/material";
import { getFieldMeta } from "./studioFieldMeta";

// The small colour-coded field-type square (green text, red number, blue media,
// pink link, …). Shown in the Connect Item dropdown rows, the connected slot's
// chip, and the link dialog's field rows, so they always look the same.
//
// Lives in its own module rather than alongside its first consumer: both
// StudioInspectorPanel and StudioLinkItemDialog need it, and the panel already
// imports the dialog — keeping it here is what stops that becoming a cycle.
export const FieldIconChip = ({ datatype }: { datatype: string }) => {
  const meta = getFieldMeta(datatype);
  const { color, Icon, rotateIcon } = meta;
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        flexShrink: 0,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: color.bg,
        color: color.fg,
        border: 1,
        borderColor: color.fg,
      }}
    >
      <Icon
        sx={{
          fontSize: 16,
          transform: rotateIcon ? "rotate(-45deg)" : undefined,
        }}
      />
    </Box>
  );
};
