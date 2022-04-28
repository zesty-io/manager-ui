import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import isEqual from "lodash/isEqual";
import flatten from "lodash/flatten";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faRocket,
  faEdit,
  faPowerOff,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { Button } from "@zesty-io/core/Button";
import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { fetchReleases } from "shell/store/releases";
import { createMember, fetchMembers } from "shell/store/releaseMembers";

import styles from "./Release.less";
export const Release = memo(function Release(props) {
  const dispatch = useDispatch();
  const releases = useSelector((state) => state.releases.data);
  console.log("🚀 ~ file: Release.js ~ line 26 ~ Release ~ releases", releases);

  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [active, setActive] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState("0");
  const [releaseName, setReleaseName] = useState([]);

  const onAdd = () => {
    setAddingMember(true);
    dispatch(
      createMember(selectedRelease, {
        resourceZUID: props.item.meta.ZUID,
        version: props.item.meta.version,
      })
    ).finally(() => {
      setAddingMember(false);
    });
  };

  useEffect(() => {
    setLoading(true);

    dispatch(fetchReleases())
      .then((res) => {
        if (!res.data?.length) {
          if (res.status === 412) {
            setActive(false);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const request = releases.map((release) => {
      return dispatch(fetchMembers(release.ZUID));
    });

    Promise.all(request).then((res) => {
      let test = res.map((x) =>
        x.data.filter((zuid) => zuid.resourceZUID === props.item.meta.ZUID)
      );

      console.log(
        "🚀 ~ file: Release.js ~ line 72 ~ Promise.all ~ test",
        flatten(test)
      );

      let result = flatten(test).map((x) =>
        releases.find((y) => y.ZUID === x.releaseZUID)
      );

      console.log("🚀 ~ file: Release.js  ~ result", result);
      setReleaseName(result);
    });
  }, [releases]);

  return (
    <Card className={styles.Release}>
      <CardHeader>
        <AppLink to="/release">
          <FontAwesomeIcon icon={faRocket} /> Releases
        </AppLink>
      </CardHeader>
      <CardContent className={styles.CardContent}>
        <WithLoader condition={!loading}>
          {active ? (
            <section className={styles.ReleaseWrap}>
              <FieldTypeDropDown
                name="release"
                label="Queue item for release"
                className={styles.SelectRelease}
                value={selectedRelease}
                onChange={setSelectedRelease}
                options={releases.map((release) => {
                  return {
                    value: release.ZUID,
                    component: (
                      <span>
                        <span onClick={(evt) => evt.stopPropagation()}>
                          <AppLink to={`/release/${release.ZUID}`}>
                            <FontAwesomeIcon icon={faEdit} />
                          </AppLink>
                        </span>
                        &nbsp;{release.name}
                      </span>
                    ),
                  };
                })}
              />
              <Button
                className={styles.Add}
                onClick={onAdd}
                disabled={selectedRelease === "0" || addingMember}
              >
                {addingMember ? (
                  <FontAwesomeIcon icon={faSpinner} />
                ) : (
                  <FontAwesomeIcon icon={faPlus} />
                )}
                Add
              </Button>
            </section>
          ) : (
            <AppLink to={`/release/activate`}>
              <FontAwesomeIcon icon={faPowerOff} />
              &nbsp;Activate Releases
            </AppLink>
          )}
        </WithLoader>

        <ul className={styles.VersionRelease}>
          {/* `Homepage`` Version `177` is in Release: `HABIBI` */}
          {`${props.item.web.metaTitle} Version ${props.item.web.version} is in Release : `}
          {releaseName.map((item) => {
            return <li>{item.name}</li>;
          })}
        </ul>
      </CardContent>
    </Card>
  );
});
