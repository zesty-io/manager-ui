import { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  formatDate,
  isTodayOrYesterday,
} from "../../../../../../../../utility/formatDate";

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
  const { t } = useTranslation();
  const formatted = dateTime ? formatDate(dateTime) : "";
  const showOn = !!formatted && !isTodayOrYesterday(dateTime);

  return (
    <div>
      {text} {showOn ? t("content.itemEditOn") : ""}
      <br />
      {formatted}
      <br />{" "}
      {userName && <>{t("content.itemEditByUser", { name: userName })}</>}
    </div>
  );
};
