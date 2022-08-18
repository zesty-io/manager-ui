import { memo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import cx from "classnames";
import { useMetaKey } from "shell/hooks/useMetaKey";

import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { Drawer, DrawerHandle, DrawerContent } from "@zesty-io/core/Drawer";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { FileStatus } from "./components/FileStatus";
import { LinkedSchema } from "./components/LinkedSchema";
import { LinkedContent } from "./components/LinkedContent";
import { AuditTrail } from "./components/AuditTrail";

import { fetchAuditTrail } from "../../../store/auditTrail";
import { fetchItems } from "shell/store/content";
import { fetchFields } from "shell/store/fields";

import styles from "./FileDrawer.less";
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

        if (logs.status !== 200) throw new Error(`${logs.status}`);

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
        if (items?.data?.slice) {
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
    <Drawer
      className={styles.Drawer}
      position="bottom"
      offset="50px"
      open={open}
    >
      <DrawerHandle className={styles.DrawerHandle} onClick={handleSetOpen}>
        <Button
          variant="contained"
          size="small"
          title="Open for additional file information"
        >
          {open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </Button>

        {open ? null : (
          <span className={styles.bodyText}>More file information</span>
        )}

        <div className={cx(styles.bodyText, styles.DrawerShortcut)}>
          <span>
            {open ? "Close" : "Open"} Drawer {metaShortcut}
          </span>
        </div>
      </DrawerHandle>
      <DrawerContent className={styles.DrawerContent}>
        <WithLoader
          condition={!loading}
          height="100px"
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
      </DrawerContent>
    </Drawer>
  );
});
