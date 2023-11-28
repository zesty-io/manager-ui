import { memo } from "react";
import { AppLink } from "@zesty-io/core/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

type LinkOptionProps = { modelZUID: string; itemZUID: string };
export const LinkOption = memo(({ modelZUID, itemZUID }: LinkOptionProps) => {
  return (
    <>
      <FontAwesomeIcon icon={faExclamationTriangle} />
      &nbsp;
      <AppLink to={`/content/${modelZUID}/${itemZUID}`}>{itemZUID}</AppLink>
      <strong>&nbsp;is missing a meta title</strong>
    </>
  );
});
