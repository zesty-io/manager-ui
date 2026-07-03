import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

import styles from "./GetStarted.less";
export function GetStarted(props) {
  const { t } = useTranslation();
  return (
    <section className={styles.GetStarted}>
      <h1 className={styles.display}>{t("common.getStarted")}</h1>
      <h2 className={styles.subheadline} data-cy="leadsGetStartedHeading">
        {t("leads.captureLeadsOnYourInstance")}
      </h2>

      <p className={styles.bodyText}>{t("leads.getStartedBodyText")}</p>
      <p className={styles.bodyText}>
        {t("leads.learnMoreAbout")}{" "}
        <a
          href="https://zesty.org/services/web-engine/guides/how-to-create-a-lead-form#zlf-zesty-leads-form"
          target="_blank"
        >
          {t("leads.howToCreateALeadForm")}
        </a>
      </p>
    </section>
  );
}
