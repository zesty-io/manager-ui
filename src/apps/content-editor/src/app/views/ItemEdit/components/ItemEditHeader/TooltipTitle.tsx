import { FC } from "react";
import { formatDate } from "../../../../../../../../utility/formatDate";
import { User } from "shell/services/types";

type TooltipTitleProps = {
  text: string;
  dateTime: string;
  userZUID: string;
  users: User[] | undefined;
};

export const TooltipTitle: FC<TooltipTitleProps> = ({
  text,
  dateTime,
  userZUID,
  users,
}) => {
  const formatted = dateTime ? formatDate(dateTime) : "";
  const showOn =
    formatted &&
    !formatted.includes("Today") &&
    !formatted.includes("Yesterday");
  const user = users?.find((u) => u.ZUID === userZUID);
  const userName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";

  return (
    <div>
      {text} {showOn ? "on" : ""}
      <br />
      {formatted}
      <br /> {userName && <>by {userName}</>}
    </div>
  );
};
