import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useHistory } from "react-router";
import { Select, Button, MenuItem, Box, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import SaveIcon from "@mui/icons-material/Save";
import EastIcon from "@mui/icons-material/East";
import { format, isValid } from "date-fns";

import {
  fetchFileVersions,
  saveFile,
  updateFileCode,
} from "../../../store/files";
import { useDispatch } from "react-redux";

interface DifferActionsProps {
  fileZUID: string;
  fileType: string;
  publishedVersion?: string | "local";
  status: string;
  synced: boolean;
  code: string;
  version: string;
  setVersionCodeLeft: (code: string) => void;
  setVersionCodeRight: (code: string) => void;
  setLoading: (loading: boolean) => void;
  isLoading?: boolean;
}

interface FileVersion {
  code: string;
  version: number | "local";
  status: string;
  createdAt: string;
}

export const DifferActions = memo(function DifferActions(
  props: DifferActionsProps
) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | "local">(
    props.publishedVersion ? props.publishedVersion : "0"
  );

  const dispatch = useDispatch();
  const history = useHistory();

  const loadVersion = () => {
    if (selectedVersion === "local") {
      dispatch(updateFileCode(props.fileZUID, props.status, props.code));
    } else {
      const version = versions.find(
        (v) => v.version === Number(selectedVersion)
      );
      if (version) {
        dispatch(updateFileCode(props.fileZUID, props.status, version.code));
      }
    }

    history.push(`/code/file/${props.fileType}/${props.fileZUID}`);
  };

  const resolveSync = () => {
    setSaving(true);

    if (selectedVersion === "local") {
      dispatch(updateFileCode(props.fileZUID, props.status, props.code));
    } else {
      const version = versions.find((v) => v.version === selectedVersion);
      if (version) {
        dispatch(updateFileCode(props.fileZUID, props.status, version.code));
      }
    }

    Promise.resolve(dispatch(saveFile(props.fileZUID, props.status)))
      .then(() => {
        history.push(`/code/file/views/${props.fileZUID}`);
      })
      .finally(() => {
        setSaving(false);
      });
  };
  useEffect(() => {
    props.setLoading(true);
    Promise.resolve(dispatch(fetchFileVersions(props.fileZUID, props.fileType)))
      .then((res: any) => {
        props.setLoading(false);

        let versions = res.data
          .filter((v: { status: string }) => v.status === props.status)
          .sort(
            (a: { createdAt: string }, b: { createdAt: string }): number => {
              const da = new Date(a.createdAt);
              const db = new Date(b.createdAt);
              const ta = isValid(da) ? da.getTime() : 0;
              const tb = isValid(db) ? db.getTime() : 0;
              return tb - ta; // newest first
            }
          );
        versions.unshift({
          code: props.code,
          version: "local",
          status: props.status,
          createdAt: new Date().toISOString(),
        });

        setVersions(versions);

        if (Array.isArray(res.data) && res.data.length) {
          if (props.publishedVersion) {
            let published = res.data.find(
              (f: { version: string | number }) =>
                f.version === props.publishedVersion
            );
            if (published) {
              setSelectedVersion(published.version);
              props.setVersionCodeRight(published.code);
            }
          } else {
            setSelectedVersion(res.data[0].version);
            props.setVersionCodeRight(res.data[0].code);
          }
        }
      })
      .catch((err: Error) => {
        props.setLoading(false);
        console.error(err);
      });
  }, [
    props.fileZUID,
    props.fileType,
    props.status,
    props.code,
    props.publishedVersion,
    props.setLoading,
    props.setVersionCodeRight,
  ]);

  const options = versions.map((version) => {
    const d = new Date(version.createdAt);
    const pretty = isValid(d)
      ? format(d, "MMM do yyyy, 'at' h:mm a")
      : version.createdAt;
    let html = (
      <Box display="flex" alignItems="center" columnGap={0.5}>
        {version.version === props.publishedVersion ? (
          <Typography variant="body2" component="span" fontWeight={700}>
            (Live)
          </Typography>
        ) : (
          ""
        )}
        <Typography variant="body2" component="span">
          {`Version ${version.version}`}
        </Typography>
        <Typography variant="caption" component="span">
          [{pretty}]
        </Typography>
      </Box>
    );

    return {
      html,
      value: version.version,
    };
  });

  return (
    <>
      {!props.isLoading && (
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
                  (version) => version.version === evt.target.value
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
                  (version) => version.version === evt.target.value
                );
                if (version) {
                  props.setVersionCodeRight(version.code);
                  setSelectedVersion(String(version.version));
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
                variant="contained"
                color="success"
                size="small"
                onClick={loadVersion}
                startIcon={<HistoryIcon />}
                sx={{ ml: 1, minWidth: "fit-content" }}
              >
                Load Version
              </Button>
              <Button
                variant="text"
                color="inherit"
                size="small"
                sx={{ ml: 1, color: "grey.400" }}
                onClick={() =>
                  history.push(`/code/file/${props.fileType}/${props.fileZUID}`)
                }
              >
                {t("common.cancel")}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              loadingPosition="start"
              size="small"
              onClick={resolveSync}
              disabled={saving}
              sx={{ ml: 1 }}
              startIcon={<SaveIcon />}
            >
              Save Version
            </Button>
          )}
        </Box>
      )}
    </>
  );
});
