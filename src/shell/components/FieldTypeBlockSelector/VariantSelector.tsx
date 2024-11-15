import { useState, useMemo, useRef } from "react";
import {
  MenuList,
  TextField,
  MenuItem,
  Typography,
  Popover,
  Box,
  Stack,
  ListSubheader,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import moment from "moment";
import { useDebounce } from "react-use";

import { ContentItem } from "../../services/types";
import { useGetUsersQuery } from "../../services/accounts";
import { NoSearchResults } from "../NoSearchResults";

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
  const [filterKeyword, setFilterKeyword] = useState("");
  const [debouncedFilterKeyword, setDebouncedFilterKeyword] = useState("");
  const filterTextField = useRef(null);

  useDebounce(() => setDebouncedFilterKeyword(filterKeyword), 200, [
    filterKeyword,
  ]);

  const filteredVariants = useMemo(() => {
    if (!debouncedFilterKeyword) return variants;

    return variants?.filter((variant) =>
      variant?.web?.metaTitle
        ?.toLowerCase()
        ?.includes(debouncedFilterKeyword?.toLowerCase()?.trim())
    );
  }, [variants, debouncedFilterKeyword]);

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
          mt: 1,
          width: 436,
          maxHeight: 480,
        },
      }}
    >
      <MenuList sx={{ pt: 0 }}>
        <ListSubheader
          sx={{
            height: 72,
            borderBottom: 1,
            borderColor: "border",
            boxSizing: "border-box",
            p: 2,
          }}
        >
          <TextField
            autoFocus
            fullWidth
            placeholder="Search variants"
            ref={filterTextField}
            value={filterKeyword}
            onChange={(evt) => setFilterKeyword(evt.currentTarget.value)}
            InputProps={{
              startAdornment: <Search color="action" />,
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              const allowedKeys = ["ArrowUp", "ArrowDown", "Escape"];

              if (!allowedKeys.includes(e.key)) {
                e.stopPropagation();
              }
            }}
          />
        </ListSubheader>
        {!variants?.length ? (
          <Typography>No variants</Typography>
        ) : filteredVariants?.length ? (
          filteredVariants?.map((variant, index) => (
            <MenuItem
              key={variant?.meta?.ZUID}
              divider={index + 1 < variants?.length}
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
                  Updated on {moment(variant.web?.updatedAt).format("MMMM D")}{" "}
                  by {getUserName(variant?.web?.createdByUserZUID)}
                </Typography>
              </Stack>
            </MenuItem>
          ))
        ) : (
          <Box my={4}>
            <NoSearchResults
              query={filterKeyword}
              imageHeight={109}
              hideBackButton
              onSearchAgain={() => {
                setFilterKeyword("");
                filterTextField.current?.querySelector("input").focus();
              }}
            />
          </Box>
        )}
      </MenuList>
    </Popover>
  );
};
