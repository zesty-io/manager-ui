import {
  MenuList,
  TextField,
  MenuItem,
  Typography,
  Popover,
  Box,
  Stack,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import moment from "moment";

import { ContentItem } from "../../services/types";
import { useGetUsersQuery } from "../../services/accounts";

type VariantSelectorProps = {
  anchorEl: Element;
  onClose: () => void;
  variants: ContentItem[];
};
export const VariantSelector = ({
  anchorEl,
  onClose,
  variants,
}: VariantSelectorProps) => {
  const { data: users } = useGetUsersQuery();

  const getUserName = (ZUID: string) => {
    const user = users?.find((user) => user.ZUID === ZUID);

    if (!!user) {
      return `${user.firstName} ${user.lastName}`;
    }

    return "";
  };

  return (
    <Popover
      open
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        elevation: 8,
        sx: {
          width: 436,
        },
      }}
    >
      <Box
        height={72}
        p={2}
        borderBottom={1}
        borderColor="border"
        boxSizing="border-box"
        bgcolor="background.paper"
        position="sticky"
        top={0}
        zIndex={2}
      >
        <TextField
          fullWidth
          placeholder="Search variants"
          InputProps={{
            startAdornment: <Search color="action" />,
          }}
        />
      </Box>

      <MenuList>
        {variants?.map((variant) => (
          <MenuItem
            key={variant?.meta?.ZUID}
            divider
            sx={{
              display: "flex",
              px: 2,
              py: 1.75,
              gap: 1.5,
              borderColor: "border",
            }}
          >
            <Box
              component="img"
              width={125}
              height={80}
              src="https://via.placeholder.com/125x80"
            ></Box>
            <Stack width={267}>
              <Typography noWrap variant="body1" fontWeight={700}>
                {variant?.web?.metaTitle}
              </Typography>
              <Typography
                variant="body3"
                color="text.secondary"
                mt={0.5}
                fontWeight={600}
                sx={{
                  textWrap: "wrap",
                }}
              >
                Updated on {moment(variant.web?.updatedAt).format("MMMM D")} by{" "}
                {getUserName(variant?.web?.createdByUserZUID)}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </MenuList>
    </Popover>
  );
};
