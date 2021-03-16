import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faLink } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";
import { Url } from "@zesty-io/core/Url";

import styles from "./LinkedSchema.less";
import shared from "../../FileDrawer.less";

export default function LinkedSchema(props) {
  return (
    <Card className={cx(styles.LinkedSchema, shared.DrawerStyles)}>
      <CardHeader>
        <h1>
          <FontAwesomeIcon icon={faDatabase} /> Linked Schema
        </h1>
      </CardHeader>
      <CardContent>
        <p>
          Use the below Parsley syntax to reference this models fields. This
          will dynamically link to the fields content.
          <Url
            className={styles.Link}
            href="https://zesty.org/services/web-engine/introduction-to-parsley"
            target="_blank"
            title="Learn More Parsley Syntax"
          >
            Learn More Parsley Syntax
          </Url>
        </p>

        <ul>
          {props.fields.map(field => (
            <li key={field.ZUID}>
              <span className={styles.ParsleyRef}>
                <span className={styles.Brace}>{"{{"}</span>
                <span className={styles.ModelRef}>this.</span>
                <span className={styles.FieldRef}>{field.name}</span>
                <span className={styles.Brace}>{"}}"}</span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <p>
          <AppLink
            className={styles.Link}
            to={`/schema/${props.file.contentModelZUID}`}
            title="Edit Related Model"
          >
            <FontAwesomeIcon icon={faLink} />
            Edit Linked Schema
          </AppLink>
        </p>
      </CardFooter>
    </Card>
  );
}
