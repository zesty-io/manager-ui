import { memo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { FileStatus } from "./components/FileStatus";
import { LinkedSchema } from "./components/LinkedSchema";
import { LinkedContent } from "./components/LinkedContent";
import { AuditTrail } from "./components/AuditTrail";

import { fetchAuditTrail } from "../../../store/auditTrail";

import { notify } from "../../../../../../shell/store/notifications";
import Box from "@mui/material/Box";
import { Collapse, Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import { IconButton } from "@zesty-io/material";
import Stack from "@mui/material/Stack";
import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";
import { fetchItems } from "../../../../../../shell/store/content";
import { fetchFields } from "../../../../../../shell/store/fields";
import { WithLoader } from "@zesty-io/core/WithLoader";

export const FileDrawer = memo(function FileDrawer(props) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);

  const metaShortcut = useMetaKey("j", handleSetOpen);

  useEffect(() => {
    setLoading(true);

    let logs = dispatch(fetchAuditTrail(props.file.ZUID));
    let fields = Promise.resolve();
    let items = Promise.resolve();

    if (props.file.contentModelZUID) {
      fields = dispatch(fetchFields(props.file.contentModelZUID));

      items = dispatch(
        fetchItems(props.file.contentModelZUID, {
          limit: 3,
        })
      );
    }

    Promise.all([logs, fields, items])
      .then((res) => {
        const [logs, fields, items] = res;

        if (logs?.status !== 200) {
          dispatch(
            notify({
              message: "Unable to load Code file logs",
              kind: "warn",
            })
          );
          setLogs(null);
          return;
        }

        // Logs should always exist
        setLogs(
          logs.data
            .sort((a, b) => {
              // Latest log descending
              return moment(a.createdAt).unix() > moment(b.createdAt).unix()
                ? -1
                : 1;
            })
            .slice(0, 10)
        );

        if (fields && fields.payload) {
          let tempArray = [];
          Object.keys(fields.payload).forEach((field) =>
            tempArray.push(fields.payload[field])
          );
          setFields(tempArray);
        }
        if (items && items.data) {
          setItems(items.data.slice(0, 3));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props.file.ZUID]);

  function handleSetOpen() {
    // TODO persist to user settings
    setOpen((open) => !open);
  }

  return (
    <Box
      width="100%"
      bgcolor="grey.900"
      height="45vh"
      flexGrow={0}
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      flexShrink={1}
      boxSizing="border-box"
      boxShadow="0px -1px 3px 0px #131313"
    >
      <Box
        px={1}
        width="100%"
        height="48px"
        boxSizing="border-box"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            size="small"
            color="inherit"
            title="Open for additional file information"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
          {open ? null : (
            <Typography variant="body2">More file information</Typography>
          )}
        </Stack>
        <Typography variant="body2" color="inherit" pr={1}>
          {open ? "Close" : "Open"} Drawer {metaShortcut}
        </Typography>
      </Box>
      <Collapse in={open}>
        <Paper
          elevation={0}
          square
          sx={{
            width: "100%",
            height: "40vh",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              px: 2,
              columnGap: 2,
              display: "flex",
              flexDirection: "row",
              overflowY: "hidden",
              flexShrink: 0,
              minHeight: "100%",
              boxSizing: "border-box",
              position: "relative",

              pb: 2,
            }}
          >
            <WithLoader
              condition={!loading}
              height="100%"
              message="Loading file information"
            >
              <FileStatus file={props.file || {}} items={items || []} />
              {props.file.contentModelZUID && (
                <LinkedSchema file={props.file || {}} fields={fields} />
              )}
              {props.file.contentModelZUID && (
                <LinkedContent file={props.file || {}} items={items} />
              )}
              <AuditTrail file={props.file || {}} logs={logs} />
            </WithLoader>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
});
