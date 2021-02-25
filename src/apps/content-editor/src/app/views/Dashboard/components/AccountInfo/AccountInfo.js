import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";

import styles from "./AccountInfo.less";

export function AccountInfo() {
  return (
    <div className={styles.AccountInfo}>
      <Card>
        <CardHeader>Account Info</CardHeader>
        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. cupidatat
          non proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </CardContent>
        <CardFooter>this is the card footer</CardFooter>
      </Card>
    </div>
  );
}
