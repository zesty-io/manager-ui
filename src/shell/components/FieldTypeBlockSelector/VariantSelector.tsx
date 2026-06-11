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
  Tooltip,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { isValid } from "date-fns";

import { ContentItem } from "../../services/types";
import { formatLocalized } from "../../i18n-dates";
import { useGetUsersQuery } from "../../services/accounts";
import { NoSearchResults } from "../NoSearchResults";
import { NoVariant } from "./NoVariant";
import blockPlaceholder from "../../../../public/images/blockPlaceholder.png";

type VariantSelectorProps = {
  anchorEl: Element;
  onClose: () => void;
  variants: ContentItem[];
  blockModelZUID: string;
  blockModelName: string;
  onVariantSelected: (ZUID: string) => void;
};
export const VariantSelector = ({
  anchorEl,
  onClose,
  variants,
  blockModelZUID,
  blockModelName,
  onVariantSelected,
}: VariantSelectorProps) => {
  const { data: users } = useGetUsersQuery();
  const [filterKeyword, setFilterKeyword] = useState("");
  const filterTextField = useRef(null);
  const variantsRef = useRef<HTMLLIElement[]>([]);

  const filteredVariants = useMemo(() => {
    if (!filterKeyword) return variants;

    return variants?.filter((variant) =>
      variant?.web?.metaTitle
        ?.toLowerCase()
        ?.includes(filterKeyword?.toLowerCase()?.trim())
    );
  }, [variants, filterKeyword]);

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
            onChange={(evt) => {
              setFilterKeyword(evt.currentTarget.value);

              if (!!evt.currentTarget.value) {
                variantsRef.current?.[0]?.classList.add("hover");
              } else {
                variantsRef.current?.forEach((element) =>
                  element.classList.remove("hover")
                );
              }
            }}
            InputProps={{
              startAdornment: <Search color="action" />,
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              const allowedKeys = ["ArrowUp", "ArrowDown", "Escape", "Enter"];

              if (!allowedKeys.includes(e.key)) {
                e.stopPropagation();
              } else if (e.key === "Enter" && !!filterKeyword) {
                variantsRef.current?.[0]?.click();
              }
            }}
          />
        </ListSubheader>
        {!variants?.length ? (
          <NoVariant
            blockModelName={blockModelName}
            blockModelZUID={blockModelZUID}
          />
        ) : filteredVariants?.length ? (
          filteredVariants?.map((variant, index) => {
            const d = variant.web?.updatedAt
              ? new Date(variant.web.updatedAt)
              : null;
            const updatedOn =
              d && isValid(d) ? formatLocalized(d, "MMMM d") : "";
            return (
              <MenuItem
                ref={(node) => (variantsRef.current[index] = node)}
                data-cy={`Variant_${index}`}
                key={variant?.meta?.ZUID}
                divider={index + 1 < variants?.length}
                onClick={() => onVariantSelected(variant?.meta?.ZUID)}
                sx={{
                  display: "flex",
                  px: 2,
                  py: 1.75,
                  gap: 1.5,
                  borderColor: "border",

                  "&.hover": {
                    "-webkit-text-decoration": "none",
                    textDecoration: "none",
                    bgcolor: "rgba(16, 24, 40, 0.04)",
                  },
                }}
              >
                <Tooltip
                  enterDelay={500}
                  enterNextDelay={500}
                  disableInteractive
                  placement="left"
                  title={
                    <Box
                      component="img"
                      width={468}
                      src={
                        (variant?.data?.og_image as string) || blockPlaceholder
                      }
                      loading="lazy"
                      borderRadius={2}
                      sx={{
                        objectFit: "contain",
                      }}
                    ></Box>
                  }
                  components={{ Tooltip: Box }}
                  slotProps={{
                    popper: {
                      sx: {
                        maxWidth: "none",
                      },
                    },
                    tooltip: {
                      sx: {
                        mr: 1,
                      },
                    },
                  }}
                >
                  <Box
                    component="img"
                    width={125}
                    src={
                      (variant?.data?.og_image as string) || blockPlaceholder
                    }
                    loading="lazy"
                    sx={{
                      objectFit: "contain",
                    }}
                  ></Box>
                </Tooltip>
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
                    Updated on {updatedOn} by{" "}
                    {getUserName(variant?.web?.createdByUserZUID)}
                  </Typography>
                </Stack>
              </MenuItem>
            );
          })
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
