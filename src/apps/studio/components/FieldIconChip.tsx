import { Box } from "@mui/material";
import { FIELD_CATEGORY_COLORS, getFieldMeta } from "./studioFieldMeta";

// The small colour-coded field-type square (green text, red number, blue media,
// pink link, …). Shown in the Connect Item dropdown rows, the connected slot's
// chip, and the link dialog's field rows, so they always look the same.
//
// Lives in its own module rather than alongside its first consumer: both
// StudioInspectorPanel and StudioLinkItemDialog need it, and the panel already
// imports the dialog — keeping it here is what stops that becoming a cycle.
export const FieldIconChip = ({ datatype }: { datatype: string }) => {
  const meta = getFieldMeta(datatype);
  const colors = FIELD_CATEGORY_COLORS[meta.category];
  const Icon = meta.Icon;
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
        bgcolor: colors.bg,
        color: colors.fg,
        border: `1px solid ${colors.fg}`,
      }}
    >
      <Icon sx={{ fontSize: 16 }} />
    </Box>
  );
};
