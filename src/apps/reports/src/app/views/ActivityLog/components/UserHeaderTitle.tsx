import { useMemo } from "react";
import { useParams } from "react-router";
import { Stack, Typography, SvgIcon, Skeleton, Avatar } from "@mui/material";
import { ScheduleRounded, GroupRounded } from "@mui/icons-material";
import { useHistory } from "react-router";
import moment from "moment";

import { CustomBreadcrumbs } from "../../../../../../../shell/components/CustomBreadcrumbs";
import { useGetUsersRolesQuery } from "../../../../../../../shell/services/accounts";
import { MD5 } from "../../../../../../../utility/md5";

const Crumbs = [
  {
    name: "Activity Log",
    path: "/reports/activity-log/resources",
    icon: ScheduleRounded,
  },
  {
    name: "Users",
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
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { data: usersRoles, isLoading: isLoadingUsersRoles } =
    useGetUsersRolesQuery();

  const headerData = useMemo(() => {
    if (usersRoles) {
      const user = usersRoles?.find((userRole) => userRole.ZUID === id);

      return {
        name: `${user?.firstName} ${user?.lastName}` ?? "",
        imageUrl: `https://www.gravatar.com/avatar/${MD5(
          user?.email
        )}.jpg?s=40`,
        subTitle: [
          user?.role?.name,
          `${actionCount} Actions`,
          `Last action @ ${moment(latestActionDateTime).format("hh:mm A")}`,
        ],
      };
    }
  }, [usersRoles, actionCount]);

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
                {crumb.name}
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
            height={32}
            width={32}
            sx={{ flexShrink: 0 }}
          />
        ) : (
          <Avatar
            alt={`${headerData?.name} Avatar`}
            src={headerData?.imageUrl}
            sx={{ width: 32, height: 32 }}
          />
        )}
        <Stack gap={0.5} width="100%">
          <Typography variant="h5" fontWeight={700} maxWidth={640}>
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
