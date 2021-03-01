import React from "react";
import { request } from "utility/request";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faEye,
  faUser,
  faUsers,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import styles from "./ChartDashboard.less";

export function ChartDashboard() {
  return (
    <div className={styles.ChartDashboard}>
      <Card>
        <CardHeader>Editing Trend Last 30days Coming Soon</CardHeader>
        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed cupidatat
          non proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </CardContent>
      </Card>
    </div>
  );
}
