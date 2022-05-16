import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faEdit,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";

import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { fetchReleases } from "shell/store/releases";
import { createMember } from "shell/store/releaseMembers";

import styles from "./Release.less";
export const Release = memo(function Release(props) {
  const dispatch = useDispatch();
  const releases = useSelector((state) => state.releases.data);

  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [active, setActive] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState("0");

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

  return (
    <Card className={styles.Release}>
      <CardHeader>
        <AppLink to="/release">
          <FontAwesomeIcon icon={faRocket} /> Releases
        </AppLink>
      </CardHeader>
      <CardContent>
        <WithLoader condition={!loading}>
          {active ? (
            <React.Fragment>
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
                variant="contained"
                className={styles.Add}
                onClick={onAdd}
                disabled={selectedRelease === "0" || addingMember}
                startIcon={
                  addingMember ? <CircularProgress size="20px" /> : <AddIcon />
                }
              >
                Add
              </Button>
            </React.Fragment>
          ) : (
            <AppLink to={`/release/activate`}>
              <FontAwesomeIcon icon={faPowerOff} />
              &nbsp;Activate Releases
            </AppLink>
          )}
        </WithLoader>
      </CardContent>
    </Card>
  );
});
