import React, { useState } from "react";
import styled from "styled-components";

export const dropdownSwitchOptionBuilder = ({
  dropdownOptionName,
  dropdownOptionSelected,
  dropdownOptionOnClick,
}) => {
  const name = typeof dropdownOptionName === "string" ? dropdownOptionName : "unknown option";
  const selected = typeof dropdownOptionSelected == "boolean" ? dropdownOptionSelected : false;
  const onClick = typeof dropdownOptionOnClick === "function" ? dropdownOptionOnClick : null;
  return {
    name,
    selected,
    onClick,
  };
};

export const dropdownSwitchPropsBuilder = ({
  dropdownSwitchIconImageUrl,
  dropdownSwitchIconImageWidth,
  dropdownSwitchSelectedOptionTextKey,
  dropdownSwitchSelectedOptionTextValue,
  dropdownSwitchSelectedOptionTextColor,
  dropdownSwitchSelectedTextKeyVisible,
  dropdownSwitchOptions,
}) => {
  const iconImageUrl =
    typeof dropdownSwitchIconImageUrl === "string" ? dropdownSwitchIconImageUrl : "";
  const iconImageWidth =
    typeof dropdownSwitchIconImageWidth === "number" && dropdownSwitchIconImageWidth > 0
      ? dropdownSwitchIconImageWidth
      : 0;
  const selectedOptionTextKey =
    typeof dropdownSwitchSelectedOptionTextKey === "string"
      ? dropdownSwitchSelectedOptionTextKey
      : "";
  const selectedOptionTextValue =
    typeof dropdownSwitchSelectedOptionTextValue === "string"
      ? dropdownSwitchSelectedOptionTextValue
      : "";
  const selectedOptionTextColor =
    typeof dropdownSwitchSelectedOptionTextColor === "string"
      ? dropdownSwitchSelectedOptionTextColor
      : "rgb(255, 255, 255)";
  const isSelectedOptionTextKeyVisible =
    typeof dropdownSwitchSelectedTextKeyVisible === "boolean"
      ? dropdownSwitchSelectedTextKeyVisible
      : true;
  const options =
    dropdownSwitchOptions &&
    dropdownSwitchOptions instanceof Array &&
    dropdownSwitchOptions.length >= 1
      ? dropdownSwitchOptions
      : [{ name: "Option1", onClick: null, selected: true }];

  return {
    iconImageUrl,
    iconImageWidth,
    selectedOptionTextKey,
    selectedOptionTextValue,
    selectedOptionTextColor,
    isSelectedOptionTextKeyVisible,
    options,
  };
};

export default function DropdownSwitch({
  iconImageUrl,
  iconImageWidth,
  selectedOptionTextKey,
  selectedOptionTextValue,
  selectedOptionTextColor,
  isSelectedOptionTextKeyVisible,
  options,
}) {
  const [dropdownOptionsDisplay, setDropdownOptionsDisplay] = useState("none");

  const toggleDropdownOptionsDisplay = () => {
    if (dropdownOptionsDisplay === "none") {
      setDropdownOptionsDisplay("block");
      return;
    }
    setDropdownOptionsDisplay("none");
  };

  return (
    <Wrapper onClick={toggleDropdownOptionsDisplay}>
      <SelectedOptionWrapper>
        <SelectedOptionIconWrapper
          backgroundImageUrl={iconImageUrl}
          width={iconImageWidth}
        />
        <SelectedOptionTextWrapper color={selectedOptionTextColor}>
          {`${
            isSelectedOptionTextKeyVisible ? `${selectedOptionTextKey}: ` : ""
          }${selectedOptionTextValue}`}
        </SelectedOptionTextWrapper>
      </SelectedOptionWrapper>
      <DropdownBackgroundWrapper display={dropdownOptionsDisplay} />
      <DropdownContentWrapper display={dropdownOptionsDisplay}>
        {options.map((option) => {
          const handleDropdownOptionClick = () => {
            if (option.onClick) {
              option.onClick();
            }
          };
          return (
            <DropdownOptionWrapper
              key={option.name}
              onClick={handleDropdownOptionClick}
            >
              {option.name}
            </DropdownOptionWrapper>
          );
        })}
      </DropdownContentWrapper>
    </Wrapper>
  );
}

const sharedStyleValues = {
  dropdownOptionHorizontalMargin: 5,
  dropdownOptionVerticalMargin: 5,
};

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;

  position: relative;
`;

const SelectedOptionWrapper = styled.div`
  box-sizing: border-box;
  max-width: 100%;
  height: 100%;

  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;

  &:hover,
  &:active {
    opacity: 0.5;
  }
`;

const SelectedOptionIconWrapper = styled.div`
  box-sizing: border-box;
  flex: 0 0 ${(props) => props.width}px;
  height: ${(props) => props.width}px;

  background-image: url(${(props) => props.backgroundImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
`;

const SelectedOptionTextWrapper = styled.div`
  box-sizing: border-box;
  flex: 0 0 content;
  height: 100%;
  margin-left: 3px;

  display: flex;
  align-items: center;
  color: ${(props) => props.color};
`;

const DropdownBackgroundWrapper = styled.div`
  display: ${(props) => props.display};
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  z-index: 1;
`;

const DropdownContentWrapper = styled.ul`
  display: ${(props) => props.display};

  box-sizing: border-box;
  width: 100px;
  padding: 0;
  padding-top: 3px;
  padding-bottom: 3px;
  margin: 0;
  border: 1.5px solid #808080;
  border-radius: 10px;

  position: absolute;
  top: 120%;
  left: -5px;
  z-index: 1;

  background-color: rgb(36, 41, 47);
`;

const DropdownOptionWrapper = styled.li`
  box-sizing: border-box;
  height: 50px;
  list-style-type: none;
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - ${sharedStyleValues.dropdownOptionHorizontalMargin * 2}px);
  border-radius: 10px;
  margin-left: ${sharedStyleValues.dropdownOptionHorizontalMargin}px;
  margin-right: ${sharedStyleValues.dropdownOptionHorizontalMargin}px;
  margin-top: ${sharedStyleValues.dropdownOptionVerticalMargin}px;
  margin-bottom: ${sharedStyleValues.dropdownOptionVerticalMargin}px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;