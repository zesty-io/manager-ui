import { useState, useRef, useMemo } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { TopBar } from "../../../components/TopBar";
import Box from "@mui/material/Box";
import { Typography, Button } from "@mui/material";

import DeleteFontDialog from "./DeleteFontDialog";
import { NoResults } from "../../../../../../schema/src/app/components/NoResults";
import SearchBox from "../../../../../../../shell/components/SearchBox";
import { capitalize } from "lodash";
import { useSettingsFonts } from "../hooks/useSettingsFonts";

const FONT_PREVIEW_TEXT = "All their equipment and instruments are alive.";

export type WebFontCardProps = {
  ZUID: string;
  href: string;
};

const getWeightAndStyle = (fontText: string) => {
  const sanitizedVariant = fontText?.trim()?.toLowerCase();
  const fontWeight = ["regular", "italic"]?.includes(sanitizedVariant)
    ? "400"
    : fontText?.replace(/(italic|i)/g, "");

  const fontStyle =
    sanitizedVariant?.includes("italic") || sanitizedVariant?.includes("i")
      ? "italic"
      : "normal";

  return {
    weight: +fontWeight,
    style: fontStyle,
  };
};

const WebFontCard = ({ ZUID, href }: WebFontCardProps) => {
  const { getFontDataFromHref } = useSettingsFonts();
  const { family, variants } = getFontDataFromHref(href);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [fontForDelete, setFontForDelete] = useState(null);
  const handleDeleteFontVariant = (variant: string) => {
    const updatedVariants = variants?.filter((item) => item !== variant);
    setFontForDelete({ ZUID, family, variant, updatedVariants });
    setDeleteDialogIsOpen(true);
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{
          width: "100%",
          pt: 4,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography variant="h6" color="text.primary" fontWeight={700} noWrap>
          {family}
        </Typography>

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="flex-start"
          width="100%"
          sx={{ pt: 3, pb: 1 }}
        >
          {variants
            ?.sort((a: string, b: string) => {
              const { weight: aWeight } = getWeightAndStyle(a);
              const { weight: bWeight } = getWeightAndStyle(b);
              return aWeight - bWeight;
            })
            ?.map((variant, index) => {
              const sanitizedVariant = variant?.trim()?.toLowerCase();

              const fontWeight = ["regular", "italic"]?.includes(
                sanitizedVariant
              )
                ? "400"
                : variant?.replace(/(italic|i)/g, "");

              const fontStyle =
                sanitizedVariant?.includes("italic") ||
                sanitizedVariant?.includes("i")
                  ? "italic"
                  : "normal";

              return (
                <Box
                  key={`${family}-${fontWeight}-${fontStyle}-${index}`}
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                  sx={{
                    py: 2,
                    position: "relative",
                    overflow: "hidden",
                    columnGap: 4,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={+fontWeight}
                    fontStyle={fontStyle}
                    fontFamily={family}
                    noWrap
                  >
                    {FONT_PREVIEW_TEXT}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteFontVariant(variant)}
                    startIcon={<DeleteIcon fontSize="small" />}
                    sx={{
                      flexGrow: 0,
                      whiteSpace: "nowrap",
                      minWidth: "fit-content",
                    }}
                  >
                    {`Remove ${capitalize(variant)}`}
                  </Button>
                </Box>
              );
            })}
        </Box>
      </Box>
      {!!deleteDialogIsOpen && (
        <DeleteFontDialog
          open={deleteDialogIsOpen}
          onClose={() => setDeleteDialogIsOpen(false)}
          family={fontForDelete?.family}
          variant={fontForDelete?.variant}
          ZUID={fontForDelete?.ZUID}
        />
      )}
    </>
  );
};

export default WebFontCard;
