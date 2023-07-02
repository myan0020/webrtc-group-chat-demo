import * as React from "react";
import { useRouteError } from "react-router-dom";
import styled from "styled-components";

export default function ErrorPage() {
  const error = useRouteError();
  return (
    <Wrapper>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>Error Text: {error.statusText}</i>
        <br/>
        <i>Error Message: {error.message}</i>
      </p>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
