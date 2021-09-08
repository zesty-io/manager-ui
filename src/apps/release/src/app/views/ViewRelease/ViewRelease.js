import { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import cx from "classnames";

import { fetchVersions } from "shell/store/contentVersions";
import { fetchRelease } from "shell/store/releases";
import { fetchMembers } from "shell/store/releaseMembers";

import { Header } from "./components/Header";
import { PlanTable } from "./components/PlanTable";

import styles from "./ViewRelease.less";
export function ViewRelease() {
  const dispatch = useDispatch();
  const params = useParams();

  const release = useSelector((state) =>
    state.releases.data.find((release) => {
      return release.ZUID === params.zuid;
    })
  );

  const members = useSelector(
    (state) => state.releaseMembers.data[params.zuid]
  );

  // // load versions for all member ZUIDs
  // // possibly can lazy load these when you open select
  // useEffect(() => {
  //     if (!release) {
  //         dispatch(fetchRelease(params.zuid))
  //     } else {
  //         release.members.forEach((member) => {
  //             dispatch(
  //                 fetchVersions(
  //                     content[member.ZUID].meta.contentModelZUID,
  //                     content[member.ZUID].meta.ZUID
  //                 )
  //             );
  //         });
  //     }
  // }, [release, params.zuid]);

  // Load release members
  useEffect(() => {
    dispatch(fetchMembers(params.zuid));
  }, []);

  return (
    <section className={cx(styles.ViewRelease, styles.bodyText)}>
      {/* Todo loader? */}

      {members && (
        <Fragment>
          {/* <Header plan={release} /> */}
          <PlanTable members={members} />
        </Fragment>
      )}

      {/* {members.length ?  : <ol className={styles.display}>
                <li>
                    Begin by searching for content you want to include in this release
                </li>
                <li>Select an item from the search list to add it to this release</li>
                <li>
                    Press the "Publish All" button to publish all the items listed in the
                    release
                </li>
            </ol>} */}
    </section>
  );
}
