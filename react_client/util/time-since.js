import * as localizableEnum from "constant/enum/localizable";

function timeSince(timestamp, withLocalizedStrings) {
  const localizedYearsAgoText = withLocalizedStrings[localizableEnum.key.YEARS_AGO];
  const localizedMonthsAgoText = withLocalizedStrings[localizableEnum.key.MONTHS_AGO]
  const localizedDaysAgoText = withLocalizedStrings[localizableEnum.key.DAYS_AGO]
  const localizedHoursAgoText = withLocalizedStrings[localizableEnum.key.HOURS_AGO]
  const localizedMinutesAgoText = withLocalizedStrings[localizableEnum.key.MINUTES_AGO]
  const localizedSecondsAgoText = withLocalizedStrings[localizableEnum.key.SECONDS_AGO]

  let seconds = Math.floor((new Date() - timestamp) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ` ${localizedYearsAgoText}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ` ${localizedMonthsAgoText}`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ` ${localizedDaysAgoText}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ` ${localizedHoursAgoText}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ` ${localizedMinutesAgoText}`;
  }
  return Math.floor(seconds) + ` ${localizedSecondsAgoText}`;
}

export { timeSince };
