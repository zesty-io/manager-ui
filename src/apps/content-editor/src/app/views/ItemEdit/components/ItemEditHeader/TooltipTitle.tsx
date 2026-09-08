import { FC } from "react";
import { formatDate } from "../../../../../../../../utility/formatDate";

type TooltipTitleProps = {
  text: string;
  dateTime: string;
  userName: string;
};

export const TooltipTitle: FC<TooltipTitleProps> = ({
  text,
  dateTime,
  userName,
}) => {
  const formatted = dateTime ? formatDate(dateTime) : "";
  const showOn =
    formatted &&
    !formatted.includes("Today") &&
    !formatted.includes("Yesterday");

  return (
    <div>
      {text} {showOn ? "on" : ""}
      <br />
      {formatted}
      <br /> {userName && <>by {userName}</>}
    </div>
  );
};
