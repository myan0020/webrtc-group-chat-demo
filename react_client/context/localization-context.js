import React, { useState } from "react";

import { localizableStrings } from "constant/string/localizable-strings";
import * as localizableEnum from "constant/enum/localizable";

const LocalizationContext = React.createContext();
LocalizationContext.displayName = "LocalizationContext";

function LocalizationContextProvider({ children }) {
  const [localeType, setLocaleType] = useState(localizableEnum.type.ENGLISH);

  const changeLocalization = (toLocaleType) => {
    switch (toLocaleType) {
      case localizableEnum.type.CHINESE:
        setLocaleType(localizableEnum.type.CHINESE);
        break;
      default:
        setLocaleType(localizableEnum.type.ENGLISH);
        break;
    }
  };

  const resetLocalizationContext = () => {
    setLocaleType(localizableEnum.type.ENGLISH);
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
