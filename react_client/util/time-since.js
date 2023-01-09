import { localizableStringKeyEnum } from "resource/string/localizable-strings"

function timeSince(timestamp, withLocalizedStrings) {
  const localizedYearsAgoText = withLocalizedStrings[localizableStringKeyEnum.YEARS_AGO];
  const localizedMonthsAgoText = withLocalizedStrings[localizableStringKeyEnum.MONTHS_AGO]
  const localizedDaysAgoText = withLocalizedStrings[localizableStringKeyEnum.DAYS_AGO]
  const localizedHoursAgoText = withLocalizedStrings[localizableStringKeyEnum.HOURS_AGO]
  const localizedMinutesAgoText = withLocalizedStrings[localizableStringKeyEnum.MINUTES_AGO]
  const localizedSecondsAgoText = withLocalizedStrings[localizableStringKeyEnum.SECONDS_AGO]

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
