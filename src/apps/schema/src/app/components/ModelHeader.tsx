import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  SvgIcon,
  Tooltip,
  Stack,
} from "@mui/material";
import { useHistory, useLocation, useParams } from "react-router";
import {
  useGetContentModelsQuery,
  useGetContentModelFieldsQuery,
  useGetWebViewsQuery,
} from "../../../../../shell/services/instance";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { formatLocalized } from "shell/i18n/dates";
import { isValid } from "date-fns";
import {
  InfoRounded,
  ApiRounded,
  SplitscreenRounded,
  HistoryRounded,
} from "@mui/icons-material";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import VerticalSplitRoundedIcon from "@mui/icons-material/VerticalSplitRounded";
import { modelIconMap, modelNameMap } from "../utils";
import { ModelMenu } from "./ModelMenu";
import { ModelBreadcrumbs } from "./ModelBreadcrumbs";

const getTabs = (t: (key: string) => string) => [
  {
    name: t("schema.tabFields"),
    value: "fields",
    icon: SplitscreenRounded,
  },
  {
    name: t("common.apis"),
    value: "api",
    icon: ApiRounded,
  },
  {
    name: t("schema.tabActivityLog"),
    value: "activity-log",
    icon: HistoryRounded,
  },
  {
    name: t("schema.tabInfo"),
    value: "info",
    icon: InfoRounded,
  },
];

type Params = {
  id: string;
};

interface Props {
  onNewFieldModalClick: (sortIndex: number | null) => void;
}
export const ModelHeader = ({ onNewFieldModalClick }: Props) => {
  const { t } = useTranslation();
  const TABS = getTabs(t);
  const params = useParams<Params>();
  const { id } = params;
  const { data: models } = useGetContentModelsQuery();
  const { data: views } = useGetWebViewsQuery();
  const location = useLocation();
  const history = useHistory();
  const { isSuccess: isFieldsLoaded } = useGetContentModelFieldsQuery({
    modelZUID: id,
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const model = models?.find((model) => model.ZUID === id);
  const view = views?.find((view) => view?.contentModelZUID === model?.ZUID);
  const canCreateModel = model?.name.toLowerCase() !== "clippings";

  const updatedAt = model?.updatedAt ? new Date(model.updatedAt) : null;
  const lastUpdated =
    updatedAt && isValid(updatedAt)
      ? formatLocalized(updatedAt, "do MMMM yyyy 'at' h:mm a")
      : "";

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.paper",
          borderBottom: (theme) => `2px solid ${theme.palette.border}`,
        }}
      >
        <Stack
          px={4}
          pt={4}
          pb={1}
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack gap={0.25} justifyContent="space-between">
            <ModelBreadcrumbs modelZUID={model?.ZUID} />
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="h3" fontWeight={700}>
                {model?.label}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" gap={0.25}>
              <SvgIcon
                component={
                  modelIconMap[model?.type as keyof typeof modelIconMap]
                }
                sx={{
                  color: "text.secondary",
                  fontSize: "18px",
                }}
              />
              <Typography
                variant="body3"
                color="text.secondary"
                whiteSpace="pre"
              >{`${t("schema.modelTypeLabel", {
                modelType: t(modelNameMap[model?.type]),
              })}  •  `}</Typography>
              <Typography variant="body3" color="text.secondary">
                {t("schema.lastUpdated", { date: lastUpdated })}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" gap={1} alignItems="center">
            <IconButton
              size="small"
              onClick={(event) => setAnchorEl(event.currentTarget)}
              sx={{ height: "fit-content" }}
              data-cy="model-header-menu"
            >
              <MoreHorizRoundedIcon fontSize="small" />
            </IconButton>
            <ModelMenu
              anchorEl={anchorEl}
              modelZUID={id}
              onClose={() => setAnchorEl(null)}
            />
            {view && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<CodeRoundedIcon color="action" />}
                onClick={() => history.push(`/code/file/views/${view?.ZUID}`)}
              >
                {t("schema.editInCode")}
              </Button>
            )}
            {/* {canCreateModel && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<PostAddRoundedIcon color="action" />}
                  onClick={() => history.push(`/content/${model?.ZUID}/new`)}
                >
                  <Box
                    sx={{
                      maxWidth: "220px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Create {model?.label}
                  </Box>
                </Button>
              )} */}
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<VerticalSplitRoundedIcon color="action" />}
              onClick={() => {
                if (model?.type === "block") {
                  history.push(`/blocks/${model?.ZUID}`);
                } else {
                  history.push(`/content/${model?.ZUID}`);
                }
              }}
            >
              {model?.type === "block"
                ? t("schema.viewVariants")
                : t("schema.viewContent")}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => onNewFieldModalClick(null)}
              disabled={!isFieldsLoaded}
              data-cy="AddFieldBtn"
            >
              {t("schema.addField")}
            </Button>
          </Stack>
        </Stack>
        <Tabs
          sx={{
            position: "relative",
            top: "2px",
            px: 4,
          }}
          value={location.pathname.split("/")[3] || TABS[0].value}
          onChange={(event, value) =>
            history.push(`/schema/${model?.ZUID}/${value}`)
          }
        >
          {TABS?.map((tab) => (
            <Tab
              key={tab.value}
              icon={<SvgIcon component={tab.icon} fontSize="small" />}
              iconPosition="start"
              label={tab.name}
              value={tab.value}
              disableRipple
            />
          ))}
        </Tabs>
      </Box>
    </>
  );
};
