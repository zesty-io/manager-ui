import { Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { RepeaterFieldsSelection } from "./views/RepeaterFieldsSelection";

type RepeaterFieldProps = {
  onAddField: () => void;
  name: string;
};
export const RepeaterFields = ({ onAddField, name }: RepeaterFieldProps) => {
  const [isFieldSelectionOpen, setIsFieldSelectionOpen] = useState(false);

  return (
    <div>
      <Button
        variant="outlined"
        size="large"
        onClick={() => setIsFieldSelectionOpen(true)}
        startIcon={<AddIcon />}
        fullWidth
      >
        Add field to {name}
      </Button>
      {isFieldSelectionOpen && (
        <RepeaterFieldsSelection
          handleClose={() => setIsFieldSelectionOpen(false)}
          name={name}
        />
      )}
    </div>
  );
};
