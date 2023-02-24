import { useState } from "react";
import {
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { FieldItem } from "../FieldItem";
import { FieldListData, FIELD_COPY_CONFIG } from "../../configs";

interface Props {
  onFieldClick: (fieldType: string, fieldName: string) => void;
  onModalClose: () => void;
}
export const FieldSelection = ({ onFieldClick, onModalClose }: Props) => {
  const [fieldTypes, setFieldTypes] = useState(FIELD_COPY_CONFIG);

  const handleFilterFields = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value.toLowerCase();
    let filteredFields: { [key: string]: FieldListData[] } = {};

    Object.keys(FIELD_COPY_CONFIG).forEach((category) => {
      const matchedFields = FIELD_COPY_CONFIG[category].filter((field) => {
        const name = field.name.toLowerCase();

        if (name.includes(userInput)) {
          return field;
        }
      });

      if (matchedFields.length) {
        filteredFields[category] = matchedFields;
      }
    });

    setFieldTypes(filteredFields);
  };

  return (
    <>
      <DialogTitle sx={{ px: 3, py: 2.5 }}>
        <Box display="flex" justifyContent="space-between" pb={2}>
          Select a Field Type
          <IconButton
            size="small"
            onClick={onModalClose}
            data-cy="AddFieldCloseBtn"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box width="349px">
          <TextField
            data-cy="FieldSelectionFilter"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            onChange={handleFilterFields}
            placeholder="Search field types"
            autoFocus
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent
        data-cy="FieldSelection"
        dividers
        sx={{
          px: 3,
          py: 1.5,
          "&.MuiDialogContent-dividers": {
            borderColor: "border",
          },
          "& div.field-type-group:not(:last-of-type)": {
            mb: 1.5,
          },
        }}
      >
        {!Object.keys(fieldTypes).length && (
          <Typography data-cy="FieldSelectionEmpty">
            No matches found.
          </Typography>
        )}
        {Object.keys(fieldTypes).map((fieldKey) => (
          <Box className="field-type-group" key={fieldKey}>
            <Typography
              component="p"
              variant="overline"
              mb={1.5}
              color="text.secondary"
            >
              {fieldKey === "dateandtime" ? "Date & Time" : fieldKey}
            </Typography>
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr"
              rowGap={1.5}
              columnGap={2}
            >
              {fieldTypes[fieldKey].map((field: FieldListData, index) => (
                <FieldItem
                  key={index}
                  fieldName={field.name}
                  shortDescription={field.shortDescription}
                  fieldType={field.type}
                  description={field.description}
                  commonUses={field.commonUses}
                  proTip={field.proTip}
                  onFieldClick={() => onFieldClick(field.type, field.name)}
                />
              ))}
            </Box>
          </Box>
        ))}
      </DialogContent>
    </>
  );
};
