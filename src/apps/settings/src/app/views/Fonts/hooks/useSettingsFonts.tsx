import { useCallback, useMemo } from "react";
import { Portal } from "@mui/material";
import {
  useDeleteHeadTagMutation,
  useGetHeadTagsQuery,
  useGetWebFontsQuery,
  useUpdateHeadTagsMutation,
} from "../../../../../../../shell/services/instance";
import { notify } from "../../../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";

export type InstalledWebFont = {
  ZUID: string | null;
  href: string;
};
export type FontAndVariants = {
  family: string;
  variants: string[];
};

const getFontDataFromHref = (url: string): FontAndVariants => {
  if (!url)
    return {
      family: "",
      variants: [],
    };
  const fontUrlData = new URL(url);
  const fontFamilyAndVariants = fontUrlData?.searchParams?.get("family");

  const [family, variantsString = ""] = fontFamilyAndVariants?.split(":") || [];
  const variants = variantsString?.split(",") || [];

  return {
    family,
    variants,
  };
};

export const useSettingsFonts = () => {
  const dispatch = useDispatch();

  const {
    data: headTags,
    isLoading: isLoadingHeadTags,
    isFetching: isFetchingHeadTags,
  } = useGetHeadTagsQuery();
  const { data: webFonts, isLoading: isLoadingWebFonts } =
    useGetWebFontsQuery();

  const [deleteFont, { isLoading: isDeleting }] = useDeleteHeadTagMutation();
  const [updateFont, { isLoading: isUpdating }] = useUpdateHeadTagsMutation();

  const { installedFonts } = useMemo(() => {
    const fontMap = new Map<string, { ZUID: string; variants: Set<string> }>();
    const deleteZUIDs: string[] = [];

    const fontHeadTags = headTags?.filter(
      (item) =>
        item?.type === "link" &&
        item?.attributes?.href?.includes("fonts.googleapis.com/")
    );

    fontHeadTags?.forEach((item) => {
      try {
        const validHref = item?.attributes?.href?.replace(
          "https//",
          "https://"
        );
        const url = new URL(validHref);
        const [family, variantsString = ""] =
          url.searchParams.get("family")?.split(":") || [];
        const variants = variantsString.split(",").filter(Boolean);

        if (!family) return;

        if (fontMap.has(family)) {
          const existing = fontMap.get(family)!;
          variants.forEach((v) => existing.variants.add(v));
          deleteZUIDs.push(item.ZUID);
        } else {
          fontMap.set(family, {
            ZUID: item.ZUID,
            variants: new Set(variants),
          });
        }
      } catch (error) {
        // Invalid URL - skip
      }
    });

    // Delete duplicate font family grouping
    if (!!deleteZUIDs?.length) {
      deleteZUIDs?.forEach((fontZUID) => deleteFont(fontZUID));
    }

    const installed = Array.from(fontMap.entries()).map(
      ([family, { ZUID, variants }]) => ({
        ZUID,
        href: `https://fonts.googleapis.com/css?family=${family.replace(
          /\s/g,
          "+"
        )}:${Array.from(variants).join(",")}`,
      })
    );
    return { installedFonts: installed };
  }, [headTags]);

  const handleFontDelete = useCallback(
    async (ZUID, variant) => {
      const thisFont = installedFonts?.find((font) => font?.ZUID === ZUID);
      const { family, variants } = getFontDataFromHref(thisFont?.href);
      const fontLabel = `${family} (${variant})`;
      const remainingVariants = variants?.filter(
        (itemVariant) => itemVariant !== variant
      );

      try {
        let response: any = null;
        if (!remainingVariants?.length) {
          response = await deleteFont(ZUID);
        } else {
          const updatedHref = `https://fonts.googleapis.com/css?family=${family.replace(
            /\s/g,
            "+"
          )}:${remainingVariants.join(",")}`;

          response = await updateFont({
            ZUID,
            href: updatedHref,
          });
        }

        if (!response?.error) {
          dispatch(
            notify({
              kind: "success",
              message: `Font "${fontLabel}" has been uninstalled`,
            })
          );
        } else {
          throw new Error(`${response?.error?.data?.error}`);
        }
      } catch (error) {
        dispatch(
          notify({
            kind: "error",
            message: `Failed to uninstall ${fontLabel}: ${error}`,
          })
        );
      }
    },
    [installedFonts]
  );

  return {
    installedFonts,
    webFonts,
    isLoading: isLoadingHeadTags || isLoadingWebFonts,
    deleteFont: handleFontDelete,
    isDeleting: isDeleting || isUpdating || isFetchingHeadTags,
    getFontDataFromHref,
    renderLinkTags: () => (
      <Portal container={document.head}>
        {installedFonts?.map((item) => (
          <link rel="stylesheet" href={item?.href} key={item.ZUID} />
        ))}
      </Portal>
    ),
  };
};
