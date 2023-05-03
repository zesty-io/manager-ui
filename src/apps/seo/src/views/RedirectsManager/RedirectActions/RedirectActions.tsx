import { Box } from "@mui/material";
import styles from "./RedirectActions.less";

import { RedirectFilter } from "./RedirectFilter";

interface RedirectActionsProps {
  redirectsTotal: number;
  dispatch: () => void;
}
export default function RedirectActions(props: RedirectActionsProps) {
  return (
    <Box
      component="header"
      className={styles.RedirectActions}
      sx={{
        backgroundColor: "background.paper",
      }}
    >
      <h1 className={styles.title}>{props.redirectsTotal} Total Redirects</h1>
      <div className={styles.actions}>
        <RedirectFilter dispatch={props.dispatch} />
      </div>
    </Box>
  );
}
