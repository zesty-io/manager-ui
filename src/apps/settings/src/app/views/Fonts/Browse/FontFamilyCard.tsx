import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import { Typography, FormGroup } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  useCreateHeadTagMutation,
  useUpdateHeadTagsMutation,
} from "../../../../../../../shell/services/instance";
import AddIcon from "@mui/icons-material/Add";
import { notify } from "../../../../../../../shell/store/notifications";
import { FormControlLabel, Checkbox } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../../shell/store/types";
import { fetchFontsInstalled } from "../../../../../../../shell/store/settings";

export type FontFamilyCardProps = {
  ZUID: string | null;
  family: string;
  variants: string[];
  installedVariants: string[];
  previewText: string;
  activePage: number;
};

const FontFamilyCard = ({
  ZUID = null,
  family,
  variants,
  installedVariants,
  previewText,
  activePage,
}: FontFamilyCardProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const instance = useSelector((state: AppState) => state.instance);

  const [selectedVariants, setSelectedVariants] = useState([]);
  const [activeVariants, setActiveVariants] = useState(installedVariants);

  const [createHeadTag, { isLoading: isCreating }] = useCreateHeadTagMutation();
  const [updateFont, { isLoading: isUpdating }] = useUpdateHeadTagsMutation();

  const isLoading = isCreating || isUpdating;

  const handleSelectionChange = (value: boolean, item: string) => {
    if (value) {
      setSelectedVariants((prev) => [...prev, item]);
    } else {
      setSelectedVariants((prev) => prev.filter((variant) => variant !== item));
    }
  };

  const handleFontInstall = useCallback(async () => {
    try {
      const cssLinkUrl = "https://fonts.googleapis.com/css?family=";

      const currentVariants = !installedVariants
        ? selectedVariants
        : [...installedVariants, ...selectedVariants];

      const currentlyInstalledVariants = [
        ...new Set(
          currentVariants?.map((variant) =>
            variants?.includes("regular") && variant?.toLowerCase() === "400"
              ? "regular"
              : variant
          )
        ),
      ];
      const newFontName = family?.trim()?.replace(/\s/g, "+");
      const linkHref = `${cssLinkUrl}${newFontName}:${currentlyInstalledVariants?.join(
        ","
      )}`;

      let response: any = null;
      if (!ZUID) {
        response = await createHeadTag({
          type: "link",
          resourceZUID: instance.ZUID,
          sort: 0,
          attributes: {
            rel: "stylesheet",
            href: linkHref,
          },
        });
      } else {
        response = await updateFont({
          ZUID,
          href: linkHref,
        });
      }

      if (!response?.error) {
        setSelectedVariants([]);
        setActiveVariants(currentlyInstalledVariants);
        dispatch(
          notify({
            kind: "success",
            message: `Font "${family} (${selectedVariants.join(
              ", "
            )})" has been installed`,
          })
        );
      } else {
        throw new Error(`${response?.error?.data?.error}`);
      }
    } catch (error) {
      dispatch(
        notify({
          kind: "error",
          message: `Failed to add ${family} (${selectedVariants.join(
            ", "
          )}): ${error}`,
        })
      );
    } finally {
      dispatch(fetchFontsInstalled());
    }
  }, [ZUID, selectedVariants, installedVariants]);

  useEffect(() => {
    setSelectedVariants([]);
  }, [activePage]);

  return (
    <>
      <Box
        data-cy="FontFamilyCard"
        sx={{
          borderBottom: "1px solid",
          borderColor: "grey.200",
          pb: 2,
          pt: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            columnGap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexDirection: "column",
              width: "100%",
              rowGap: 1.25,
            }}
          >
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {family}
            </Typography>
            <Box
              sx={{
                lineHeight: 2,
                textTransform: "capitalize",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              <FormGroup row data-cy="FontFamilyVariantLists">
                {variants?.map((item: string, index: number) => (
                  <FormControlLabel
                    key={`${family}-${item}-${ZUID || index}`}
                    id={`${family}-${item}-${ZUID || index}`}
                    color="text.primary"
                    control={
                      <Checkbox
                        key={`${family}-${item}-${ZUID || index}`}
                        color="primary"
                        size="small"
                        id={`${family}-${item}-${ZUID || index}`}
                        checked={
                          (selectedVariants?.includes(item) ||
                            activeVariants?.includes(item)) ??
                          false
                        }
                        disabled={activeVariants?.includes(item)}
                        readOnly={activeVariants?.includes(item)}
                        onChange={(_e, val) => handleSelectionChange(val, item)}
                        sx={{ p: 0 }}
                      />
                    }
                    label={item}
                    labelPlacement="end"
                    slotProps={{
                      typography: {
                        variant: "body2",
                        fontWeight: 400,
                        color: "text.secondary",

                        pr: 0.25,
                        pl: 0,
                        width: "60px",
                      },
                    }}
                    sx={{
                      m: 0,
                    }}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>

          <LoadingButton
            data-cy="InstallFontButton"
            variant="contained"
            color="primary"
            onClick={handleFontInstall}
            disabled={!isLoading && !selectedVariants?.length}
            startIcon={<AddIcon />}
            loading={isLoading}
            loadingPosition="center"
            sx={{
              minWidth: "fit-content",
            }}
          >
            {t("common.add")}
          </LoadingButton>
        </Box>
        <Typography
          variant="h4"
          fontWeight={400}
          color="text.primary"
          sx={{ fontFamily: `"${family}"`, mt: 1 }}
        >
          {previewText
            ? previewText
            : "All their equipment and instruments are alive."}
        </Typography>
      </Box>
    </>
  );
};

export default FontFamilyCard;
