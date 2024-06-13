import moment from "moment";

// This assumes the date passed in the param has a format of YYYY-MM-DD
export const toUTC = (originalDate: string) => {
  if (!originalDate || !moment(originalDate).isValid) return;

  const [year, month, date] = originalDate.split("-");

  if (isNaN(Number(year)) || isNaN(Number(month)) || isNaN(Number(date)))
    return;

  return moment()
    .year(Number(year))
    .month(Number(month) - 1)
    .date(Number(date))
    .utc()
    .format("L");
};
