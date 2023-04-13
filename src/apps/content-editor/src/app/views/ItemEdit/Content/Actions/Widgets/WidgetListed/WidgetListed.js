import { memo } from "react";

import Stack from "@mui/material/Stack";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import FormLabel from "@mui/material/FormLabel";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CodeIcon from "@mui/icons-material/Code";
import { FieldTypeSort } from "@zesty-io/material";

import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import styles from "./WidgetListed.less";
export const WidgetListed = memo(function WidgetListed(props) {
  const toggleHandler = (value) => {
    if (value === null) return;
    props.dispatch({
      type: "SET_ITEM_META",
      itemZUID: props.itemZUID,
      key: "listed",
      value: value,
    });
  };
  return (
    <Card
      className={styles.WidgetListed}
      sx={{ mx: 2, mb: 3, backgroundColor: "transparent" }}
      elevation={0}
    >
      <CardHeader
        sx={{
          p: 0,
          backgroundColor: "transparent",
          fontSize: "16px",
          color: "#10182866",
          borderBottom: 1,
          borderColor: "grey.200",
        }}
        titleTypographyProps={{
          sx: {
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "32px",
            color: "#101828",
          },
        }}
        title="PARSLEY BEHAVIORS"
      ></CardHeader>
      <CardContent
        sx={{
          p: 0,
          pt: 2,
          "&:last-child": {
            pb: 0,
          },
        }}
      >
        <FormLabel sx={{ color: "text.primary" }}>
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
            &nbsp;Available in Loops
          </Stack>
        </FormLabel>
        <ToggleButtonGroup
          color="secondary"
          size="small"
          value={props.listed}
          exclusive
          onChange={(evt, value) => toggleHandler(value)}
          sx={{ mb: 1 }}
        >
          <ToggleButton value={false}>No </ToggleButton>
          <ToggleButton value={true}>Yes </ToggleButton>
        </ToggleButtonGroup>

        <FieldTypeSort
          sx={{ maxWidth: "200px" }}
          name="sort"
          label={
            <span style={{ color: "#101828" }}>
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
          value={props.sort ? props.sort.toString() : "0"}
          onChange={(evt) => {
            props.dispatch({
              type: "SET_ITEM_META",
              itemZUID: props.itemZUID,
              key: "sort",
              value: parseInt(evt.target.value),
            });
          }}
        />
      </CardContent>
    </Card>
  );
});
