import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  Stack,
  Box,
  Typography,
  ThemeProvider,
  Divider,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { Brain, theme } from "@zesty-io/material";
import { useParams, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { keyframes } from "@mui/system";
import { EditRounded } from "@mui/icons-material";
import { cloneDeep } from "lodash";

import { ContentInsights } from "./ContentInsights";
import {
  useGetContentModelQuery,
  useGetContentModelFieldsQuery,
} from "../../../../../../../shell/services/instance";
import { AppState } from "../../../../../../../shell/store/types";
import { Error } from "../../../components/Editor/Field/FieldShell";
import { fetchGlobalItem } from "../../../../../../../shell/store/content";
import { AIGeneratorParameterProvider } from "./AIGeneratorParameterProvider";
import {
  ContentModelField,
  Web,
} from "../../../../../../../shell/services/types";
import { SocialMediaPreview } from "./SocialMediaPreview";
import { validateMetaDescription } from "./settings/util";

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
import { OGTitle } from "./settings/OGTitle";
import { OGDescription } from "./settings/OGDescription";
import { TCTitle } from "./settings/TCTitle";
import { TCDescription } from "./settings/TCDescription";
import { FieldError } from "../../../components/Editor/FieldError";

const rotateAnimation = keyframes`
	0% {
		background-position: 0% 0%;
	}
	100% {
		background-position: 0% 100%;
	}
`;
const FlowType = {
  AIGenerated: "ai-generated",
  Manual: "manual",
} as const;
const flowButtons = [
  {
    flowType: FlowType.AIGenerated,
    icon: <Brain sx={{ fontSize: 32 }} />,
    primaryText: "Yes, improve with AI Meta Data Assistant",
    secondaryText:
      "Our AI will scan your content and generate your meta data for you",
  },
  {
    flowType: FlowType.Manual,
    icon: <EditRounded sx={{ fontSize: 32 }} />,
    primaryText: "No, I will improve and edit it myself",
    secondaryText:
      "Perfect if you already know what you want your Meta Data to be",
  },
];
export const MaxLengths: Record<string, number> = {
  metaLinkText: 150,
  metaTitle: 150,
  metaDescription: 160,
  metaKeywords: 255,
  og_title: 150,
  og_description: 160,
  tc_title: 150,
  tc_description: 160,
};
const REQUIRED_FIELDS = [
  "metaTitle",
  "metaDescription",
  "parentZUID",
  "pathPart",
];
export const DYNAMIC_META_FIELD_NAMES = [
  "og_title",
  "og_description",
  "tc_title",
  "tc_description",
];

type Errors = Record<string, Error>;
type MetaProps = {
  isSaving: boolean;
  onUpdateSEOErrors: (errors: Errors) => void;
  errors: Errors;
  errorComponent?: React.ReactNode;
};
export const Meta = forwardRef(
  ({ isSaving, onUpdateSEOErrors, errors, errorComponent }: MetaProps, ref) => {
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
    const { data: fields } = useGetContentModelFieldsQuery(modelZUID);
    const { meta, data, web } = useSelector(
      (state: AppState) =>
        state.content[isCreateItemPage ? `new:${modelZUID}` : itemZUID]
    );
    const [flowType, setFlowType] =
      useState<typeof FlowType[keyof typeof FlowType]>(null);
    const metaDescriptionButtonRef = useRef(null);
    const metaTitleButtonRef = useRef(null);

    // @ts-expect-error untyped
    const siteName = useMemo(() => dispatch(fetchGlobalItem())?.site_name, []);

    const metaFields = useMemo(() => {
      if (fields.length) {
        return fields.reduce(
          (
            accu: Record<string, ContentModelField>,
            curr: ContentModelField
          ) => {
            if (
              !curr.deletedAt &&
              DYNAMIC_META_FIELD_NAMES.includes(curr.name.toLowerCase())
            ) {
              accu[curr.name] = curr;
            }

            return accu;
          },
          {}
        );
      }

      return {};
    }, [fields]);

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

        if (DYNAMIC_META_FIELD_NAMES.includes(name) && name in metaFields) {
          const isRequired = metaFields[name].required;

          currentErrors[name] = {
            ...currentErrors[name],
            MISSING_REQUIRED: isRequired ? !value : false,
          };
        }

        if (name === "metaDescription") {
          const metaDescriptionError = validateMetaDescription(value);

          currentErrors.metaDescription = {
            ...currentErrors.metaDescription,
            CUSTOM_ERROR: !!metaDescriptionError ? metaDescriptionError : "",
          };
        }

        onUpdateSEOErrors(currentErrors);

        dispatch({
          // The og_image is stored as an ordinary field item and not a SEO field item
          type: [...DYNAMIC_META_FIELD_NAMES, "og_image"].includes(name)
            ? "SET_ITEM_DATA"
            : "SET_ITEM_WEB",
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
              const value = DYNAMIC_META_FIELD_NAMES.includes(fieldName)
                ? data[fieldName]
                : // @ts-expect-error
                  web[fieldName];

              currentErrors[fieldName] = {
                ...currentErrors?.[fieldName],
                EXCEEDING_MAXLENGTH:
                  value?.length > MaxLengths[fieldName]
                    ? value?.length - MaxLengths[fieldName]
                    : 0,
              };
            });

            Object.entries(metaFields).forEach(([name, settings]) => {
              const isRequired = settings.required;
              const value = data[name] as string;

              currentErrors[name] = {
                ...currentErrors?.[name],
                MISSING_REQUIRED: isRequired ? !value : false,
              };
            });

            // Validate meta description value
            const metaDescriptionError = validateMetaDescription(
              web.metaDescription
            );

            currentErrors.metaDescription = {
              ...currentErrors.metaDescription,
              CUSTOM_ERROR: !!metaDescriptionError ? metaDescriptionError : "",
            };

            // No need to validate pathPart for datasets
            if (model?.type === "dataset" || web?.pathPart === "zesty_home") {
              delete currentErrors.pathPart;
              delete currentErrors.parentZUID;
            }

            setTimeout(() => {
              // Makes sure that the user sees the error blurbs on each
              // field when in the create item page
              if (isCreateItemPage) {
                setFlowType(FlowType.Manual);
              }
              onUpdateSEOErrors(currentErrors);
            });

            return Object.values(currentErrors)
              ?.map((error) => {
                return Object.values(error) ?? [];
              })
              ?.flat()
              .some((error) => !!error);
          },
          triggerAIGeneratedFlow() {
            setFlowType(FlowType.AIGenerated);
          },
        };
      },
      [errors, web, model, metaFields, data]
    );

    useEffect(() => {
      if (isSaving) {
        onUpdateSEOErrors({});
        return;
      }
    }, [isSaving]);

    useEffect(() => {
      if (!isCreateItemPage) return;

      if (flowType === FlowType.AIGenerated) {
        metaTitleButtonRef.current?.triggerAIButton?.();
      }
    }, [flowType, isCreateItemPage]);

    if (isCreateItemPage && flowType === null) {
      return (
        <ThemeProvider theme={theme}>
          <Box
            sx={{
              mt: 2.5,
              mb: 5,
              borderRadius: 2,
              p: 0.25,
              background:
                "linear-gradient(0deg, rgba(255,93,10,1) 0%, rgba(18,183,106,1) 25%, rgba(11,165,236,1) 50%, rgba(238,70,188,1) 75%, rgba(105,56,239,1) 100%)",
              animation: `${rotateAnimation} 1.5s linear alternate infinite`,
              backgroundSize: "300% 300%",
            }}
          >
            <Stack gap={3} p={3} bgcolor="background.paper" borderRadius={1.5}>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={600}
                  mb={1}
                  color="text.primary"
                >
                  Would you like to improve your Meta Title & Description?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our AI Assistant will scan your content and improve your meta
                  title and description to help improve search engine
                  visibility.{" "}
                </Typography>
              </Box>
              {flowButtons.map((data) => (
                <ListItemButton
                  data-cy={
                    data.flowType === FlowType.AIGenerated
                      ? "AIAssistedMetaFlow"
                      : "ManualMetaFlow"
                  }
                  key={data.flowType}
                  onClick={() => setFlowType(data.flowType)}
                  sx={{
                    borderRadius: 2,
                    border: 1,
                    borderColor: "border",
                    backgroundColor: "common.white",
                    py: 2,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>{data.icon}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {data.primaryText}
                      </Typography>
                    }
                    disableTypography
                    sx={{ my: 0 }}
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5 }}
                        color="text.primary"
                      >
                        {data.secondaryText}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </Stack>
          </Box>
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider theme={theme}>
        <Box
          display="grid"
          gridTemplateColumns="1fr minmax(auto, 40%)"
          gap={4}
          bgcolor="grey.50"
          pt={2.5}
          mb={isCreateItemPage ? 4 : 0}
          px={isCreateItemPage ? 0 : 4}
          color="text.primary"
          sx={{
            scrollbarWidth: "none",
            overflowY: "auto",
          }}
        >
          <Stack flex={1} gap={4} minWidth={640}>
            <Stack gap={3}>
              {!!errorComponent && errorComponent}
              <Box>
                <Typography variant="h5" fontWeight={700} mb={0.5}>
                  SEO & Open Graph Settings
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Specify this page's title and description. You can see how
                  they'll look in search engine results pages (SERPs) and social
                  media content in the preview on the right.
                </Typography>
              </Box>
              <AIGeneratorParameterProvider>
                <MetaTitle
                  aiButtonRef={metaTitleButtonRef}
                  value={web.metaTitle}
                  onChange={handleOnChange}
                  error={errors?.metaTitle}
                  saveMetaTitleParameters={flowType === FlowType.AIGenerated}
                  onResetFlowType={() => {
                    if (flowType === FlowType.AIGenerated) {
                      setFlowType(FlowType.Manual);
                    }
                  }}
                  onAIMetaTitleInserted={() => {
                    // Scroll to and open the meta description ai generator to continue
                    // with the AI-assisted flow
                    if (flowType === FlowType.AIGenerated) {
                      metaDescriptionButtonRef.current?.triggerAIButton?.();
                    }
                  }}
                />
                <MetaDescription
                  aiButtonRef={metaDescriptionButtonRef}
                  value={web.metaDescription}
                  onChange={handleOnChange}
                  error={errors?.metaDescription}
                  onResetFlowType={() => {
                    if (flowType === FlowType.AIGenerated) {
                      setFlowType(FlowType.Manual);
                    }
                  }}
                />
              </AIGeneratorParameterProvider>
              <MetaImage onChange={handleOnChange} />
              {"og_title" in metaFields && (
                <OGTitle
                  value={data.og_title as string}
                  onChange={handleOnChange}
                  error={errors?.og_title}
                  field={metaFields.og_title}
                />
              )}
              {"og_description" in metaFields && (
                <OGDescription
                  value={data.og_description as string}
                  onChange={handleOnChange}
                  error={errors?.og_description}
                  field={metaFields.og_description}
                />
              )}
              {"tc_title" in metaFields && (
                <TCTitle
                  value={data.tc_title as string}
                  onChange={handleOnChange}
                  error={errors?.tc_title}
                  field={metaFields.tc_title}
                />
              )}
              {"tc_description" in metaFields && (
                <TCDescription
                  value={data.tc_description as string}
                  onChange={handleOnChange}
                  error={errors?.tc_description}
                  field={metaFields.tc_description}
                />
              )}
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
                    onUpdateSEOErrors({
                      ...errors,
                      [name]: {
                        ...errors?.[name],
                        ...error,
                      },
                    });
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
          {!isCreateItemPage && (
            <Box
              position="sticky"
              top={0}
              pb={2.5}
              sx={{
                scrollbarWidth: "none",
                overflowY: "auto",
              }}
            >
              <Box maxWidth={620}>
                {model?.type !== "dataset" && (
                  <>
                    <SocialMediaPreview />
                    <Divider sx={{ my: 1.5 }} />
                  </>
                )}
                <ContentInsights />
              </Box>
            </Box>
          )}
        </Box>
      </ThemeProvider>
    );
  }
);
