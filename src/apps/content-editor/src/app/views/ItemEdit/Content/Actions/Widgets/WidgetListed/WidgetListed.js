import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { FieldTypeSort } from "@zesty-io/core/FieldTypeSort";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
import { Infotip } from "@zesty-io/core/Infotip";

import styles from "./WidgetListed.less";
export const WidgetListed = React.memo(function WidgetListed(props) {
  return (
    <Card className={styles.WidgetListed}>
      <CardHeader>
        <span>
          <FontAwesomeIcon icon={faCode} />
          &nbsp;Parsley Behaviors
        </span>
      </CardHeader>
      <CardContent>
        <FieldTypeBinary
          name="listed"
          label={
            <span>
              <Infotip title="Determines if this item will be available in Parsley loops. A common example of this is listing a blog post as an entry on an article listing page." />
              &nbsp;Available in Loops
            </span>
          }
          value={Number(props.listed)}
          offValue="No"
          onValue="Yes"
          onChange={() => {
            props.dispatch({
              type: "SET_ITEM_META",
              itemZUID: props.itemZUID,
              key: "listed",
              value: !props.listed, // flip and emit boolean value
            });
          }}
        />

        <FieldTypeSort
          name="sort"
          label={
            <span>
              <Infotip title="Automated Navigation Order controls the output of the automated parsley {{navigation}} and {{sectionlinks}}. It can also be used in an each loop like: {{each items as items sort by z.sort}} calls." />
              &nbsp;Automated Navigation Order
            </span>
          }
          value={props.sort}
          onChange={(value, name) => {
            props.dispatch({
              type: "SET_ITEM_META",
              itemZUID: props.itemZUID,
              key: name,
              value: value,
            });
          }}
        />
      </CardContent>
    </Card>
  );
});
