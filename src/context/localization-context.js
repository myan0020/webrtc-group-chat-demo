import React, { useState } from "react";

import { localeTypeEnum, localizableStrings } from "../util/localizable-strings";

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

  const contextValue = {
    localizedStrings: localizableStrings[localeType],
    changeLocalization,
  };
  return (
    <LocalizationContext.Provider value={contextValue}>{children}</LocalizationContext.Provider>
  );
}

export { LocalizationContextProvider, LocalizationContext };
