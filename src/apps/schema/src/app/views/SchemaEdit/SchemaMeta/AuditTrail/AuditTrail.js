import { useState } from "react";
import { useHistory } from "react-router-dom";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import styles from "./AuditTrail.less";
export default function AuditTrail(props) {
  let history = useHistory();

  return (
    <aside className={styles.AuditTrail}>
      <Card>
        <CardHeader>Model AuditTrail</CardHeader>
        <CardContent>{/* TODO display 5 latest model edits */}</CardContent>
        <CardActions></CardActions>
      </Card>
    </aside>
  );
}
