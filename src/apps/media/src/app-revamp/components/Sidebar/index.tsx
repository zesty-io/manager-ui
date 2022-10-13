import { Box, Typography, Divider } from "@mui/material";
import { Folders } from "./Folders";
import { Menu } from "./Menu";
import { SearchBox } from "./Searchbox";

interface Props {
  lockedToGroupId?: string;
  isSelectDialog?: boolean;
}

export const Sidebar = ({ lockedToGroupId, isSelectDialog }: Props) => {
  return (
    <Box
      sx={{
        borderWidth: "0px",
        borderRightWidth: "1px",
        borderColor: "border",
        borderStyle: "solid",
        width: "220px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
        }}
      >
        <Typography variant="h4">
          {isSelectDialog && "Insert from"} Media
        </Typography>
        <SearchBox />
      </Box>
      {lockedToGroupId ? null : <Menu />}
      <Divider />
      <Folders lockedToGroupId={lockedToGroupId} />
    </Box>
  );
};
