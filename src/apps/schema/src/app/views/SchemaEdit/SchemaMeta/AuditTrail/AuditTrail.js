import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./AuditTrail.less";
export default function AuditTrail(props) {
  const navigate = useNavigate();

  return (
    <aside className={styles.AuditTrail}>
      <Card>
        <CardHeader>Model AuditTrail</CardHeader>
        <CardContent>{/* TODO display 5 latest model edits */}</CardContent>
        <CardFooter></CardFooter>
      </Card>
    </aside>
  );
}
