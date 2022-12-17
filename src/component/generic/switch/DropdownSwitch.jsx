import React, { useState } from "react";
import styled from "styled-components";

const sharedStyleValues = {
  // rightContainerInnerHorizontalMargin: 8,
};

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: row;
  justify-content: start;

  position: relative;
`;

const IconWrapper = styled.div`
  box-sizing: border-box;
  flex: 0 0 ${(props) => props.width}px;
  height: ${(props) => props.width}px;

  background-image: url(${(props) => props.backgroundImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;

  &:hover,
  &:active {
    opacity: 0.5;
  }
`;

const SelectedOptionTextWrapper = styled.div`
  box-sizing: border-box;
  flex: 0 0 content;
  height: 100%;
  margin-left: 3px;

  display: flex;
  align-items: center;
  color: rgb(255, 255, 255);
`;

const DropdownWrapper = styled.ul`
  display: ${(props) => props.display};

  box-sizing: border-box;
  width: 100px;
  padding: 0;
  padding-top: 3px;
  padding-bottom: 3px;
  margin: 0;
  border: 1.5px solid #808080;
  border-radius: 5px;

  position: absolute;
  top: 120%;
  left: -8px;
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
  width: 100%;
`;

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
  dropdownSwitchSelectedOptionText,
  dropdownSwitchOptions,
}) => {
  const iconImageUrl =
    typeof dropdownSwitchIconImageUrl === "string" ? dropdownSwitchIconImageUrl : "";
  const iconImageWidth =
    typeof dropdownSwitchIconImageWidth === "number" && dropdownSwitchIconImageWidth > 0
      ? dropdownSwitchIconImageWidth
      : 0;
  const selectedOptionText =
    typeof dropdownSwitchSelectedOptionText === "string" ? dropdownSwitchSelectedOptionText : "";
  const options =
    dropdownSwitchOptions &&
    dropdownSwitchOptions instanceof Array &&
    dropdownSwitchOptions.length >= 1
      ? dropdownSwitchOptions
      : [{ name: "Option1", onClick: null, selected: true }];

  return {
    iconImageUrl,
    iconImageWidth,
    selectedOptionText,
    options,
  };
};

export default function DropdownSwitch({
  iconImageUrl,
  iconImageWidth,
  selectedOptionText,
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
      <IconWrapper
        backgroundImageUrl={iconImageUrl}
        width={iconImageWidth}
      />
      <SelectedOptionTextWrapper>{selectedOptionText}</SelectedOptionTextWrapper>
      <DropdownWrapper display={dropdownOptionsDisplay}>
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
      </DropdownWrapper>
    </Wrapper>
  );
}
