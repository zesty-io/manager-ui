import { memo } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

import Stack from "@mui/material/Stack";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import FormLabel from "@mui/material/FormLabel";

import Box from "@mui/material/Box";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { FieldTypeSort } from "@zesty-io/core/FieldTypeSort";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import styles from "./WidgetListed.less";
export const WidgetListed = memo(function WidgetListed(props) {
  return (
    <Card className={styles.WidgetListed}>
      <CardHeader>
        <span>
          <FontAwesomeIcon icon={faCode} />
          &nbsp;Parsley Behaviors
        </span>
      </CardHeader>
      <CardContent>
        <FormLabel sx={{ color: "primary.dark" }}>
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              mb: 1,
            }}
          >
            <Tooltip
              title="Determines if this item will be available in Parsley loops. A common example of this is listing a blog post as an entry on an article listing page."
              arrow
              placement="top-start"
            >
              <InfoIcon fontSize="small" />
            </Tooltip>
            Available in Loops
          </Stack>
        </FormLabel>
        <ToggleButtonGroup
          color="secondary"
          size="small"
          value={props.listed}
          exclusive
          onChange={(e, val) => {
            if (val !== null) {
              props.dispatch({
                type: "SET_ITEM_META",
                itemZUID: props.itemZUID,
                key: "listed",
                value: val,
              });
            }
          }}
          sx={{ mb: 1 }}
        >
          <ToggleButton value={false}>No </ToggleButton>
          <ToggleButton value={true}>Yes </ToggleButton>
        </ToggleButtonGroup>

        <FieldTypeSort
          name="sort"
          label={
            <span>
              <Tooltip
                title="Automated Navigation Order controls the output of the automated parsley {{navigation}} and {{sectionlinks}}. It can also be used in an each loop like: {{each items as items sort by z.sort}} calls."
                arrow
                placement="top-start"
              >
                <InfoIcon fontSize="small" />
              </Tooltip>
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
