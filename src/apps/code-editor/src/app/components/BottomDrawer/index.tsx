import { memo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import { Stack, Collapse, Paper, Typography, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { WithLoader } from "shell/components/legacy/WithLoader";

import AuditTrail, { LogEntry } from "./AuditTrail";
import FileStatus from "./FileStatus";
import LinkedContent from "./LinkedContent";
import LinkedSchema from "./LinkedSchema";
import { fetchFields } from "../../../../../../shell/store/fields";
import { fetchAuditTrail } from "../../../store/auditTrail";
import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";
import { fetchItems } from "../../../../../../shell/store/content";
import { NavCodeTypes } from "../constants";

interface Field {
  ZUID: string;
  name: string;
}

interface ItemMeta {
  ZUID: string;
  contentModelZUID: string;
}

interface ItemWeb {
  metaTitle: string;
  path: string;
}

interface Item {
  meta: ItemMeta;
  web: ItemWeb;
}

interface Log {
  createdAt: string;
  [key: string]: any;
}

interface BottomDrawerProps {
  file: NavCodeTypes;
}

const BottomDrawer = memo(function BottomDrawer({ file }: BottomDrawerProps) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const metaShortcut = useMetaKey("j", handleSetOpen);

  useEffect(() => {
    setLoading(true);

    let logsPromise = dispatch(
      fetchAuditTrail(file.ZUID)
    ) as unknown as Promise<any>;
    let fieldsPromise: Promise<any> = Promise.resolve();
    let itemsPromise: Promise<any> = Promise.resolve();

    if (file.contentModelZUID) {
      fieldsPromise = dispatch(
        fetchFields(file.contentModelZUID)
      ) as unknown as Promise<any>;
      itemsPromise = dispatch(
        fetchItems(file.contentModelZUID, { limit: 3 })
      ) as unknown as Promise<any>;
    }

    Promise.all([logsPromise, fieldsPromise, itemsPromise])
      .then(([logsResponse, fieldsResponse, itemsResponse]) => {
        if (logsResponse?.status !== 200) {
          dispatch({
            type: "NOTIFY",
            payload: {
              message: "Unable to load Code file logs",
              kind: "warn",
            },
          });
          setLogs([]);
          return;
        }

        setLogs(
          logsResponse.data
            .sort((a: Log, b: Log) =>
              moment(a.createdAt).unix() > moment(b.createdAt).unix() ? -1 : 1
            )
            .slice(0, 10)
        );

        if (fieldsResponse?.payload) {
          setFields(Object.values(fieldsResponse.payload));
        }
        if (itemsResponse?.data) {
          setItems(itemsResponse.data.slice(0, 3));
        }
      })
      .finally(() => setLoading(false));
  }, [file.ZUID, dispatch]);
  function handleSetOpen() {
    setOpen((prevOpen) => !prevOpen);
  }

  return (
    <Paper
      elevation={0}
      square
      sx={{
        width: "100%",
        bgcolor: "background.editor",
        color: "grey.300",
        flexGrow: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        flexShrink: 1,
        boxSizing: "border-box",
        borderTop: "1px solid",
        borderColor: "grey.800",
        "& *": { boxSizing: "border-box" },
      }}
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
        sx={{ cursor: "pointer" }}
        onClick={handleSetOpen}
        title="Open for additional file information"
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          <Typography variant="body2" noWrap>
            More file information
          </Typography>
        </Stack>
        <Typography variant="body2" color="inherit" pr={1} noWrap>
          {open ? "Close" : "Open"} Drawer {metaShortcut}
        </Typography>
      </Box>
      <Collapse in={open}>
        <Box
          width="100%"
          boxSizing="border-box"
          bgcolor="background.editor"
          color="grey.300"
          height="40vh"
          sx={{ overflowY: "auto" }}
        >
          <WithLoader
            condition={!loading}
            height="100%"
            message="Loading file information"
          >
            <Box
              sx={{
                px: 2,
                columnGap: 2,
                display: "flex",
                flexDirection: "row",
                overflowY: "hidden",
                flexShrink: 0,
                boxSizing: "border-box",
                position: "relative",
                alignItems: "stretch",
                pb: 2,
                minHeight: "100%",
              }}
            >
              <FileStatus file={file} items={items} />
              {file.contentModelZUID && (
                <LinkedSchema file={file} fields={fields} />
              )}
              {file.contentModelZUID && (
                <LinkedContent file={file} items={items} />
              )}
              <AuditTrail logs={logs} />
            </Box>
          </WithLoader>
        </Box>
      </Collapse>
    </Paper>
  );
});

export default BottomDrawer;
