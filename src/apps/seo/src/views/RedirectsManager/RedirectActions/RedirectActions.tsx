import { Box, Typography } from "@mui/material";
import { CSVImporter } from "../../../store/imports";
import { RedirectFilter } from "./RedirectFilter";
import RedirectsImport from "./RedirectsImport";
import { useDispatch } from "react-redux";

interface RedirectActionsProps {
  redirectsTotal: number;
  dispatch: () => void;
}
export default function RedirectActions(props: RedirectActionsProps) {
  const dispatch = useDispatch();
  return (
    <Box
      component="header"
      width="100%"
      sx={{
        backgroundColor: "background.paper",
        alignItems: "center",
        justifyContent: "space-between",
        display: "flex",
        top: "0",
        zIndex: 2,
      }}
    >
      <Typography variant="h3" fontWeight="700">
        {props.redirectsTotal} Total Redirects
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        columnGap={1}
      >
        <RedirectFilter dispatch={props.dispatch} />
        <RedirectsImport
          onChange={(evt: any) => {
            dispatch(CSVImporter(evt as any));
          }}
        />
      </Box>
    </Box>
  );
}
