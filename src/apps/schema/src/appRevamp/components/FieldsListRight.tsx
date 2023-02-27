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
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckIcon from "@mui/icons-material/Check";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { ContentModel } from "../../../../../shell/services/types";
import { useUpdateContentModelMutation } from "../../../../../shell/services/instance";

interface Props {
  model: ContentModel;
}

export const FieldsListRight = ({ model }: Props) => {
  const [description, setDescription] = useState("");
  const [isCopied, setIsCopied] = useState(null);

  const [updateContentModel, { isLoading }] = useUpdateContentModelMutation();

  useEffect(() => {
    if (model?.description) {
      setDescription(model?.description || "");
    }
  }, [model]);

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

  const handleSave = () => {
    const body = {
      ...model,
      description,
    };
    updateContentModel({
      ZUID: model.ZUID,
      body,
    });
  };

  return (
    <Box height="100%" width="280px" bgcolor="grey.50" padding={2}>
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
      <InputLabel sx={{ mt: 3 }}>
        Description
        <Tooltip
          placement="top"
          title="Displays the purpose of the model to help content-writers"
        >
          <InfoRoundedIcon
            sx={{ ml: 1, width: "10px", height: "10px" }}
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
          onClick={handleSave}
          sx={{ mt: 1.5 }}
        >
          Save
        </LoadingButton>
      )}
      <Box
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
      </Box>
    </Box>
  );
};
