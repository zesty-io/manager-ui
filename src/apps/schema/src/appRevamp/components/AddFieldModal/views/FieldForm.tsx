import { Dispatch, SetStateAction, useState } from "react";
import {
  Typography,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Box,
  Tabs,
  Tab,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { ViewMode } from "../index";
import { FieldIcon } from "../../Field/FieldIcon";
import { stringStartsWithVowel } from "../../utils";

type ActiveTab = "details" | "rules";
interface Props {
  type: string;
  name: string;
  onModalClose: () => void;
  onBackClick: Dispatch<SetStateAction<ViewMode>>;
}
export const FieldForm = ({ type, name, onModalClose, onBackClick }: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");

  const headerText = stringStartsWithVowel(name)
    ? `Add an ${name} Field`
    : `Add a ${name} Field`;

  return (
    <>
      <DialogTitle
        sx={{
          padding: 3,
          paddingBottom: "0px",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pb={0.5}
        >
          <Box display="flex" alignItems="center">
            <IconButton size="small" onClick={() => onBackClick("fields_list")}>
              <ArrowBackIcon />
            </IconButton>
            <Box px={1.5}>
              <FieldIcon
                type={type}
                height="28px"
                width="28px"
                fontSize="16px"
              />
            </Box>
            {headerText}
          </Box>
          <IconButton size="small" onClick={onModalClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(_, value: ActiveTab) => setActiveTab(value)}
        >
          <Tab value="details" label="Details" />
          <Tab value="rules" label="Rules" />
        </Tabs>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          px: 3,
          py: 3,
          "&.MuiDialogContent-dividers": {
            borderColor: "border",
          },
        }}
      >
        {activeTab === "details" && <Typography>Field form page</Typography>}

        {activeTab === "rules" && <Typography>Coming soon...</Typography>}
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
        }}
      >
        <Button variant="outlined" color="inherit">
          Cancel
        </Button>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            sx={{
              mr: 2,
            }}
          >
            Add another field
          </Button>
          <Button variant="contained">Done</Button>
        </Box>
      </DialogActions>
    </>
  );
};
