import { Component } from "react";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import AddchartIcon from "@mui/icons-material/Addchart";

export class ContentVelocity extends Component {
  render() {
    return (
      <Card sx={{ m: 2 }}>
        <CardHeader
          avatar={<AddchartIcon fontSize="small" />}
          title="Content Velocity"
        ></CardHeader>
        <CardContent>
          <table>
            <tr>
              <td>Published Last 7 date</td>
              <td />
            </tr>
            <tr>
              <td>Published Last 30 date</td>
              <td />
            </tr>
            <tr>
              <td>Total Pageviews</td>
              <td />
            </tr>
          </table>
        </CardContent>
      </Card>
    );
  }
}
