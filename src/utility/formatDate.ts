import moment from "moment-timezone";

export const formatDate = (dateString: string): string => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Handle the case where timeZone is undefined
  if (!timeZone) {
    console.error("Time zone is not defined.");
    return moment(dateString).format("MMM D, h:mm A");
  }

  const inputDate = moment(dateString).tz(timeZone);

  // Check if inputDate is valid
  if (!inputDate.isValid()) {
    console.error("Invalid date string:", dateString);
    return "Invalid Date";
  }

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
