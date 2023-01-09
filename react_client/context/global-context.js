import React, { useContext } from "react";

import { LocalizationContext, LocalizationContextProvider } from "./localization-context";
import {
  MediaRenderingContext,
  MediaRenderingContextProvider,
} from "./media-rendering-context";
import { MessageContext, MessageContextProvider } from "./message-context";

const GlobalContext = React.createContext();
GlobalContext.displayName = "GlobalContext";

function ContextProviderComposer({ children }) {
  return (
    <LocalizationContextProvider>
      <MediaRenderingContextProvider>
        <MessageContextProvider>
          <ChildrenWrapper>{children}</ChildrenWrapper>
        </MessageContextProvider>
      </MediaRenderingContextProvider>
    </LocalizationContextProvider>
  );
}

function ChildrenWrapper({ children }) {
  const localizationContextValue = useContext(LocalizationContext);
  const mediaRenderingContextValue = useContext(MediaRenderingContext);
  const messageContextValue = useContext(MessageContext);

  const resetGlobalContext = () => {
    if (typeof localizationContextValue.resetLocalizationContext === "function") {
      localizationContextValue.resetLocalizationContext();
    }
    if (typeof mediaRenderingContextValue.resetMediaRenderingContext === "function") {
      mediaRenderingContextValue.resetMediaRenderingContext();
    }
    if (typeof messageContextValue.resetMessageContext === "function") {
      messageContextValue.resetMessageContext();
    }
  }

  const contextValue = {
    ...localizationContextValue,
    ...mediaRenderingContextValue,
    ...messageContextValue,

    resetGlobalContext,
  };

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
}

export { ContextProviderComposer as GlobalContextProvider, GlobalContext };
