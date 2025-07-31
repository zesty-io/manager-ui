import { memo, useState, useEffect } from "react";

import moment from "moment-timezone";
import { useHistory } from "react-router";

import { Select, Button, MenuItem, Box, FormControl } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import SaveIcon from "@mui/icons-material/Save";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { AppLink } from "@zesty-io/core/AppLink";

import {
  fetchFileVersions,
  updateFileCode,
  saveFile,
} from "../../../../../store/files";

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
    <Box display="flex" alignItems="center" columnGap={1}>
      <FormControl size="small">
        <Select
          name="codeOne"
          defaultValue="local"
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
          sx={{
            py: 0,
            "& .MuiSelect-select": {
              py: "7px",
            },
          }}
        >
          {options.map((el, i) => (
            <MenuItem key={i} value={el.value}>
              {el.html}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FontAwesomeIcon icon={faArrowRight} />
      <FormControl size="small">
        <Select
          name="codeTwo"
          value={selectedVersion}
          onChange={(evt) => {
            const version = versions.find(
              (version) => version.version == evt.target.value
            );
            if (version) {
              props.setVersionCodeRight(version.code);
              setSelectedVersion(version.version);
            } else {
              console.log(`Missing selected version, ${version}`);
              // TODO fetch selected version from API?
            }
          }}
          sx={{
            py: 0,
            "& .MuiSelect-select": {
              py: "7px",
            },
          }}
        >
          {options.map((el, i) => (
            <MenuItem key={i} value={el.value}>
              {el.html}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {props.synced ? (
        <>
          <Button
            variant="contained"
            color="success"
            onClick={loadVersion}
            startIcon={<HistoryIcon fontSize="small" />}
            size="small"
            sx={{ minWidth: "fit-content" }}
          >
            Load Version&nbsp;
            {selectedVersion}
          </Button>
          <AppLink to={`/code/file/${props.fileType}/${props.fileZUID}`}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DoDisturbAltIcon fontSize="small" />}
            >
              Cancel
            </Button>
          </AppLink>
        </>
      ) : (
        <>
          <Button
            variant="contained"
            loadingPosition="start"
            onClick={resolveSync}
            disabled={saving}
            sx={{ ml: 1 }}
            size="small"
            startIcon={<SaveIcon fontSize="small" />}
          >
            Save Version {selectedVersion}
          </Button>
        </>
      )}
    </Box>
  );
});
