import React, { useState, useEffect } from "react";
import cx from "classnames";
import moment from "moment-timezone";

import { Button } from "@zesty-io/core/Button";
import { AppLink } from "@zesty-io/core/AppLink";
import { Select, Option } from "@zesty-io/core/Select";

import {
  fetchFileVersions,
  updateFileCode,
  saveFile
} from "../../../../../store/files";

import styles from "./DifferActions.less";
export const DifferActions = React.memo(function DifferActions(props) {
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(
    props.publishedVersion ? props.publishedVersion : 0
  );

  function loadVersion() {
    if (selectedVersion === "local") {
      props.dispatch(
        updateFileCode(props.fileZUID, props.status, props.currentCode)
      );
    } else {
      const version = versions.find(v => v.version == Number(selectedVersion));
      props.dispatch(
        updateFileCode(props.fileZUID, props.status, version.code)
      );
    }

    window.location = `/#!/code/file/views/${props.fileZUID}`;
  }

  function resolveSync() {
    setSaving(true);

    if (selectedVersion === "local") {
      props.dispatch(
        updateFileCode(props.fileZUID, props.status, props.currentCode)
      );
    } else {
      const version = versions.find(v => v.version == selectedVersion);
      props.dispatch(
        updateFileCode(props.fileZUID, props.status, version.code)
      );
    }

    props
      .dispatch(saveFile(props.fileZUID, props.status))
      .then(() => {
        window.location = `/#!/code/file/views/${props.fileZUID}`;
      })
      .finally(() => {
        setSaving(false);
      });
  }

  useEffect(() => {
    props.setLoading(true);
    props
      .dispatch(fetchFileVersions(props.fileZUID, props.fileType))
      .then(res => {
        props.setLoading(false);

        let versions = res.data
          .filter(v => v.status === props.status)
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
          status: props.status
        });

        setVersions(versions);

        if (Array.isArray(res.data) && res.data.length) {
          if (props.publishedVersion) {
            let published = res.data.find(
              f => f.version === props.publishedVersion
            );
            setSelectedVersion(published.version);
            props.setVersionCodeRight(published.code);
          } else {
            setSelectedVersion(res.data[0].version);
            props.setVersionCodeRight(res.data[0].code);
          }
        }
      })
      .catch(err => {
        props.setLoading(false);
        console.error(err);
      });
  }, []);

  const options = versions.map(version => {
    let html = `Version ${version.version} <small>[${moment(
      version.createdAt
    ).format("MMM Do YYYY, [at] h:mm a")}]</small>`;

    if (version.version == props.publishedVersion) {
      html = "<strong>(Live)</strong> " + html;
    }

    return {
      html,
      value: version.version
    };
  });

  return (
    <div className={styles.DifferActions}>
      <Select
        name="codeOne"
        className={styles.VersionSelector}
        value={options[0] && options[0].value}
        onSelect={value => {
          const version = versions.find(version => version.version == value);
          if (version) {
            props.setVersionCodeLeft(version.code);
          } else {
            console.log(`Missing selected version, ${version}`);
          }
        }}
      >
        {options.map((el, i) => (
          <Option key={i} html={el.html} value={el.value} />
        ))}
      </Select>

      <i className={cx(styles.Divider, "fas fa-arrow-right")}></i>

      <Select
        name="codeTwo"
        className={styles.VersionSelector}
        value={selectedVersion}
        onSelect={value => {
          const version = versions.find(version => version.version == value);
          if (version) {
            props.setVersionCodeRight(version.code);
            setSelectedVersion(version.version);
          } else {
            console.log(`Missing selected version, ${version}`);
            // TODO fetch selected version from API?
          }
        }}
      >
        {options.map((el, i) => (
          <Option key={i} html={el.html} value={el.value} />
        ))}
      </Select>

      {props.synced ? (
        <>
          <Button onClick={loadVersion} kind="save">
            <i className="fas fa-history"></i>Load Version {selectedVersion}
          </Button>
          <AppLink to={`/code/file/${props.fileType}/${props.fileZUID}`}>
            <Button>
              <i className="fas fa-ban"></i> Cancel
            </Button>
          </AppLink>
        </>
      ) : (
        <>
          <Button onClick={resolveSync} kind="alt" disabled={saving}>
            {saving ? (
              <i className="fas fa-spinner"></i>
            ) : (
              <i className="fas fa-save"></i>
            )}
            Save Version {selectedVersion}
          </Button>
        </>
      )}
    </div>
  );
});
