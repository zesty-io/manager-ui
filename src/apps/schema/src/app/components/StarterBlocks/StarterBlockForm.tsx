import React, { useCallback, useState } from "react";
import { useHistory } from "react-router";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography,
  Tooltip,
  FormControl,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
  Backdrop,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useCreateStarterBlockModelMutation } from "../../../../../../shell/services/instance";
import {
  ContentModel,
  ContentModelField,
} from "../../../../../../shell/services/types";
import { Field } from "../Field";
import { OG_IMAGE_FIELD, StarterBlockProps } from "./configs";

type TextInputFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  toolTip?: string;
  onChange?: (val: string) => void;
};

type StarterBlockFormProps = {
  block: StarterBlockProps;
  onClose: () => void;
  setActiveStep: (step: "selection" | "form") => void;
};

type CreateStarterBlockFieldsProps = Omit<
  ContentModelField,
  | "ZUID"
  | "contentModelZUID"
  | "datatypeOptions"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

const TextInputField: React.FC<TextInputFieldProps> = ({
  label = "Label",
  name,
  placeholder = "Text",
  required = false,
  error = "",
  value,
  toolTip,
  onChange,
  ...other
}) => {
  function handleChage(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
  }
  return (
    <Box width="100%">
      <FormControl variant="standard" fullWidth>
        <Typography
          variant="body2"
          color="text.primary"
          fontWeight={600}
          mb={0.25}
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="baseline"
        >
          {label}
          {required && (
            <Tooltip placement="top" title={toolTip}>
              <InfoRoundedIcon
                sx={{ width: 14, height: 14, color: "action.active", ml: 0.75 }}
              />
            </Tooltip>
          )}
        </Typography>
        <OutlinedInput
          {...other}
          fullWidth
          placeholder={placeholder}
          required={required}
          error={!!error}
          inputProps={{
            name: name,
            value: value,
            onInput: handleChage,
            // "data-cy": `form-input-${name}`,
          }}
        />
        <FormHelperText
          error={!!error}
          variant="standard"
          data-cy={`starter-block-form-${name}-error`}
        >
          {error}
        </FormHelperText>
      </FormControl>
    </Box>
  );
};

