import React, { useContext } from "react";

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
  const localizationContextValue = useContext(LocalizationContext);
  const mediaRenderingContextValue = useContext(MediaRenderingContext);
  const messageContextValue = useContext(MessageContext);

  const contextValue = {
    ...localizationContextValue,
    ...mediaRenderingContextValue,
    ...messageContextValue,
  };

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
}

export { ContextProviderComposer as GlobalContextProvider, GlobalContext };
