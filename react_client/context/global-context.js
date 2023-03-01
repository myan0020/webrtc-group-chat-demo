import * as React from "react";

import { LocalizationContext, LocalizationContextProvider } from "context/localization-context";
import {
  MediaRenderingContext,
  MediaRenderingContextProvider,
} from "context/media-rendering-context";
import { MessageContext, MessageContextProvider } from "context/message-context";

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
  const localizationContextValue = React.useContext(LocalizationContext);
  const mediaRenderingContextValue = React.useContext(MediaRenderingContext);
  const messageContextValue = React.useContext(MessageContext);

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
