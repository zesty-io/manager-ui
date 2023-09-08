import moment from "moment-timezone";

export const formatDate = (dateString: string) => {
  // Get the user's timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const inputDate = moment(dateString).tz(timeZone);
  const currentDate = moment().tz(timeZone);
  let formattedDate;

  // Check for today or yesterday
  if (inputDate.isSame(currentDate, "day")) {
    formattedDate = "Today";
  } else if (inputDate.isSame(currentDate.subtract(1, "day"), "day")) {
    formattedDate = "Yesterday";
  } else {
    formattedDate = inputDate.format("MMM D");
  }

  // Get the timezone abbreviation
  const tzAbbreviation = inputDate.format("z");

  return `${formattedDate}, ${inputDate.format("h:mm A")} ${tzAbbreviation}`;
};
