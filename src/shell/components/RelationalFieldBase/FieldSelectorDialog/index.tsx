import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import { CloseRounded, Search } from "@mui/icons-material";

import { FieldSelectorFilters, STATUS_FILTER } from "./FieldSelectorFilters";
import { DateFilterValue } from "../../Filters/DateFilter";
import { useGetLangsQuery } from "../../../services/instance";

type FieldSelectorDialogProps = {
  onClose: () => void;
  modelZUID: string;
  modelName: string;
};
export const FieldSelectorDialog = ({
  onClose,
  modelZUID,
  modelName,
}: FieldSelectorDialogProps) => {
  const [filterKeyword, setFilterKeyword] = useState<string>(null);
  const [sortOrder, setSortOrder] = useState<string>("lastSaved");
  const [statusFilter, setStatusFilter] =
    useState<keyof typeof STATUS_FILTER>(null);
  const [userFilter, setUserFilter] = useState<string>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({
    type: "",
    value: "",
  });
  const [langFilter, setLangFilter] = useState<number>(null);

  const { data: langs } = useGetLangsQuery({});

  useEffect(() => {
    if (!!langs.length) {
      setLangFilter(langs.find((lang) => lang.default)?.ID);
    }
  }, [langs]);

  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 800,
          maxWidth: 800,
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          pt: 4,
          pb: 2,
          px: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          Select {modelName}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        id="fieldSelectorDialogBody"
        sx={{
          pb: 2,
          px: 4,
          bgcolor: "grey.50",
          borderTop: 1,
          borderColor: "border",
          display: "flex",
          flexDirection: "column",
          gap: 2,

          "&#fieldSelectorDialogBody": {
            pt: 2,
          },
        }}
      >
        <TextField
          fullWidth
          value={filterKeyword}
          onChange={(evt) => setFilterKeyword(evt.currentTarget.value)}
          size="small"
          placeholder="Filter Items"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FieldSelectorFilters
          modelZUID={modelZUID}
          sortOrder={sortOrder}
          onUpdateSortOrder={(newSortOrder) => setSortOrder(newSortOrder)}
          statusFilter={statusFilter}
          onUpdateStatusFilter={(newStatusFilter) =>
            setStatusFilter(newStatusFilter)
          }
          userFilter={userFilter}
          onUpdateUserFilter={(userZUID) => setUserFilter(userZUID)}
          dateFilter={dateFilter}
          onUpdateDateFilter={(newDateFilter) => setDateFilter(newDateFilter)}
          langFilter={langFilter}
          onUpdateLangFilter={(langID) => setLangFilter(langID)}
        />
      </DialogContent>
    </Dialog>
  );
};
