import { Box, Tooltip, Typography, Button } from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import {
  useGetContentModelsQuery,
  useGetContentNavItemsQuery,
} from "../../../../../../shell/services/instance";
import { useHistory, useParams } from "react-router";
import { useState } from "react";
import { RenameModelDialogue } from "../RenameModelDialogue";
import { UpdateDescriptionModelDialogue } from "../UpdateDescriptionModelDialogue";
import { UpdateParentModelDialogue } from "../UpdateParentModelDialogue";
import { DeleteModelDialogue } from "../DeleteModelDialogue";
import { DuplicateModelDialogue } from "../DuplicateModelDialogue";

type Params = {
  id: string;
};

export const ModelDetails = () => {
  const params = useParams<Params>();
  const { id } = params;
  const history = useHistory();
  const { data: models } = useGetContentModelsQuery();
  const { data: navItems } = useGetContentNavItemsQuery();

  const model = models?.find((model) => model.ZUID === id);
  // const parentModel = models?.find((m) => m.ZUID === model?.parentZUID);
  const parentModel = navItems?.find(
    (navItem) => navItem.ZUID === model?.parentZUID
  );
  const [showDialogue, setShowDialogue] = useState<
    | "rename"
    | "updateDescription"
    | "updateParent"
    | "duplicate"
    | "delete"
    | null
  >(null);
  const [isCopied, setIsCopied] = useState("");

  const handleCopy = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(data);
        setTimeout(() => {
          setIsCopied("");
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          Model Details
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          View and update the primary properties of your model
        </Typography>
        <Box
          borderRadius="8px"
          border="1px solid"
          borderColor="border"
          sx={{ backgroundColor: "background.paper" }}
        >
          <Box
            display="flex"
            alignItems="center"
            px={2}
            sx={{
              borderBottom: (theme) => `1px solid ${theme.palette.border}`,
            }}
          >
            <Box
              minWidth={280}
              display="flex"
              gap={1.5}
              alignItems="center"
              py={2}
            >
              <Typography color="text.primary">Name</Typography>
              <Tooltip
                title="Name that is shown to content editors"
                placement="right"
              >
                <InfoRoundedIcon
                  color="action"
                  sx={{ height: "12px", width: "12px" }}
                />
              </Tooltip>
            </Box>
            <Box flex={1} py={2}>
              <Typography>{model?.label}</Typography>
            </Box>
            <Box py={1.5}>
              <Button size="small" onClick={() => setShowDialogue("rename")}>
                Edit
              </Button>
            </Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            px={2}
            sx={{
              borderBottom: (theme) => `1px solid ${theme.palette.border}`,
            }}
          >
            <Box
              minWidth={280}
              display="flex"
              gap={1.5}
              alignItems="center"
              py={2}
            >
              <Typography color="text.primary">Description</Typography>
              <Tooltip
                title="Displays the purpose of the model to help content writers"
                placement="right"
              >
                <InfoRoundedIcon
                  color="action"
                  sx={{ height: "12px", width: "12px" }}
                />
              </Tooltip>
            </Box>
            <Box flex={1} py={2}>
              {!!model?.description ? (
                <Typography>{model.description}</Typography>
              ) : (
                <Typography color="text.disabled">None</Typography>
              )}
            </Box>
            <Box py={1.5}>
              <Button
                size="small"
                onClick={() => setShowDialogue("updateDescription")}
              >
                Edit
              </Button>
            </Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            px={2}
            sx={{
              borderBottom: (theme) => `1px solid ${theme.palette.border}`,
            }}
          >
            <Box
              minWidth={280}
              display="flex"
              gap={1.5}
              alignItems="center"
              py={2}
            >
              <Typography color="text.primary">
                API/Parsley Reference ID
              </Typography>
              <Tooltip
                title="ID used for accessing this model through our API or Parsley"
                placement="right"
              >
                <InfoRoundedIcon
                  color="action"
                  sx={{ height: "12px", width: "12px" }}
                />
              </Tooltip>
            </Box>
            <Box flex={1} py={2}>
              <Typography>{model?.name}</Typography>
            </Box>
            <Box display="flex" py={1.5}>
              <Button size="small" onClick={() => handleCopy(model?.name)}>
                {isCopied === model?.name ? "Copied" : "Copy"}
              </Button>
              <Box
                sx={{
                  borderLeft: (theme) => `1px solid ${theme.palette.border}`,
                  width: "1px",
                  mx: 1.5,
                }}
              />
              <Button size="small" onClick={() => setShowDialogue("rename")}>
                Edit
              </Button>
            </Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            px={2}
            sx={{
              borderBottom: (theme) => `1px solid ${theme.palette.border}`,
            }}
          >
            <Box
              minWidth={280}
              display="flex"
              gap={1.5}
              alignItems="center"
              py={2}
            >
              <Typography color="text.primary">Parent Model</Typography>
              <Tooltip
                title="Selecting a parent affects default routing and content navigation in the UI"
                placement="right"
              >
                <InfoRoundedIcon
                  color="action"
                  sx={{ height: "12px", width: "12px" }}
                />
              </Tooltip>
            </Box>
            <Box flex={1} py={2}>
              {!!parentModel?.label ? (
                <Typography>{parentModel.label}</Typography>
              ) : (
                <Typography color="text.disabled">None</Typography>
              )}
            </Box>
            <Box display="flex" py={1.5}>
              <Button
                size="small"
                disabled={!parentModel}
                onClick={() =>
                  history.push(`/schema/${parentModel?.contentModelZUID}`)
                }
              >
                View
              </Button>
              <Box
                sx={{
                  borderLeft: (theme) => `1px solid ${theme.palette.border}`,
                  width: "1px",
                  mx: 1.5,
                }}
              />
              <Button
                size="small"
                onClick={() => setShowDialogue("updateParent")}
              >
                Edit
              </Button>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" px={2}>
            <Box
              minWidth={280}
              display="flex"
              gap={1.5}
              alignItems="center"
              py={2}
            >
              <Typography color="text.primary">ZUID</Typography>
              <Tooltip
                title="The unique id of the model. Content items are always accessed relative to their model, so a model ZUID is required for each call."
                placement="right"
              >
                <InfoRoundedIcon
                  color="action"
                  sx={{ height: "12px", width: "12px" }}
                />
              </Tooltip>
            </Box>
            <Box flex={1} py={2}>
              <Typography>{model?.ZUID}</Typography>
            </Box>
            <Box py={1.5}>
              <Button size="small" onClick={() => handleCopy(model?.ZUID)}>
                {isCopied === model?.ZUID ? "Copied" : "Copy"}
              </Button>
            </Box>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" pt={2} gap={2}>
          <Button
            size="large"
            color="inherit"
            variant="outlined"
            startIcon={<ContentCopyRoundedIcon color="action" />}
            onClick={() => setShowDialogue("duplicate")}
          >
            Duplicate Model
          </Button>
          <Button
            size="large"
            color="error"
            variant="outlined"
            startIcon={<DeleteRoundedIcon />}
            onClick={() => setShowDialogue("delete")}
          >
            Delete Model
          </Button>
        </Box>
      </Box>
      {showDialogue === "rename" && (
        <RenameModelDialogue
          onClose={() => setShowDialogue(null)}
          model={model}
        />
      )}
      {showDialogue === "updateDescription" && (
        <UpdateDescriptionModelDialogue
          onClose={() => setShowDialogue(null)}
          model={model}
        />
      )}
      {showDialogue === "updateParent" && (
        <UpdateParentModelDialogue
          onClose={() => setShowDialogue(null)}
          model={model}
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
