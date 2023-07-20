import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  Tooltip,
} from "@mui/material";
import { useHistory, useLocation, useParams } from "react-router";
import {
  useGetContentModelsQuery,
  useGetContentModelFieldsQuery,
  useGetWebViewsQuery,
} from "../../../../../shell/services/instance";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import moment from "moment";
import SplitscreenRoundedIcon from "@mui/icons-material/SplitscreenRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import VerticalSplitRoundedIcon from "@mui/icons-material/VerticalSplitRounded";
import { RenameModelDialogue } from "./RenameModelDialogue";
import { modelIconMap, modelNameMap } from "../utils";
import { DuplicateModelDialogue } from "./DuplicateModelDialogue";
import { DeleteModelDialogue } from "./DeleteModelDialogue";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

moment.updateLocale("en", {
  relativeTime: {
    past: (string) => {
      return string === "right now" ? string : string + " ago";
    },
    s: "right now",
    ss: "right now",
  },
});

type Params = {
  id: string;
};

interface Props {
  onNewFieldModalClick: (sortIndex: number | null) => void;
}
export const ModelHeader = ({ onNewFieldModalClick }: Props) => {
  const params = useParams<Params>();
  const { id } = params;
  const { data: models } = useGetContentModelsQuery();
  const { data: views } = useGetWebViewsQuery();
  const [isCopied, setIsCopied] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { isSuccess: isFieldsLoaded } = useGetContentModelFieldsQuery(id);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const model = models?.find((model) => model.ZUID === id);
  const view = views?.find((view) => view?.contentModelZUID === model?.ZUID);
  const canCreateModel = model?.name.toLowerCase() !== "clippings";

  const [showDialogue, setShowDialogue] = useState<
    "rename" | "duplicate" | "delete" | null
  >(null);

  const handleCopyZUID = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <>
      <Box
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.border}` }}
      >
        <Box sx={{ px: 3, pt: 2 }}>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={0.5}>
              <SvgIcon
                fontSize="small"
                color="action"
                component={
                  modelIconMap[model?.type as keyof typeof modelIconMap]
                }
              />
              <Typography variant="h4" fontWeight={600}>
                {model?.label}
              </Typography>
              <IconButton
                size="small"
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{ height: "fit-content" }}
                data-cy="model-header-menu"
              >
                <MoreHorizRoundedIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    setShowDialogue("rename");
                    setAnchorEl(null);
                  }}
                >
                  <ListItemIcon>
                    <DriveFileRenameOutlineRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Rename Model</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setShowDialogue("duplicate");
                    setAnchorEl(null);
                  }}
                >
                  <ListItemIcon>
                    <ContentCopyRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Duplicate Model</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleCopyZUID(model.ZUID)}>
                  <ListItemIcon>
                    {isCopied ? (
                      <CheckRoundedIcon fontSize="small" />
                    ) : (
                      <WidgetsRoundedIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText>Copy ZUID</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setShowDialogue("delete");
                    setAnchorEl(null);
                  }}
                >
                  <ListItemIcon>
                    <DeleteRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete Model</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
            <Box display="flex" gap={2}>
              {view && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<CodeRoundedIcon color="action" />}
                  onClick={() => history.push(`/code/file/views/${view?.ZUID}`)}
                >
                  Edit in Code
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
                onClick={() => history.push(`/content/${model?.ZUID}`)}
              >
                View Content
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => onNewFieldModalClick(null)}
                disabled={!isFieldsLoaded}
                data-cy="AddFieldBtn"
              >
                Add Field
              </Button>
            </Box>
          </Box>
          <Box mt={1.5}>
            <Typography
              variant="caption"
              color="textSecondary"
              whiteSpace="pre"
            >{`${modelNameMap[model?.type]} Model  •  ZUID: ${
              model?.ZUID
            }  •  `}</Typography>
            <Tooltip
              title={moment(model?.updatedAt).format(
                "Do MMMM YYYY [at] h:mm A"
              )}
              children={
                <Typography variant="caption" color="textSecondary">
                  Updated {moment(model?.updatedAt).fromNow()}
                </Typography>
              }
            ></Tooltip>
          </Box>
          {/* TODO: Update tab theme to match design */}
          <Tabs
            sx={{
              position: "relative",
              top: "1px",
              ".Mui-selected": {
                svg: {
                  color: "primary.main",
                },
              },
            }}
            value={location.pathname.split("/")[3]}
            onChange={(event, value) =>
              history.push(`/schema/${model?.ZUID}/${value}`)
            }
          >
            <Tab
              icon={<SplitscreenRoundedIcon color="action" fontSize="small" />}
              iconPosition="start"
              label="Fields"
              value="fields"
            />
            <Tab
              icon={<ApiRoundedIcon color="action" fontSize="small" />}
              iconPosition="start"
              label="API"
              value="api"
            />
            <Tab
              icon={<HistoryRoundedIcon color="action" fontSize="small" />}
              iconPosition="start"
              label="Activity Log"
              value="activity-log"
            />
            <Tab
              icon={<InfoRoundedIcon color="action" fontSize="small" />}
              iconPosition="start"
              label="Info"
              value="info"
            />
          </Tabs>
        </Box>
      </Box>
      {showDialogue === "rename" && (
        <RenameModelDialogue
          model={model}
          onClose={() => setShowDialogue(null)}
        />
      )}
      {showDialogue === "duplicate" && (
        <DuplicateModelDialogue
          model={model}
          onClose={() => setShowDialogue(null)}
        />
      )}
      {showDialogue === "delete" && (
        <DeleteModelDialogue
          model={model}
          onClose={() => setShowDialogue(null)}
        />
      )}
    </>
  );
};
