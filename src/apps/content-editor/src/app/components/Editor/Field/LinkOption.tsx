import { memo } from "react";
import { useTranslation } from "react-i18next";
import { AppLink } from "shell/components/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

type LinkOptionProps = { modelZUID: string; itemZUID: string };
export const LinkOption = memo(({ modelZUID, itemZUID }: LinkOptionProps) => {
  const { t } = useTranslation("content");

  return (
    <>
      <FontAwesomeIcon icon={faExclamationTriangle} />
      &nbsp;
      <AppLink to={`/content/${modelZUID}/${itemZUID}`}>{itemZUID}</AppLink>
      <strong>&nbsp;{t("content.missingMetaTitle")}</strong>
    </>
  );
});
