import { FC } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Stack, Typography, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import { AppLink } from "@zesty-io/core/AppLink";

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
      >
        <ItemCreateBreadcrumbs />
        <Typography variant="h3" fontWeight={700} color="text.primary">
          Create {model.label} Item
        </Typography>
      </Stack>
    </ThemeProvider>
  );
  // return (
  //   <header className={styles.Header}>
  //     <span>
  //       <AppLink to="/content">
  //         <FontAwesomeIcon icon={faHome} />
  //       </AppLink>
  //       <FontAwesomeIcon icon={faAngleRight} />
  //       <AppLink to={`/content/${props.model.ZUID}`}>
  //         {props.model.label}
  //       </AppLink>
  //       <FontAwesomeIcon icon={faAngleRight} />
  //       &nbsp;New Item
  //     </span>

  //     <ButtonGroup className={styles.Actions}>
  //       <Button
  //         variant="contained"
  //         color="success"
  //         id="CreateItemSaveButton"
  //         disabled={props.saving || !props.isDirty}
  //         onClick={props.onSave}
  //         startIcon={
  //           props.saving ? <CircularProgress size="20px" /> : <SaveIcon />
  //         }
  //       >
  //         Create
  //       </Button>
  //     </ButtonGroup>
  //   </header>
  // );
};
