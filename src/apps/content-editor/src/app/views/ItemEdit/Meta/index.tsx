import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Stack, Box, Typography, ThemeProvider, Divider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { useParams, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";

import { ContentInsights } from "./ContentInsights";
import { useGetContentModelQuery } from "../../../../../../../shell/services/instance";
import { AppState } from "../../../../../../../shell/store/types";
import { Error } from "../../../components/Editor/Field/FieldShell";
import { fetchGlobalItem } from "../../../../../../../shell/store/content";
import { Web } from "../../../../../../../shell/services/types";

// Fields
import { MetaImage } from "./settings/MetaImage";
import { CanonicalTag } from "./settings/CanonicalTag";
import { ItemParent } from "./settings/ItemParent";
import { ItemRoute } from "./settings/ItemRoute";
import MetaDescription from "./settings/MetaDescription";
import { MetaKeywords } from "./settings/MetaKeywords";
import { MetaLinkText } from "./settings/MetaLinkText";
import { MetaTitle } from "./settings/MetaTitle";
import { SitemapPriority } from "./settings/SitemapPriority";
import { cloneDeep } from "lodash";
import { SocialMediaPreview } from "./SocialMediaPreview";

export const MaxLengths: Record<string, number> = {
  metaLinkText: 150,
  metaTitle: 150,
  metaDescription: 160,
  metaKeywords: 255,
};
const REQUIRED_FIELDS = [
  "metaTitle",
  "metaDescription",
  "parentZUID",
  "pathPart",
];

type Errors = Record<string, Error>;
type MetaProps = {
  isSaving: boolean;
  onUpdateSEOErrors: (hasErrors: boolean) => void;
};
export const Meta = forwardRef(
  ({ isSaving, onUpdateSEOErrors }: MetaProps, ref) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const isCreateItemPage = location?.pathname?.split("/")?.pop() === "new";
    const { modelZUID, itemZUID } = useParams<{
      modelZUID: string;
      itemZUID: string;
    }>();
    const { data: model } = useGetContentModelQuery(modelZUID, {
      skip: !modelZUID,
    });
    const { meta, data, web } = useSelector(
      (state: AppState) =>
        state.content[isCreateItemPage ? `new:${modelZUID}` : itemZUID]
    );
    const [errors, setErrors] = useState<Errors>({});

    // @ts-expect-error untyped
    const siteName = useMemo(() => dispatch(fetchGlobalItem())?.site_name, []);

    const handleOnChange = useCallback(
      (value, name) => {
        if (!name) {
          throw new Error("Input is missing name attribute");
        }

        const currentErrors = cloneDeep(errors);

        if (REQUIRED_FIELDS.includes(name)) {
          currentErrors[name] = {
            ...currentErrors?.[name],
            MISSING_REQUIRED: !value,
          };
        }

        if (MaxLengths[name]) {
          currentErrors[name] = {
            ...currentErrors?.[name],
            EXCEEDING_MAXLENGTH:
              value?.length > MaxLengths[name]
                ? value?.length - MaxLengths[name]
                : 0,
          };
        }

        setErrors(currentErrors);

        dispatch({
          // The og_image is stored as an ordinary field item and not a SEO field item
          type: name === "og_image" ? "SET_ITEM_DATA" : "SET_ITEM_WEB",
          itemZUID: meta?.ZUID,
          key: name,
          value: value,
        });
      },
      [meta?.ZUID, errors]
    );

    useImperativeHandle(
      ref,
      () => {
        return {
          validateMetaFields() {
            const currentErrors = cloneDeep(errors);

            REQUIRED_FIELDS.forEach((fieldName) => {
              // @ts-expect-error
              const value = web[fieldName];

              currentErrors[fieldName] = {
                ...currentErrors?.[fieldName],
                MISSING_REQUIRED: !value,
              };
            });

            Object.keys(MaxLengths).forEach((fieldName) => {
              // @ts-expect-error
              const value = web[fieldName];

              currentErrors[fieldName] = {
                ...currentErrors?.[fieldName],
                EXCEEDING_MAXLENGTH:
                  value?.length > MaxLengths[fieldName]
                    ? value?.length - MaxLengths[fieldName]
                    : 0,
              };
            });

            // No need to validate pathPart for datasets
            if (model?.type === "dataset") {
              delete currentErrors.pathPart;
            }

            setTimeout(() => {
              setErrors(currentErrors);
            });
          },
        };
      },
      [errors, web, model]
    );

    useEffect(() => {
      if (isSaving) {
        setErrors({});
        return;
      }
    }, [isSaving]);

    useEffect(() => {
      const hasErrors = Object.values(errors)
        ?.map((error) => {
          return Object.values(error) ?? [];
        })
        ?.flat()
        .some((error) => !!error);

      onUpdateSEOErrors(hasErrors);
    }, [errors]);

    return (
      <ThemeProvider theme={theme}>
        <Stack
          direction="row"
          gap={4}
          bgcolor="grey.50"
          pt={2.5}
          px={isCreateItemPage ? 0 : 4}
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
                value={web.metaTitle}
                onChange={handleOnChange}
                error={errors?.metaTitle}
              />
              <MetaDescription
                value={web.metaDescription}
                onChange={handleOnChange}
                error={errors?.metaDescription}
              />
              <MetaImage onChange={handleOnChange} />
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
                  onChange={handleOnChange}
                  error={errors?.pathPart}
                  onUpdateErrors={(name, error) => {
                    setErrors((errors) => ({
                      ...errors,
                      [name]: {
                        ...errors?.[name],
                        ...error,
                      },
                    }));
                  }}
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
                value={web.metaLinkText}
                onChange={handleOnChange}
                error={errors?.metaLinkText}
              />
              <MetaKeywords
                value={web.metaKeywords}
                onChange={handleOnChange}
                error={errors?.metaKeywords}
              />
            </Stack>
          </Stack>
          {model?.type !== "dataset" && !isCreateItemPage && (
            <Box
              flex={1}
              position="sticky"
              top={0}
              pb={2.5}
              sx={{
                scrollbarWidth: "none",
                overflowY: "auto",
              }}
            >
              <SocialMediaPreview />
              <Divider sx={{ my: 1.5 }} />
              <ContentInsights />
            </Box>
          )}
        </Stack>
      </ThemeProvider>
    );
  }
);
