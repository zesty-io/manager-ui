import moment from "moment";

const TIME_STRINGS = [
  "12:00 am",
  "12:15 am",
  "12:30 am",
  "12:45 am",
  "1:00 am",
  "1:15 am",
  "1:30 am",
  "1:45 am",
  "2:00 am",
  "2:15 am",
  "2:30 am",
  "2:45 am",
  "3:00 am",
  "3:15 am",
  "3:30 am",
  "3:45 am",
  "4:00 am",
  "4:15 am",
  "4:30 am",
  "4:45 am",
  "5:00 am",
  "5:15 am",
  "5:30 am",
  "5:45 am",
  "6:00 am",
  "6:15 am",
  "6:30 am",
  "6:45 am",
  "7:00 am",
  "7:15 am",
  "7:30 am",
  "7:45 am",
  "8:00 am",
  "8:15 am",
  "8:30 am",
  "8:45 am",
  "9:00 am",
  "9:15 am",
  "9:30 am",
  "9:45 am",
  "10:00 am",
  "10:15 am",
  "10:30 am",
  "10:45 am",
  "11:00 am",
  "11:15 am",
  "11:30 am",
  "11:45 am",
  "12:00 pm",
  "12:15 pm",
  "12:30 pm",
  "12:45 pm",
  "1:00 pm",
  "1:15 pm",
  "1:30 pm",
  "1:45 pm",
  "2:00 pm",
  "2:15 pm",
  "2:30 pm",
  "2:45 pm",
  "3:00 pm",
  "3:15 pm",
  "3:30 pm",
  "3:45 pm",
  "4:00 pm",
  "4:15 pm",
  "4:30 pm",
  "4:45 pm",
  "5:00 pm",
  "5:15 pm",
  "5:30 pm",
  "5:45 pm",
  "6:00 pm",
  "6:15 pm",
  "6:30 pm",
  "6:45 pm",
  "7:00 pm",
  "7:15 pm",
  "7:30 pm",
  "7:45 pm",
  "8:00 pm",
  "8:15 pm",
  "8:30 pm",
  "8:45 pm",
  "9:00 pm",
  "9:15 pm",
  "9:30 pm",
  "9:45 pm",
  "10:00 pm",
  "10:15 pm",
  "10:30 pm",
  "10:45 pm",
  "11:00 pm",
  "11:15 pm",
  "11:30 pm",
  "11:45 pm",
] as const;

export const toISOString = (timeString: string) => {
  return moment(`01-01-2024 ${timeString}`).format("HH:mm:ss.SSSSSS");
};

export const to12HrTime = (isoTime: string) => {
  return moment(`01/01/2024 ${isoTime}`).format("h:mm a");
};

const generateTimeOptions = () => {
  return TIME_STRINGS.map((timeString) => ({
    value: toISOString(timeString),
    inputValue: timeString,
  }));
};

export const TIME_OPTIONS = [...generateTimeOptions()] as const;

export const getDerivedTime = (userInput: string) => {
  if (!userInput) {
    return "";
  }

  const matchedPeriodOfTime = userInput.match(
    /(?<![a-zA-Z])(?:a\.?m?\.?|p\.?m?\.?)$/i
  );
  let periodOfTimeValue = matchedPeriodOfTime?.[0]?.trim();
  const timeInput = userInput.slice(
    0,
    matchedPeriodOfTime?.["index"] ?? undefined
  );
  const hourInput = timeInput?.split(":")?.[0]?.trim();
  let minuteInput = timeInput?.split(":")?.[1]?.trim();

  // Rounds off minutes so it's always 2 digits
  if (!minuteInput) {
    minuteInput = "00";
  } else if (minuteInput.length === 1) {
    minuteInput = `${minuteInput}0`;
  }

  // Determines wether we'll try to match am or pm times
  if (!periodOfTimeValue) {
    periodOfTimeValue = +hourInput >= 7 && +hourInput <= 11 ? "am" : "pm";
  } else if (periodOfTimeValue.startsWith("a")) {
    periodOfTimeValue = "am";
  } else if (periodOfTimeValue.startsWith("p")) {
    periodOfTimeValue = "pm";
  }

  return `${hourInput}:${minuteInput} ${periodOfTimeValue}`;
};

export const getClosestTimeSuggestion = (input: string) => {
  if (!input) {
    return { time: null, index: -1 };
  }

  const derivedTime = getDerivedTime(input);

  const matchedTimeIndex = TIME_OPTIONS.findIndex((time) => {
    return (
      Math.abs(
        new Date(`01/01/2024 ${time.inputValue}`).getTime() / 1000 -
          new Date(`01/01/2024 ${derivedTime}`).getTime() / 1000
      ) <= 420
    );
  });

  return {
    time: matchedTimeIndex >= 0 ? TIME_OPTIONS[matchedTimeIndex] : null,
    index: matchedTimeIndex,
  };
};
