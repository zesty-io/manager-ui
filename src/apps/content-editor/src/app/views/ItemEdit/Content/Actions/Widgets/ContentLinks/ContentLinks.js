import { memo, Fragment } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import LinkIcon from "@mui/icons-material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

import { PreviewUrl } from "../../../../components/Header/PreviewUrl";
import { LiveUrl } from "../../../../components/Header/LiveUrl";
import { InstantUrl } from "./InstantUrl";

import styles from "./ContentLinks.less";

export const ContentLinks = memo(function ContentLinks(props) {
  return (
    <Fragment>
      <Card
        className={styles.ContentLinks}
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
          title="LINKS"
        ></CardHeader>
        <CardContent
          className={styles.Content}
          sx={{
            p: 0,
            pt: 2,
            "&:last-child": {
              pb: 0,
            },
          }}
        >
          <List>
            {props.item?.web?.path && (
              <Fragment>
                <ListItem
                  sx={{
                    fontSize: "14px",
                    p: 0,
                    m: 0,
                  }}
                >
                  <LiveUrl item={props.item} />
                </ListItem>
                <ListItem
                  sx={{
                    fontSize: "14px",
                    p: 0,
                    m: 0,
                  }}
                >
                  <PreviewUrl item={props.item} />
                </ListItem>
              </Fragment>
            )}

            <InstantUrl item={props.item} />
          </List>
        </CardContent>
      </Card>
    </Fragment>
  );
});
