import React, { useContext, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";

import { requestToSignin, selectAuthenticated } from "store/authSlice";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";
import LocalizationSwitch from "../localization/LocalizationSwitch";
import globalGreyImageUrl from "resource/image/global_grey_3x.png";
import { GlobalContext } from "context/global-context";

export default function Signin() {
  const dispatch = useDispatch();

  const { localizedStrings } = useContext(GlobalContext);
  const authenticated = useSelector(selectAuthenticated);
  const [inputUserName, setInputUserName] = useState("");

  const onInputNewUserNameChange = (e) => {
    setInputUserName(e.target.value);
  };
  const onSigninClick = (e) => {
    e.preventDefault();
    dispatch(requestToSignin(inputUserName));
  };
  const onKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (inputUserName.length === 0) return;
    onSigninClick(e);
  };

  if (!authenticated) {
    return (
      <MemorizedSignin
        localizedStrings={localizedStrings}
        inputUserName={inputUserName}
        onInputNewUserNameChange={onInputNewUserNameChange}
        onKeyDown={onKeyDown}
        onSigninClick={onSigninClick}
      />
    );
  }

  return <Navigate to={"/room-list"} />;
}

const MemorizedSignin = React.memo(SigninToMemo, arePropsEqual);

function SigninToMemo({
  localizedStrings,
  inputUserName,
  onInputNewUserNameChange,
  onKeyDown,
  onSigninClick,
}) {
  return (
    <Wrapper>
      <ContentWrapper>
        <HeadingWrapper>
          <Heading>{localizedStrings[localizableStringKeyEnum.SIGN_IN_TITLE]}</Heading>
          <HeadingDescription>
            {localizedStrings[localizableStringKeyEnum.SIGN_IN_TITLE_DESC]}
          </HeadingDescription>
        </HeadingWrapper>
        {/* {isVerifyingAuth && (
          <VerifyingWrapper>
            <RotatingLines
              strokeColor='grey'
              strokeWidth='5'
              animationDuration='0.75'
              width='20'
              height='20'
              visible={true}
            />
          </VerifyingWrapper>
        )} */}
        <FormWrapper>
          <FormInputWrapper>
            <FormInput
              placeholder={`${
                localizedStrings[localizableStringKeyEnum.SIGN_IN_INPUT_PLACEHOLDER]
              }`}
              onChange={onInputNewUserNameChange}
              value={inputUserName}
              onKeyDown={onKeyDown}
              autoFocus
            />
          </FormInputWrapper>
          <FormButton
            type='button'
            onClick={onSigninClick}
          >
            {localizedStrings[localizableStringKeyEnum.SIGN_IN_COMFIRM]}
          </FormButton>
          <FormLanguageSwitchContainer>
            <LocalizationSwitch
              iconImageUrl={globalGreyImageUrl}
              selectedTextColor={"#808080"}
              isSelectedTextKeyVisible={true}
            />
          </FormLanguageSwitchContainer>
        </FormWrapper>
      </ContentWrapper>
    </Wrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isInputUserNameEqual = Object.is(prevProps.inputUserName, nextProps.inputUserName);
  return isLocalizedStringEqual && isInputUserNameEqual;
};

const sharedStyleValues = {
  formInputVerticalMargin: 40,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: radial-gradient(at 50% 20%, rgb(255, 255, 255) 70%, rgb(196, 196, 196) 90%);
`;

const ContentWrapper = styled.div`
  position: relative;
  top: 26%;
  margin-left: 50px;
  margin-right: 117px;
  height: calc(300 / 800 * 100%);
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: calc(120 / 1280 * 100%);
`;

const HeadingWrapper = styled.div`
  flex-basis: 522px;
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 48px;
  font-weight: bolder;
`;

const HeadingDescription = styled.p`
  text-align: center;
  font-size: 28px;
  font-weight: normal;
  color: #808080;
`;

// const VerifyingWrapper = styled.form`
//   flex-basis: 404px;
// `;

const FormWrapper = styled.form`
  flex-basis: 404px;
  display: flex;
  flex-direction: column;
`;

const FormInputWrapper = styled.div`
  padding: 10px;
  border: 1px solid #c4c4c4;
  border-radius: 10px;
  padding-left: 12px;
  border-width: 1px;
  margin-top: ${sharedStyleValues.formInputVerticalMargin}px;
  margin-bottom: ${sharedStyleValues.formInputVerticalMargin}px;
`;

const FormInput = styled.input`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-color: transparent;
  font-size: 28px;
  color: #808080;
  &::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: #c4c4c4;
    font-size: 28px;
    font-weight: normal;
    opacity: 1; /* Firefox */
  }
  &:focus {
    outline: none;
  }
`;

const FormButton = styled.button`
  background-color: #52c41a;
  color: white;
  font-size: 28px;
  font-weight: bold;
  height: 54px;

  border-radius: 10px;
  border-width: 1px;
  border-color: aliceblue;
`;

const FormLanguageSwitchContainer = styled.div`
  width: 200px;
  height: 40px;
  margin-top: 15px;
  font-size: 20px;
`;