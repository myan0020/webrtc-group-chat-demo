import React, { useState } from "react";

import { localeTypeEnum, localizableStrings } from "../resource/string/localizable-strings";

const LocalizationContext = React.createContext();
LocalizationContext.displayName = "LocalizationContext";

function LocalizationContextProvider({ children }) {
  const [localeType, setLocaleType] = useState(localeTypeEnum.ENGLISH);

  const changeLocalization = (toLocaleType) => {
    switch (toLocaleType) {
      case localeTypeEnum.CHINESE:
        setLocaleType(localeTypeEnum.CHINESE);
        break;
      default:
        setLocaleType(localeTypeEnum.ENGLISH);
        break;
    }
  };

  const resetLocalizationContext = () => {
    setLocaleType(localeTypeEnum.ENGLISH);
  }

  const contextValue = {
    localizedStrings: localizableStrings[localeType],
    changeLocalization,
    resetLocalizationContext,
  };
  return (
    <LocalizationContext.Provider value={contextValue}>{children}</LocalizationContext.Provider>
  );
}

export { LocalizationContextProvider, LocalizationContext };
