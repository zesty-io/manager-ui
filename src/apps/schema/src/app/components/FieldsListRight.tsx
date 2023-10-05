import { useEffect, useState } from "react";
import {
  Box,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Link,
  Tooltip,
  Select,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckIcon from "@mui/icons-material/Check";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { ContentModel } from "../../../../../shell/services/types";
import { useUpdateContentModelMutation } from "../../../../../shell/services/instance";
import { SelectModelParentInput } from "./SelectModelParentInput";

interface Props {
  model: ContentModel;
}

export const FieldsListRight = ({ model }: Props) => {
  const [description, setDescription] = useState("");
  const [isCopied, setIsCopied] = useState(null);
  const [newParentZUID, setNewParentZUID] = useState(null);
  const [showSaveParentModelButton, setshowSaveParentModelButton] =
    useState(false);

  useEffect(() => {
    if (model?.parentZUID) {
      setNewParentZUID(model.parentZUID === "0" ? null : model.parentZUID);
    }
  }, [model]);

  const [updateContentModel, { isLoading, isSuccess }] =
    useUpdateContentModelMutation();

  useEffect(() => {
    if (model?.description) {
      setDescription(model?.description || "");
    }
  }, [model]);

  useEffect(() => {
    if (isSuccess) {
      setshowSaveParentModelButton(false);
    }
  }, [isSuccess]);

  const handleCopyClick = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(data);
        setTimeout(() => {
          setIsCopied(null);
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleSave = (type: "description" | "parentZUID") => {
    let body = { ...model };

    switch (type) {
      case "description":
        body = {
          ...body,
          description,
        };
        break;

      case "parentZUID":
        body = {
          ...body,
          parentZUID: newParentZUID ?? "0",
        };
        break;

      default:
        break;
    }

    updateContentModel({
      ZUID: model.ZUID,
      body,
    });
  };

  return (
    <Box height="100%" width="280px" bgcolor="grey.50" py={2} pl={2} pr={4}>
      <InputLabel>
        Reference ID
        <Tooltip
          placement="top"
          title="Use this ID to retrieve anything related to this model via the API"
        >
          <InfoRoundedIcon
            sx={{ ml: 1, width: "12px", height: "12px" }}
            color="action"
          />
        </Tooltip>
      </InputLabel>
      <TextField
        disabled
        value={model?.name}
        fullWidth
        inputProps={{
          sx: {
            ":read-only": {
              textFillColor: "#101828",
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => handleCopyClick(model?.name)}
              >
                {isCopied === model?.name ? (
                  <CheckIcon color="action" />
                ) : (
                  <ContentCopyRoundedIcon color="action" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <InputLabel sx={{ mt: 3 }}>
        ZUID
        <Tooltip
          placement="top"
          title="Content items are always accessed relative to their model, so a model ZUID is required for each call."
        >
          <InfoRoundedIcon
            sx={{ ml: 1, width: "12px", height: "12px" }}
            color="action"
          />
        </Tooltip>
      </InputLabel>
      <TextField
        disabled
        value={model?.ZUID}
        fullWidth
        inputProps={{
          sx: {
            ":read-only": {
              textFillColor: "#101828",
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => handleCopyClick(model?.ZUID)}
              >
                {isCopied === model?.ZUID ? (
                  <CheckIcon color="action" />
                ) : (
                  <ContentCopyRoundedIcon color="action" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box mt={3}>
        <SelectModelParentInput
          modelType={model?.type}
          value={newParentZUID}
          onChange={(value) => {
            setshowSaveParentModelButton(value !== model?.parentZUID);
            setNewParentZUID(value);
          }}
          withTooltip={false}
          label="Model Parent"
        />
        {showSaveParentModelButton && (
          <LoadingButton
            color="primary"
            loading={isLoading}
            variant="contained"
            onClick={() => handleSave("parentZUID")}
            sx={{ mt: 1.5 }}
          >
            Save
          </LoadingButton>
        )}
      </Box>

      <InputLabel sx={{ mt: 3 }}>
        Description
        <Tooltip
          placement="top"
          title="Displays the purpose of the model to help content-writers"
        >
          <InfoRoundedIcon
            sx={{ ml: 1, width: "12px", height: "12px" }}
            color="action"
          />
        </Tooltip>
      </InputLabel>
      <TextField
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        fullWidth
        multiline
        minRows={4}
      />
      {description !== model?.description && (
        <LoadingButton
          color="primary"
          loading={isLoading}
          startIcon={<SaveRoundedIcon />}
          loadingPosition="start"
          variant="contained"
          onClick={() => handleSave("description")}
          sx={{ mt: 1.5 }}
        >
          Save
        </LoadingButton>
      )}
      {/* <Box
        sx={{
          mt: 3,
          mb: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.grey[200]}`,
        }}
      >
        <Typography variant="overline">DOCUMENTATION</Typography>
      </Box>
      <Box
        component="ul"
        sx={{
          color: "info.dark",
          lineHeight: "20px",
          listStylePosition: "inside",
        }}
        fontSize={14}
      >
        <Box component="li" pb={0.5}>
          <Link href="#">How to create models</Link>
        </Box>
        <Box component="li" pb={0.5}>
          <Link href="#">Fields in Schema</Link>
        </Box>
        <Box component="li" pb={0.5}>
          <Link href="#">Accessing your Model's Data</Link>
        </Box>
        <Box component="li" pb={0.5}>
          <Link href="#">Zesty APIs</Link>
        </Box>
        <Box component="li">
          <Link href="#">De-activating Fields</Link>
        </Box>
      </Box> */}
    </Box>
  );
};
