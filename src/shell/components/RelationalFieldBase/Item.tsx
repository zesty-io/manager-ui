import { Typography } from "@mui/material";

type ItemProps = {
  itemZUID: string;
  draggable?: boolean;
};
export const Item = ({ itemZUID, draggable }: ItemProps) => {
  return <Typography>{itemZUID}</Typography>;
};
