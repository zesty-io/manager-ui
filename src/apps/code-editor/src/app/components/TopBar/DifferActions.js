import { memo, useState, useEffect } from "react";
import moment from "moment-timezone";
import { useHistory } from "react-router";
import { Select, Button, MenuItem, Box } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import EastIcon from "@mui/icons-material/East";

import {
  fetchFileVersions,
  saveFile,
  updateFileCode,
} from "../../../store/files";

export const DifferActions = memo(function DifferActions(props) {
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(
    props.publishedVersion ? props.publishedVersion : 0
  );
  const history = useHistory();

  function loadVersion() {
    if (selectedVersion === "local") {
      props.dispatch(
        updateFileCode(props.fileZUID, props.status, props.currentCode)
      );
    } else {
      const version = versions.find(
        (v) => v.version == Number(selectedVersion)
      );
      props.dispatch(
        updateFileCode(props.fileZUID, props.status, version.code)
      );
    }

    history.push(`/code/file/${props.fileType}/${props.fileZUID}`);
  }

  function resolveSync() {
    setSaving(true);

    if (selectedVersion === "local") {
      props.dispatch(
        updateFileCode(props.fileZUID, props.status, props.currentCode)
      );
    } else {
      const version = versions.find((v) => v.version == selectedVersion);
      props.dispatch(
        updateFileCode(props.fileZUID, props.status, version.code)
      );
    }

    props
      .dispatch(saveFile(props.fileZUID, props.status))
      .then(() => {
        history.push(`/code/file/views/${props.fileZUID}`);
      })
      .finally(() => {
        setSaving(false);
      });
  }

  useEffect(() => {
    props.setLoading(true);
    props
      .dispatch(fetchFileVersions(props.fileZUID, props.fileType))
      .then((res) => {
        props.setLoading(false);

        let versions = res.data
          .filter((v) => v.status === props.status)
          .sort((a, b) => {
            let timeA = moment(a.createdAt).valueOf();
            let timeB = moment(b.createdAt).valueOf();

            if (timeA > timeB) {
              return -1;
            }
            if (timeA < timeB) {
              return 1;
            }

            // names must be equal
            return 0;
          });
        versions.unshift({
          code: props.currentCode,
          version: "local",
          status: props.status,
        });

        setVersions(versions);

        if (Array.isArray(res.data) && res.data.length) {
          if (props.publishedVersion) {
            let published = res.data.find(
              (f) => f.version === props.publishedVersion
            );
            setSelectedVersion(published.version);
            props.setVersionCodeRight(published.code);
          } else {
            setSelectedVersion(res.data[0].version);
            props.setVersionCodeRight(res.data[0].code);
          }
        }
      })
      .catch((err) => {
        props.setLoading(false);
        console.error(err);
      });
  }, []);

  const options = versions.map((version) => {
    let html = (
      <span>
        Version {version.version}{" "}
        <small>
          [{moment(version.createdAt).format("MMM Do YYYY, [at] h:mm a")}]
        </small>
      </span>
    );

    if (version.version == props.publishedVersion) {
      html = (
        <>
          <strong>(Live)</strong> {html}
        </>
      );
    }

    return {
      html,
      value: version.version,
    };
  });

  return (
    <Box
      display="flex"
      alignItems="center"
      columnGap={1}
      color="grey.300"
      pl={2}
    >
      <Box
        display="flex"
        alignItems="center"
        columnGap={1}
        sx={{
          "& .MuiInputBase-root": {
            border: "1px solid",
            borderColor: "grey.700",
            borderRadius: "6px",
            "& .MuiSelect-select": {
              p: "6px 8px",
            },
          },
        }}
      >
        <Select
          id="codeOne"
          name="codeOne"
          defaultValue="local"
          size="small"
          onChange={(evt) => {
            const version = versions.find(
              (version) => version.version == evt.target.value
            );
            if (version) {
              props.setVersionCodeLeft(version.code);
            } else {
              console.log(`Missing selected version, ${version}`);
            }
          }}
          sx={{ width: 300 }}
          MenuProps={{
            MenuListProps: {
              sx: (theme) => ({
                ...theme.typography.body2,
              }),
            },
          }}
        >
          {options.map((el, i) => (
            <MenuItem key={i} value={el.value}>
              {el.html}
            </MenuItem>
          ))}
        </Select>

        <EastIcon fontSize="small" />

        <Select
          id="codeTwo"
          name="codeTwo"
          value={selectedVersion}
          size="small"
          onChange={(evt) => {
            const version = versions.find(
              (version) => version.version == evt.target.value
            );
            if (version) {
              props.setVersionCodeRight(version.code);
              setSelectedVersion(version.version);
            }
          }}
          sx={{ width: 300 }}
        >
          {options.map((el, i) => (
            <MenuItem key={i} value={el.value}>
              {el.html}
            </MenuItem>
          ))}
        </Select>
      </Box>
      {props.synced ? (
        <>
          <Button
            variant="text"
            color="secondary"
            size="small"
            sx={{ ml: 1 }}
            onClick={() =>
              history.push(`/code/file/${props.fileType}/${props.fileZUID}`)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={loadVersion}
            startIcon={<HistoryIcon />}
            sx={{ ml: 1, minWidth: "fit-content" }}
          >
            Load Version
          </Button>
        </>
      ) : (
        <LoadingButton
          variant="contained"
          loadingPosition="start"
          size="small"
          onClick={resolveSync}
          disabled={saving}
          sx={{ ml: 1 }}
          startIcon={<SaveIcon />}
        >
          Save Version
        </LoadingButton>
      )}
    </Box>
  );
});
