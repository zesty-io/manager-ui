import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

import { AppLink } from "shell/components/AppLink";

import { formatLocalized } from "shell/i18n/dates";

export function Release(props) {
  const { t } = useTranslation();
  const members = useSelector((state) => state.releaseMembers.data);
  const createdDate =
    props.release.createdAt && new Date(props.release.createdAt);

  return (
    <Box
      component="tr"
      data-cy="releaseRow"
      sx={(theme) => ({
        alignItems: "center",
        bgcolor: "common.white",
        borderLeft: `4px solid ${theme.palette.common.white}`,
        "&:nth-of-type(odd)": {
          bgcolor: "grey.50",
          borderLeft: `4px solid ${theme.palette.grey[50]}`,
        },
        "&:hover, &:focus, &:active, &:nth-of-type(odd):hover, &:nth-of-type(odd):focus, &:nth-of-type(odd):active":
          {
            bgcolor: "grey.100",
            borderLeft: `4px solid ${theme.palette.grey[100]}`,
          },
        "& td": {
          textAlign: "left",
        },
        "& td:nth-child(4)": {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      })}
    >
      <td>
        <AppLink
          to={
            props.isContentSubpage
              ? `/content/releases/${props.release.ZUID}`
              : `/release/${props.release.ZUID}`
          }
        >
          {props.release.name}
        </AppLink>
      </td>
      <td>
        {createdDate &&
          t("release.createdOn", {
            time: formatLocalized(createdDate, "hh:mm a"),
            date: formatLocalized(createdDate, "MMMM do, yyyy XXX"),
          })}
      </td>
      <td>{members[props.release.ZUID]?.length}</td>
      <td>{props.release.description}</td>
    </Box>
  );
}
