import { useState } from "react";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import { Typography, Button } from "@mui/material";
import DeleteFontDialog from "./DeleteFontDialog";
import { capitalize } from "lodash";
import { getFontDataFromHref } from "../Browse";

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
  const { t } = useTranslation();
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
        data-cy="WebFontCard"
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
        <Typography
          data-cy="WebFontCardLabel"
          variant="h6"
          color="text.primary"
          fontWeight={700}
          noWrap
        >
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
                    {t("settings.fontPreviewText")}
                  </Typography>
                  <Button
                    data-cy="UninstallFontButton"
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
                    {t("settings.removeFontVariant", {
                      variant: capitalize(variant),
                    })}
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
