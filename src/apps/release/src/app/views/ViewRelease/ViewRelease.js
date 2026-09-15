import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import cx from "classnames";
import { useTranslation } from "react-i18next";

import { searchItems } from "shell/store/content";
import { fetchVersions } from "shell/store/contentVersions";
import { fetchMembers } from "shell/store/releaseMembers";

import { Header } from "./components/Header";
import { PlanTable } from "./components/PlanTable";
import { WithLoader } from "shell/components/legacy/WithLoader";

import styles from "./ViewRelease.less";
export function ViewRelease({ isContentSubpage }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const params = useParams();

  const [loading, setLoading] = useState(false);

  const release = useSelector((state) =>
    state.releases.data.find((release) => {
      return release.ZUID === params.zuid;
    })
  );

  const members = useSelector(
    (state) => state.releaseMembers.data[params.zuid]
  );

  // load versions for all member ZUIDs
  useEffect(() => {
    // background load if we have release and member data locally
    if (!release || !members) {
      setLoading(true);
    }

    // fetch release members
    dispatch(fetchMembers(params.zuid)).then((membersRes) => {
      if (membersRes.status === 200) {
        const requests = membersRes.data.map((member) => {
          // fetch release member content item
          return dispatch(searchItems(member.resourceZUID)).then(
            (searchRes) => {
              if (searchRes?.status === 200) {
                // fetch content item versions
                // possibly can lazy load these when you open select
                if (!!searchRes.data?.length) {
                  return dispatch(
                    fetchVersions(
                      searchRes.data[0].meta.contentModelZUID,
                      searchRes.data[0].meta.ZUID
                    )
                  );
                }
              }
            }
          );
        });

        Promise.all(requests).finally(() => setLoading(false));
      }
    });
  }, [release, params.zuid]);

  return (
    <WithLoader
      condition={!loading && release && members}
      message={t("release.loadingRelease", { name: release?.name })}
      height="100vh"
    >
      <Header plan={release} isContentSubpage={isContentSubpage} />
      {Array.isArray(members) && members.length ? (
        <PlanTable members={members} />
      ) : (
        <ol className={cx(styles.Instructions, styles.display)}>
          <li>{t("release.instructionBeginSearch")}</li>
          <li>{t("release.instructionSelectItem")}</li>
          <li>{t("release.instructionPublishAll")}</li>
        </ol>
      )}
    </WithLoader>
  );
}
