import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  IconButton,
  Stack,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { FIELD_COPY_CONFIG, FieldListData } from "../../configs";
import { FieldItem } from "../FieldItem";

const repeaterFields = {
  text: FIELD_COPY_CONFIG.text,
  media: FIELD_COPY_CONFIG.media,
  relationship: FIELD_COPY_CONFIG.relationship.filter(
    (field) => field.type === "link"
  ),
  numeric: FIELD_COPY_CONFIG.numeric,
  options: FIELD_COPY_CONFIG.options.filter(
    (field) => field.type !== "repeater_field"
  ),
};

type RepeaterFieldsSelectionProps = {
  handleClose: () => void;
  name: string;
};
export const RepeaterFieldsSelection = ({
  handleClose,
  name,
}: RepeaterFieldsSelectionProps) => {
  return (
    <Dialog
      open
      onClose={handleClose}
      fullScreen
      sx={{
        my: 2.5,
      }}
      slotProps={{
        paper: {
          sx: {
            width: 900,
            maxWidth: "100%",
            maxHeight: "min(100%, 1000px)",
            minHeight: "680px",
            m: 0,
          },
        },
      }}
    >
      <DialogTitle component="div">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              data-cy="BackToFieldSelectionBtn"
              size="small"
              onClick={handleClose}
              sx={{ mr: 1.5 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={700}>
              Add Field to {name}
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={handleClose}
            data-cy="AddFieldCloseBtn"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 2.5,
          backgroundColor: "grey.50",
          "&.MuiDialogContent-dividers": {
            borderColor: "border",
          },
          "& div.field-type-group:not(:last-of-type)": {
            mb: 1.5,
          },
        }}
      >
        {Object.keys(repeaterFields).map(
          (fieldKey: keyof typeof repeaterFields) => (
            <Box className="field-type-group" key={fieldKey}>
              <Typography
                component="p"
                variant="overline"
                mb={1.5}
                color="text.secondary"
              >
                {fieldKey === "options" ? "Advanced" : fieldKey}
              </Typography>
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                rowGap={1.5}
                columnGap={2}
              >
                {repeaterFields[fieldKey].map((field: FieldListData, index) => {
                  return (
                    <FieldItem
                      key={index}
                      fieldName={field.name}
                      shortDescription={field.shortDescription}
                      fieldType={field.type}
                      description={field.description}
                      commonUses={field.commonUses}
                      proTip={field.proTip}
                      onFieldClick={() => {}}
                    />
                  );
                })}
              </Box>
            </Box>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};
