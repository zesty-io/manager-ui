import { Box, Tooltip, Typography, Button } from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { useHistory, useParams } from "react-router";
import { useState } from "react";
import { RenameModelDialogue } from "../RenameModelDialogue";
import { UpdateDescriptionModelDialogue } from "../UpdateDescriptionModelDialogue";
import { UpdateParentModelDialogue } from "../UpdateParentModelDialogue";

type Params = {
  id: string;
};

export const ModelDetails = () => {
  const params = useParams<Params>();
  const { id } = params;
  const history = useHistory();
  const { data: models } = useGetContentModelsQuery();
  const model = models?.find((model) => model.ZUID === id);
  const parentModel = models?.find((m) => m.ZUID === model?.parentZUID);
  const [showDialogue, setShowDialogue] = useState<
    "rename" | "updateDescription" | "updateParent" | null
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
          display="flex"
          alignItems="center"
          py={2}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box minWidth={280} display="flex" gap={1.5} alignItems="center">
            <Typography color="text.secondary">Name</Typography>
            <Tooltip
              title="Name that is shown to content editors"
              placement="left"
            >
              <InfoRoundedIcon
                color="action"
                sx={{ height: "12px", width: "12px" }}
              />
            </Tooltip>
          </Box>
          <Box flex={1}>
            <Typography>{model?.label}</Typography>
          </Box>
          <Button size="small" onClick={() => setShowDialogue("rename")}>
            Edit
          </Button>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          py={2}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box minWidth={280} display="flex" gap={1.5} alignItems="center">
            <Typography color="text.secondary">Description</Typography>
            <Tooltip
              title="Displays the purpose of the model to help content writers"
              placement="left"
            >
              <InfoRoundedIcon
                color="action"
                sx={{ height: "12px", width: "12px" }}
              />
            </Tooltip>
          </Box>
          <Box flex={1}>
            <Typography>{model?.description}</Typography>
          </Box>
          <Button
            size="small"
            onClick={() => setShowDialogue("updateDescription")}
          >
            Edit
          </Button>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          py={2}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box minWidth={280} display="flex" gap={1.5} alignItems="center">
            <Typography color="text.secondary">
              API/Parsley Reference ID
            </Typography>
            <Tooltip
              title="ID used for accessing this model through our API or Parsley"
              placement="left"
            >
              <InfoRoundedIcon
                color="action"
                sx={{ height: "12px", width: "12px" }}
              />
            </Tooltip>
          </Box>
          <Box flex={1}>
            <Typography>{model?.name}</Typography>
          </Box>
          <Box display="flex">
            <Button size="small" onClick={() => handleCopy(model?.name)}>
              {isCopied === model?.name ? "Copied" : "Copy"}
            </Button>
            <Box
              sx={{
                borderLeft: (theme) => `1px solid ${theme.palette.border}`,
                width: "1px",
                height: "100%",
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
          py={2}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box minWidth={280} display="flex" gap={1.5} alignItems="center">
            <Typography color="text.secondary">Parent Model</Typography>
            <Tooltip
              title="Selecting a parent affects default routing and content navigation in the UI"
              placement="left"
            >
              <InfoRoundedIcon
                color="action"
                sx={{ height: "12px", width: "12px" }}
              />
            </Tooltip>
          </Box>
          <Box flex={1}>
            <Typography>{parentModel?.label}</Typography>
          </Box>
          <Box display="flex">
            <Button
              size="small"
              disabled={!parentModel}
              onClick={() => history.push(`/schema/${parentModel?.ZUID}`)}
            >
              View
            </Button>
            <Box
              sx={{
                borderLeft: (theme) => `1px solid ${theme.palette.border}`,
                width: "1px",
                height: "100%",
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
        <Box
          display="flex"
          alignItems="center"
          py={2}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box minWidth={280} display="flex" gap={1.5} alignItems="center">
            <Typography color="text.secondary">ZUID</Typography>
            <Tooltip
              title="The unique id of the model. Content items are always accessed relative to their model, so a model ZUID is required for each call."
              placement="left"
            >
              <InfoRoundedIcon
                color="action"
                sx={{ height: "12px", width: "12px" }}
              />
            </Tooltip>
          </Box>
          <Box flex={1}>
            <Typography>{model?.ZUID}</Typography>
          </Box>
          <Button size="small" onClick={() => handleCopy(model?.ZUID)}>
            {isCopied === model?.ZUID ? "Copied" : "Copy"}
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
    </>
  );
};
