import { memo, Fragment } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  Skeleton,
  Stack,
} from "@mui/material";

import { PreviewUrl } from "./PreviewUrl";
import { LiveUrl } from "./LiveUrl";
import { InstantUrl } from "./InstantUrl";

import styles from "./ContentLinks.less";
import { useTranslation } from "react-i18next";

export const ContentLinks = memo(function ContentLinks(props) {
  const { t } = useTranslation();
  return (
    <Fragment>
      <Card
        className={styles.ContentLinks}
        sx={{ mb: 3, backgroundColor: "transparent" }}
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
              textTransform: "uppercase",
            },
          }}
          title={t("content.itemEditLinksTitle")}
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
          {props.isLoadingItem ? (
            <Stack gap={1.5}>
              {[...Array(2)].map((_, index) => (
                <Stack
                  key={index}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Skeleton variant="rounded" width={192} height={20} />
                  <Skeleton variant="rounded" width={60} height={20} />
                </Stack>
              ))}
            </Stack>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </Fragment>
  );
});
