import { useState, useCallback, useMemo, useEffect } from "react";
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

import { ContentInsights } from "./ContentInsights";
import { useGetContentModelQuery } from "../../../../../../../shell/services/instance";
import { AppState } from "../../../../../../../shell/store/types";
import { Error } from "../../../components/Editor/Field/FieldShell";
import { fetchGlobalItem } from "../../../../../../../shell/store/content";
import { AIGeneratorParameterProvider } from "./AIGeneratorParameterProvider";

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

const rotateAnimation = keyframes`
	0% {
		background-position: 0% 0%;
	}
	100% {
		background-position: 0% 100%;
	}
`;
enum FlowType {
  AIGenerated,
  Manual,
}
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
};
const REQUIRED_FIELDS = [
  "metaTitle",
  "metaDescription",
  "parentZUID",
  "pathPart",
] as const;

type Errors = Record<string, Error>;
type MetaProps = {
  isSaving: boolean;
  onUpdateSEOErrors: (hasErrors: boolean) => void;
};
export const Meta = ({ isSaving, onUpdateSEOErrors }: MetaProps) => {
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
  const [flowType, setFlowType] = useState<FlowType>(null);

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

  useEffect(() => {
    // Automatically scroll into view the meta title field & open the ai generator
    if (flowType === FlowType.AIGenerated) {
      const metaTitleEl = document.querySelector("[data-cy='metaTitle']");

      metaTitleEl?.scrollIntoView({ behavior: "smooth" });

      // Needed so that it only opens the popup once the field has
      // already scrolled to the top, otherwise the popup will
      // stay at the meta title's original location
      setTimeout(() => {
        metaTitleEl
          ?.querySelector<HTMLButtonElement>("[data-cy='AIOpen']")
          ?.click();
      });
    }
  }, [flowType]);

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
                title and description to help improve search engine visibility.{" "}
              </Typography>
            </Box>
            {flowButtons.map((data) => (
              <ListItemButton
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
            <AIGeneratorParameterProvider>
              <MetaTitle
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
                    const metaDescriptionEl = document.querySelector(
                      "[data-cy='metaDescription']"
                    );

                    metaDescriptionEl?.scrollIntoView({ behavior: "smooth" });

                    // Needed so that it only opens the popup once the field has
                    // already scrolled to the top, otherwise the popup will
                    // stay at the meta title's original location
                    setTimeout(() => {
                      metaDescriptionEl
                        ?.querySelector<HTMLButtonElement>("[data-cy='AIOpen']")
                        ?.click();
                    });
                  }
                }}
              />
              <MetaDescription
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
                  setErrors({
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
};
