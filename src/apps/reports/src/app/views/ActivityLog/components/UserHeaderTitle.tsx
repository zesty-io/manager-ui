import { useMemo } from "react";
import { useParams } from "react-router";
import { Stack, Typography, SvgIcon, Skeleton, Avatar } from "@mui/material";
import { ScheduleRounded, GroupRounded } from "@mui/icons-material";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";

import { CustomBreadcrumbs } from "../../../../../../../shell/components/CustomBreadcrumbs";
import { useGetUsersRolesQuery } from "../../../../../../../shell/services/accounts";
import { MD5 } from "../../../../../../../utility/md5";
import { formatLocalized } from "shell/i18n/dates";

const Crumbs = [
  {
    name: "reports.activityLog",
    path: "/reports/activity-log/resources",
    icon: ScheduleRounded,
  },
  {
    name: "common.users",
    path: "/reports/activity-log/users",
    icon: GroupRounded,
  },
];

type UserHeaderTitleProps = {
  actionCount: number;
  latestActionDateTime: string;
  isLoadingActions: boolean;
};
export const UserHeaderTitle = ({
  actionCount,
  latestActionDateTime,
  isLoadingActions,
}: UserHeaderTitleProps) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { data: usersRoles, isLoading: isLoadingUsersRoles } =
    useGetUsersRolesQuery();

  const headerData = useMemo(() => {
    if (usersRoles) {
      const user = usersRoles?.find((userRole) => userRole.ZUID === id);
      return {
        name: `${user?.firstName} ${user?.lastName}`,
        imageUrl: `https://www.gravatar.com/avatar/${MD5(
          user?.email
        )}.jpg?s=40`,
        subTitle: [
          user?.role?.name,
          t("reports.actionCount", { count: actionCount }),
          t("reports.lastActionAt", {
            time: latestActionDateTime
              ? formatLocalized(new Date(latestActionDateTime), "hh:mm a")
              : "N/A",
          }),
        ],
      };
    }
  }, [usersRoles, actionCount, t]);

  const isLoading = isLoadingUsersRoles || isLoadingActions;

  return (
    <Stack gap={1}>
      <CustomBreadcrumbs
        items={Crumbs.map((crumb) => ({
          node: (
            <Stack direction="row" gap={0.5}>
              <SvgIcon component={crumb.icon} color="action" fontSize="small" />
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                maxWidth={100}
              >
                {t(crumb.name)}
              </Typography>
            </Stack>
          ),
          onClick: () => {
            history.push(crumb.path);
          },
        }))}
      />
      <Stack direction="row" gap={2} alignItems="center">
        {isLoading ? (
          <Skeleton
            variant="circular"
            height={40}
            width={40}
            sx={{ flexShrink: 0 }}
          />
        ) : (
          <Avatar
            alt={t("reports.userAvatar", { name: headerData?.name })}
            src={headerData?.imageUrl}
          />
        )}
        <Stack gap={0.25} width="100%">
          <Typography variant="h3" fontWeight={700} maxWidth={640}>
            {isLoading ? <Skeleton width="100%" /> : headerData?.name}
          </Typography>
          <Stack direction="row" gap={0.25}>
            {isLoading ? (
              <Skeleton width="100%" />
            ) : (
              <Typography variant="caption" color="text.secondary">
                {headerData?.subTitle?.join(" • ")}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
