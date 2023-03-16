import {
  Box,
  Button,
  ListItemButton,
  ListItemIcon,
  SvgIcon,
  ListItemText,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useHistory, useLocation, useParams } from "react-router";
import { SvgIconComponent } from "@mui/icons-material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import IntegrationInstructionsRoundedIcon from "@mui/icons-material/IntegrationInstructionsRounded";
import ViewInArRoundedIcon from "@mui/icons-material/ViewInArRounded";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import { ApiType, apiTypeDocsMap, apiTypeLabelMap, apiTypes } from ".";
import { ApiInfo } from "./ApiInfo";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { ApiDomainEndpoints } from "./ApiDomainEndpoints";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { useGetInstanceSettingsQuery } from "../../../../../../shell/services/instance";
import { HeadlessSwitcher } from "./HeadlessSwitcher";

const apiTypeIconMap: Record<ApiType, SvgIconComponent> = {
  "quick-access": BoltRoundedIcon,
  "backend-coding": LockRoundedIcon,
  graphql: ViewInArRoundedIcon,
  "site-generators": IntegrationInstructionsRoundedIcon,
  "custom-endpoints": DashboardCustomizeRoundedIcon,
  "visual-layout": NewspaperRoundedIcon,
};

const apiTypesWithEndpoints = [
  "quick-access",
  "backend-coding",
  "graphql",
  "site-generators",
];

export const ApiDetails = () => {
  const history = useHistory();
  const location = useLocation();
  const installedApps = useSelector((state: AppState) => state.apps.installed);
  const { id } = useParams<{ id: string }>();
  const selectedType = location.pathname.split("/").pop() as ApiType;
  const { data: instanceSettings, isFetching } = useGetInstanceSettingsQuery(
    null,
    { skip: selectedType !== "site-generators" }
  );
  const headlessEnabled =
    instanceSettings?.find((setting) => setting.key === "mode")?.value !==
    "traditional";

  const handleVisualLayoutClick = () => {
    const layoutApp = installedApps?.find(
      (app: any) => app?.name === "layouts"
    );
    if (layoutApp) {
      history.push(`/app/${layoutApp.ZUID}`);
    } else {
      window.open("https://www.zesty.io/marketplace/apps/page-layout-designer");
    }
  };

  return (
    <Box display="flex" height="100%">
      <Box
        width="220px"
        sx={{
          borderRight: (theme) => `1px solid ${theme.palette.border}`,
        }}
      >
        <Box p={1}>
          <Button
            size="small"
            color="inherit"
            startIcon={<ArrowBackRoundedIcon color="action" />}
            onClick={() =>
              history.push(
                `${location.pathname.split("/").slice(0, -1).join("/")}`
              )
            }
          >
            Back
          </Button>
        </Box>
        <Box px={1}>
          {apiTypes.map((type) => (
            <ListItemButton
              key={type}
              sx={{ py: "6px", px: "12px", borderRadius: "4px" }}
              selected={selectedType === type}
              onClick={() =>
                history.push(
                  `${location.pathname
                    .split("/")
                    .slice(0, -1)
                    .join("/")}/${type}`
                )
              }
            >
              <ListItemIcon
                sx={{
                  minWidth: "unset",
                  mr: 1,
                  color: selectedType === type && "primary.main",
                }}
              >
                <SvgIcon fontSize="small" component={apiTypeIconMap[type]} />
              </ListItemIcon>
              <ListItemText
                sx={{ m: 0 }}
                primary={apiTypeLabelMap[type]}
                primaryTypographyProps={{
                  fontWeight: 500,
                  variant: "caption",
                  color:
                    selectedType === type ? "primary.dark" : "text.secondary",
                  sx: { wordBreak: "break-word" },
                }}
              />
            </ListItemButton>
          ))}
        </Box>
      </Box>
      {isFetching ? (
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box flex={1} px={3} py={2}>
          {selectedType === "site-generators" && !headlessEnabled ? (
            <HeadlessSwitcher
              instanceSetting={instanceSettings?.find(
                (setting) => setting.key === "mode"
              )}
            />
          ) : (
            <Box maxWidth="640px">
              <ApiInfo type={selectedType} large />

              {[...apiTypesWithEndpoints].includes(selectedType) && (
                <Button
                  variant="outlined"
                  startIcon={<MenuBookRoundedIcon />}
                  sx={{
                    my: 3,
                  }}
                  onClick={() => window.open(apiTypeDocsMap[selectedType])}
                >
                  Read Docs
                </Button>
              )}
              {selectedType === "custom-endpoints" && (
                <Stack
                  direction="row"
                  gap={1.5}
                  sx={{
                    my: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<CodeRoundedIcon />}
                    onClick={() => history.push("/code")}
                  >
                    Open Code App
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MenuBookRoundedIcon color="action" />}
                    onClick={() => window.open(apiTypeDocsMap[selectedType])}
                    color="inherit"
                  >
                    Read Docs
                  </Button>
                </Stack>
              )}
              {selectedType === "visual-layout" && (
                <Stack
                  direction="row"
                  gap={1.5}
                  sx={{
                    my: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<NewspaperRoundedIcon />}
                    onClick={handleVisualLayoutClick}
                  >
                    Open Visual Layout
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MenuBookRoundedIcon color="action" />}
                    onClick={() => window.open(apiTypeDocsMap[selectedType])}
                    color="inherit"
                  >
                    Read Docs
                  </Button>
                </Stack>
              )}
              {apiTypesWithEndpoints.includes(selectedType) && (
                <ApiDomainEndpoints type={selectedType} contentModelZUID={id} />
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
