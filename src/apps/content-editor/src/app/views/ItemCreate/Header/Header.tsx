import { FC } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Stack,
  Typography,
  ThemeProvider,
  Button,
  ButtonGroup,
  alpha,
  Theme,
} from "@mui/material";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { theme } from "@zesty-io/material";

import { useMetaKey } from "../../../../../../../shell/hooks/useMetaKey";
import { ContentModel } from "../../../../../../../shell/services/types";
import { ItemCreateBreadcrumbs } from "./ItemCreateBreadcrumbs";

interface Props {
  model: ContentModel;
  onSave: () => void;
  saving: boolean;
  isDirty: boolean;
}
export const Header: FC<Props> = ({ model, onSave, saving, isDirty }) => {
  //@ts-ignore Fix type
  const metaShortcut = useMetaKey("s", onSave);

  return (
    <ThemeProvider theme={theme}>
      <Stack
        px={4}
        pt={4}
        pb={1.75}
        borderBottom="2px solid"
        borderColor="border"
        sx={{ backgroundColor: "background.paper" }}
        direction="row"
        justifyContent="space-between"
        alignItems="flext-start"
      >
        <Stack gap={0.25}>
          <ItemCreateBreadcrumbs />
          <Typography
            variant="h3"
            fontWeight={700}
            color="text.primary"
            sx={{
              display: "-webkit-box",
              "-webkit-line-clamp": "2",
              "-webkit-box-orient": "vertical",
              wordBreak: "break-word",
              wordWrap: "break-word",
              hyphens: "auto",
              overflow: "hidden",
            }}
          >
            Create {model.label} Item
          </Typography>
        </Stack>
        <Stack direction="row" gap={1} flexShrink={0} alignItems="flex-start">
          <ButtonGroup variant="outlined" color="primary" size="small">
            <Button startIcon={<AddRoundedIcon />}>Create & Add New</Button>
            <Button>
              <ArrowDropDownRoundedIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup
            variant="contained"
            color="primary"
            size="small"
            sx={{
              "& .MuiButtonGroup-grouped": {
                backgroundColor: "primary.main",
                color: "common.white",

                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              },
            }}
          >
            <Button startIcon={<SaveRoundedIcon />}>Create</Button>
            <Button>
              <ArrowDropDownRoundedIcon />
            </Button>
          </ButtonGroup>
        </Stack>
      </Stack>
    </ThemeProvider>
  );
};
