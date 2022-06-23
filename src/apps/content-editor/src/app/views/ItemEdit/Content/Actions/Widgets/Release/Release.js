import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import flatten from "lodash/flatten";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faEdit,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { FormControl, FormLabel } from "@mui/material";
import { VirtualizedAutocomplete } from "@zesty-io/material";

import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { fetchReleases } from "shell/store/releases";
import { createMember, fetchMembers } from "shell/store/releaseMembers";

import styles from "./Release.less";

export const Release = memo(function Release(props) {
  const dispatch = useDispatch();
  const releases = useSelector((state) => state.releases.data);

  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [active, setActive] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [releaseInfo, setReleaseInfo] = useState([]);

  const onAdd = () => {
    setAddingMember(true);
    dispatch(
      createMember(selectedRelease.value, {
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
      let members = res.map((x) =>
        x.data.filter((zuid) => zuid.resourceZUID === props.item.meta.ZUID)
      );

      let result = flatten(members).map((x) => {
        return {
          ...releases.find((y) => y.ZUID === x.releaseZUID),
          version: x.version,
        };
      });

      setReleaseInfo(result);
    });
  }, [releases, addingMember]);

  const releaseOptions = useMemo(() => {
    return releases.map((release) => {
      return {
        inputLabel: release.ZUID,
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
    });
  }, [releases]);

  return (
    <Card className={styles.Release} sx={{ m: 2 }}>
      <CardHeader
        avatar={<RocketLaunchIcon fontSize="small" />}
        title={<AppLink to="/release">Releases</AppLink>}
      ></CardHeader>
      <CardContent className={styles.CardContent}>
        <WithLoader condition={!loading}>
          {active ? (
            <section>
              <FormControl fullWidth>
                <FormLabel>Queue item for release</FormLabel>
                <VirtualizedAutocomplete
                  name="release"
                  value={selectedRelease}
                  onChange={(_, option) => {
                    delete option.component;
                    setSelectedRelease(option);
                  }}
                  placeholder="Select release..."
                  options={releaseOptions}
                  startAdornment={
                    selectedRelease && (
                      <AppLink to={`/release/${selectedRelease.ZUID}`}>
                        <FontAwesomeIcon icon={faEdit} />
                      </AppLink>
                    )
                  }
                />
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                className={styles.Add}
                onClick={onAdd}
                disabled={!selectedRelease || addingMember}
                startIcon={
                  addingMember ? <CircularProgress size="20px" /> : <AddIcon />
                }
              >
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
          {releaseInfo.map((item, i) => {
            return (
              <li key={i}>
                <AppLink to={`/release/${item.ZUID}`}>{item.name}:</AppLink>
                <span>&nbsp;Version{item.version}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
});
