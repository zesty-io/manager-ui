import { memo, Fragment } from "react";
import { useFilePath } from "shell/hooks/useFilePath";
import moment from "moment-timezone";
import cx from "classnames";
import { isEmpty } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faCode } from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { AppLink } from "@zesty-io/core/AppLink";
import { CopyButton } from "@zesty-io/material";

import { usePermission } from "shell/hooks/use-permissions";

import SharedWidgetStyles from "../SharedWidget.less";
import styles from "./QuickView.less";

export const QuickView = memo(function QuickView(props) {
  const isPublished = props.publishing && props.publishing.isPublished;
  const isScheduled = props.scheduling && props.scheduling.isScheduled;

  const codeAccess = usePermission("CODE");
  const codePath = useFilePath(props.modelZUID);

  return (
    <Fragment>
      <Card
        className={styles.QuickView}
        sx={{ mx: 2, mb: 3, mt: 2, backgroundColor: "transparent" }}
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
          title="STATUS"
        ></CardHeader>
        <CardContent
          className={cx(styles.Content, SharedWidgetStyles.CardListSpace)}
          sx={{
            p: 0,
            pt: 2,
            "&:last-child": {
              pb: 0,
            },
          }}
        >
          <Stack gap={1.5}>
            {props.version &&
              props.version !== props.publishing?.version &&
              props.version !== props.scheduling?.version && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "#101828",
                    }}
                  >
                    v{props.version} - {moment(props.updatedAt).fromNow()}
                  </Typography>
                  <Chip
                    label="Draft"
                    color="info"
                    size="small"
                    sx={{ borderRadius: "4px", color: "#fff" }}
                  />
                </Stack>
              )}
            {!isEmpty(props.scheduling) && (
              <Stack direction="row" justifyContent="space-between">
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "#101828",
                  }}
                >
                  v{props.scheduling.version} -{" "}
                  {moment(props.scheduling?.updatedAt).fromNow()}
                </Typography>
                <Chip
                  label="Scheduled"
                  size="small"
                  sx={{ borderRadius: "4px" }}
                />
              </Stack>
            )}
            {!isEmpty(props.publishing) && (
              <Stack direction="row" justifyContent="space-between">
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "#101828",
                  }}
                >
                  v{props.publishing.version} -{" "}
                  {moment(props.publishing?.publishAt).fromNow()}
                </Typography>
                <Chip
                  label="Published"
                  color="success"
                  size="small"
                  sx={{ borderRadius: "4px" }}
                />
              </Stack>
            )}
          </Stack>
        </CardContent>
        {/* <CardActions sx={{ gap: 1, px: 0 }}>
          {codeAccess && (
            <>
              <AppLink
                className={styles.AppLink}
                to={`/schema/${props.modelZUID}`}
              >
                <FontAwesomeIcon icon={faDatabase} />
                &nbsp;Edit Schema
              </AppLink>
              <AppLink className={styles.AppLink} to={codePath}>
                <FontAwesomeIcon icon={faCode} />
                &nbsp;Edit Code
              </AppLink>
            </>
          )}
        </CardActions> */}
      </Card>
    </Fragment>
  );
});
