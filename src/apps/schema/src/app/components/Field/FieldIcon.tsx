import { Box, SvgIcon } from "@mui/material";
import { getFieldTypeMeta } from "shell/fieldTypes";

interface Props {
  type: string;
  height?: string;
  width?: string;
  fontSize?: string;
}
export const FieldIcon = ({ type, height, width, fontSize }: Props) => {
  const { icon, color, rotateIcon } = getFieldTypeMeta(type);
  const borderColor = color.fg;
  const bgcolor = color.bg;
  const transform = rotateIcon ? "rotate(-45deg)" : "";

  return (
    <Box
      border="1px solid red"
      borderColor={borderColor}
      borderRadius={1}
      bgcolor={bgcolor}
      color={borderColor}
      width={width || "24px"}
      height={height || "24px"}
      fontSize={fontSize || "12px"}
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxSizing="border-box"
    >
      <SvgIcon
        component={icon}
        fontSize="inherit"
        sx={{
          verticalAlign: "middle",
          transform,
          textAlign: "center",
        }}
      />
    </Box>
  );
};
