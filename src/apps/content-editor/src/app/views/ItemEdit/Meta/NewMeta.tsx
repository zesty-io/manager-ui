import { useState, useCallback, useMemo, useEffect } from "react";
import { Stack, Box, Typography, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";

import { ContentInsights } from "./ItemSettings/ContentInsights";
import { useGetContentModelQuery } from "../../../../../../../shell/services/instance";
import { CanonicalTag } from "./settings/CanonicalTag";
import { ItemParent } from "./settings/ItemParent";
// import { ItemRoute } from "./settings/ItemRoute";
import { ItemRoute } from "./settings/ItemRouteV2";
import MetaDescription from "./settings/MetaDescription";
import { MetaKeywords } from "./settings/MetaKeywords";
import { MetaLinkText } from "./settings/MetaLinkText";
import { MetaTitle } from "./settings/MetaTitle";
import { SitemapPriority } from "./settings/SitemapPriority";
import { AppState } from "../../../../../../../shell/store/types";
import { Error } from "../../../components/Editor/Field/FieldShell";
import { fetchGlobalItem } from "../../../../../../../shell/store/content";

export const MaxLengths: Record<string, number> = {
  metaLinkText: 150,
  metaTitle: 150,
  metaDescription: 160,
  metaKeywords: 255,
};

type Errors = Record<string, Error>;
type MetaProps = {
  isSaving: boolean;
};
export const Meta = ({ isSaving }: MetaProps) => {
  const dispatch = useDispatch();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: model } = useGetContentModelQuery(modelZUID, {
    skip: !modelZUID,
  });
  const { meta, data, web } = useSelector(
    (state: AppState) => state.content[itemZUID]
  );
  const [errors, setErrors] = useState<Errors>({});

  // @ts-expect-error untyped
  const siteName = useMemo(() => dispatch(fetchGlobalItem())?.site_name, []);

  const handleOnChange = useCallback(
    (value, name) => {
      if (!name) {
        throw new Error("Input is missing name attribute");
      }

      if (MaxLengths[name]) {
        setErrors({
          ...errors,
          [name]: {
            EXCEEDING_MAXLENGTH:
              value?.length > MaxLengths[name]
                ? value?.length - MaxLengths[name]
                : 0,
          },
        });
      }

      if (name === "pathPart") {
        setErrors({
          ...errors,
          [name]: {
            MISSING_REQUIRED: !value,
          },
        });
      }

      dispatch({
        type: "SET_ITEM_WEB",
        itemZUID: meta?.ZUID,
        key: name,
        value: value,
      });
    },
    [meta?.ZUID, errors]
  );

  useEffect(() => {
    if (isSaving) {
      setErrors({});
      return;
    }
  }, [isSaving]);

  return (
    <ThemeProvider theme={theme}>
      <Stack
        direction="row"
        gap={4}
        bgcolor="grey.50"
        pt={2.5}
        px={4}
        color="text.primary"
        sx={{
          scrollbarWidth: "none",
          overflowY: "auto",
        }}
      >
        <Stack flex={1} gap={4}>
          <Stack gap={3}>
            <Box>
              <Typography variant="h5" fontWeight={700} mb={0.5}>
                SEO & Open Graph Settings
              </Typography>
              <Typography color="text.secondary">
                Specify this page's title and description. You can see how
                they'll look in search engine results pages (SERPs) and social
                media content in the preview on the right.
              </Typography>
            </Box>
            <MetaTitle
              // @ts-expect-error untyped
              value={web.metaTitle}
              onChange={handleOnChange}
              errors={errors}
            />
            <MetaDescription
              // @ts-expect-error untyped
              value={web.metaDescription}
              onChange={handleOnChange}
              errors={errors}
            />
          </Stack>
          {model?.type !== "dataset" && web?.pathPart !== "zesty_home" && (
            <Stack gap={3}>
              <Box>
                <Typography variant="h5" fontWeight={700} mb={0.5}>
                  URL Settings
                </Typography>
                <Typography color="text.secondary">
                  Define the URL of your web page
                </Typography>
              </Box>
              <ItemParent onChange={handleOnChange} />
              <ItemRoute
                // @ts-expect-error untyped
                ZUID={meta?.ZUID}
                meta={meta}
                parentZUID={web?.parentZUID}
                path_part={web?.pathPart}
                path_to={web?.path}
                onChange={handleOnChange}
              />
            </Stack>
          )}
          <Stack gap={3} pb={2.5}>
            <Box>
              <Typography variant="h5" fontWeight={700} mb={0.5}>
                Advanced Settings
              </Typography>
              <Typography color="text.secondary">
                Optimize your content item's SEO further
              </Typography>
            </Box>
            {model?.type !== "dataset" && (
              <>
                <SitemapPriority
                  // @ts-expect-error untyped
                  sitemapPriority={web.sitemapPriority}
                  onChange={handleOnChange}
                />
                {!!web && (
                  <CanonicalTag
                    // @ts-expect-error untyped
                    mode={web.canonicalTagMode}
                    whitelist={web.canonicalQueryParamWhitelist}
                    custom={web.canonicalTagCustomValue}
                    onChange={handleOnChange}
                  />
                )}
              </>
            )}
            <MetaLinkText
              // @ts-expect-error untyped
              value={web.metaLinkText}
              onChange={handleOnChange}
              errors={errors}
            />
            <MetaKeywords
              // @ts-expect-error untyped
              value={web.metaKeywords}
              onChange={handleOnChange}
              errors={errors}
            />
          </Stack>
        </Stack>
        {model?.type !== "dataset" && (
          <Box flex={1} position="sticky" top={0}>
            <ContentInsights />
          </Box>
        )}
      </Stack>
    </ThemeProvider>
  );
};