export const StarterBlockForm: React.FC<StarterBlockFormProps> = ({
  block,
  onClose,
  setActiveStep,
}) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [blockModelData, setBlockModelData] = useState({ ...block });

  const [error, setError] = useState<Record<string, string>>({
    label: "",
    name: "",
  });

  const [createStarterBlock] = useCreateStarterBlockModelMutation();

  function cleanString(str: string) {
    return str.toLowerCase().replace(/\W/g, "_");
  }
  function parseErrorMessage(str: string) {
    return str.split(":")[2] || str;
  }

  const handleBlockLabelChange = (val: string) => {
    setBlockModelData((prev: any) => ({
      ...prev,
      label: val,
      name: cleanString(val),
    }));
  };

  const handleBlockNameChange = (val: string) => {
    setBlockModelData((prev: any) => ({
      ...prev,
      name: cleanString(val),
    }));
  };

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!blockModelData?.label || !blockModelData?.name) return;
      setError({ label: "", name: "" });
      setIsLoading(true);

      try {
        const formData = new FormData(e.currentTarget);
        const { label, name } = Object.fromEntries(formData) as {
          label: string;
          name: string;
        };

        const createBlockModelPayload: Partial<ContentModel> = {
          label,
          name,
          type: "block",
          description: block?.description,
          parentZUID: "",
          listed: true,
        };

        const fieldsPayload: CreateStarterBlockFieldsProps[] = [
          ...blockModelData?.fields,
          OG_IMAGE_FIELD,
        ]?.map((field, index) => {
          return {
            name: field?.name,
            label: field?.label,
            description: field?.description,
            datatype: field?.datatype,
            sort: index + 1,
            settings: {
              ...field?.settings,
              list: field?.name === "og_image" ? false : true,
            },
          };
        });

        const createStarterBlockRes: any = await createStarterBlock({
          modelData: createBlockModelPayload,
          fields: fieldsPayload,
          code: block?.code,
        });

        if (createStarterBlockRes?.error) {
          const errorMessage = parseErrorMessage(
            createStarterBlockRes?.error?.error
          );
          setError({
            name: errorMessage.includes("name")
              ? "Reference ID is already in use. Please use another Reference ID."
              : errorMessage,
            label:
              errorMessage.includes("label") ||
              (errorMessage.includes("name") && cleanString(label) === name)
                ? "Display name is already in use. Please use another display name."
                : "",
          });
          throw new Error(errorMessage);
        }
        const ZUID = createStarterBlockRes?.data?.model?.ZUID;

        setIsLoading(false);
        onClose();
        history.push(`/schema/${ZUID}`);
      } catch (err) {
        setIsLoading(false);
        console.error("Error during form submission:", err);
      }
    },
    [blockModelData, createStarterBlock, onClose, history]
  );

  return (
    <Box
      component="form"
      height="100%"
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="stretch"
      overflow="hidden"
      onSubmit={handleFormSubmit}
      data-cy="starter-block-form"
    >
      <DialogTitle component="div">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box width="90%">
            <Typography
              variant="h5"
              fontWeight={700}
              data-cy="starter-block-form-title"
            >
              {block?.label}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => onClose()}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          backgroundColor: "grey.50",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "100%",
        }}
        dividers
      >
        <Box display="flex" flexDirection="column" rowGap={2}>
          <Box
            bgcolor="grey.100"
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              boxSizing: "border-box",
              borderBottom: ".75rem solid",
              borderTop: ".75rem solid",
              borderColor: "grey.100",
            }}
          >
            <img
              data-cy="starter-block-form-image"
              loading="lazy"
              src={block?.image}
              alt={block?.label}
              style={{ maxWidth: "65%" }}
            />
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            columnGap={3}
            px={3}
            py={1}
            sx={{
              boxSizing: "border-box",
              minHeight: "100px",
            }}
          >
            <Box flexGrow={1}>
              <Typography variant="h6" fontWeight={700}>
                Details
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                rowGap={1.75}
                pt={1.5}
                pb={2.5}
              >
                <TextInputField
                  label="Display Name"
                  name="label"
                  placeholder="e.g. Home Page, About Page, Contact Page, etc."
                  required
                  value={blockModelData?.label}
                  onChange={handleBlockLabelChange}
                  toolTip="Name that is shown to content editors"
                  error={error["label"] || ""}
                  data-cy="starter-block-form-label"
                />
                <TextInputField
                  label="Reference ID"
                  name="name"
                  placeholder="Auto-Generated from Display Name"
                  required
                  value={blockModelData?.name}
                  toolTip="ID used for accessing this model through our API or Parsley"
                  onChange={handleBlockNameChange}
                  error={error["name"] || ""}
                  data-cy="starter-block-form-name"
                />
              </Box>
              {!!blockModelData?.fields?.length && (
                <>
                  <Typography variant="h6" fontWeight={700}>
                    Fields
                  </Typography>
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-start"
                    alignItems="stretch"
                    rowGap={1.5}
                    pt={1.5}
                    pb={2.5}
                    width="100%"
                    data-cy="starter-block-form-fields-container"
                  >
                    {block?.fields?.map((field: any, index: number) => (
                      <Field
                        key={field?.name}
                        withMenu={false}
                        withHover={false}
                        withDragIcon={false}
                        index={index}
                        disableDrag
                        field={field}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
            <Box width="36%" flexGrow={0}>
              <Typography variant="h6" fontWeight={700}>
                Resources
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                rowGap={1}
                pt={1.5}
                pb={2.5}
              >
                <Link
                  href="#"
                  target="_blank"
                  color="primary.main"
                  variant="body2"
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  columnGap={1}
                  sx={{
                    textDecorationColor: (theme) => theme.palette.primary.main,
                    "&:hover": {
                      textDecorationColor: (theme) =>
                        theme.palette.primary.main,
                    },
                  }}
                >
                  Preview
                  <OpenInNewRoundedIcon fontSize="small" />
                </Link>
                <Link
                  href="#"
                  target="_blank"
                  color="primary.main"
                  variant="body2"
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  columnGap={1}
                  sx={{
                    textDecorationColor: (theme) => theme.palette.primary.main,
                    "&:hover": {
                      textDecorationColor: (theme) =>
                        theme.palette.primary.main,
                    },
                  }}
                >
                  Code Template
                  <OpenInNewRoundedIcon fontSize="small" />
                </Link>
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Description
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                rowGap={1}
                pt={1.5}
                pb={2.5}
              >
                <Typography variant="body2" color="text.secondary">
                  {block?.description}
                </Typography>
                <Link
                  variant="body2"
                  href={block?.codeReference}
                  target="_blank"
                  underline="always"
                  color="info.main"
                  mt={2}
                >
                  See Bootstrap Template
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ pt: 2.5 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => setActiveStep("selection")}
        >
          Back
        </Button>
        <Button
          variant="contained"
          data-cy="starter-block-form-submit"
          type="submit"
          disabled={
            !blockModelData?.label || !blockModelData?.name || !!isLoading
          }
        >
          Done
        </Button>
      </DialogActions>

      <Backdrop
        data-cy="starter-block-form-loading-backdrop"
        open={isLoading}
        sx={{
          position: "absolute",
          backgroundColor: "background.paper",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          rowGap={1}
        >
          <CircularProgress color="primary" size={60} sx={{ p: 1 }} />
          <Typography variant="h5" color="text.primary" fontWeight={700}>
            Creating Model
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This may take a couple of minutes.
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};
