import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  background-color: rgba(0, 0, 0, 0);
  ${(props) =>
    typeof props.backgroundImageUrl === "string" &&
    `background-image: url(${props.backgroundImageUrl});`}
  background-position: center;
  background-repeat: no-repeat;
  background-size: ${(props) => props.backgroundImageSize};
  border-style: solid;
  border-radius: ${(props) => props.borderRadius}px;
  border-width: 1px;
  border-color: ${(props) => props.borderColor};
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  &:hover,
  &:active {
    opacity: ${(props) => (props.enabled ? 0.5 : 1)};
  }
`;

const OptionWrapper = styled.div`
  display: ${(props) => props.display};
  border-width: 0px;
  border-color: transparent;
  border-style: solid;
  background-color: ${(props) => props.backgroundColor};
  ${(props) =>
    typeof props.backgroundImageUrl === "string" &&
    `background-image: url(${props.backgroundImageUrl});`}
  background-position: center;
  background-repeat: no-repeat;
  background-size: ${(props) => props.backgroundImageSize};
  width: 100%;
  height: 100%;
`;

export const singleTabSwitchOptionBuilder = ({
  switchOptionBorderColor,
  switchOptionBackgroundColor,
  switchOptionBackgroundImageUrl,
  switchOptionBackgroundImageSize,
  switchOptionOnClick,
  switchOptionSelected,
}) => {
  const borderColor =
    typeof switchOptionBorderColor === "string" ? switchOptionBorderColor : "#C4C4C4";
  const backgroundColor =
    typeof switchOptionBackgroundColor === "string" ? switchOptionBackgroundColor : "#F44336";
  const backgroundImageUrl =
    typeof switchOptionBackgroundImageUrl === "string" ? switchOptionBackgroundImageUrl : undefined;
  const backgroundImageSize =
    typeof switchOptionBackgroundImageSize === "string"
      ? switchOptionBackgroundImageSize
      : "contain";
  const onClick = typeof switchOptionOnClick === "function" ? switchOptionOnClick : null;
  const selected = typeof switchOptionSelected === "boolean" ? switchOptionSelected : false;

  return {
    borderColor,
    backgroundColor,
    backgroundImageUrl,
    backgroundImageSize,
    onClick,
    selected,
  };
};

export const singleTabSwitchPropsBuilder = ({
  switchEnabled,
  switchBorderRadius,
  switchBackgroundImageUrl,
  switchBackgroundImageSize,
  switchOneOption,
  switchAnotherOption,
}) => {
  const enabled = typeof switchEnabled === "boolean" ? switchEnabled : true;
  const borderRadius = typeof switchBorderRadius === "number" ? switchBorderRadius : 10;
  const backgroundImageUrl =
    typeof switchBackgroundImageUrl === "string" ? switchBackgroundImageUrl : undefined;
  const backgroundImageSize =
    typeof switchBackgroundImageSize === "string" ? switchBackgroundImageSize : "contain";

  const numberOfOptions = (switchOneOption ? 1 : 0) + (switchAnotherOption ? 1 : 0);
  let options;
  if (numberOfOptions === 2) {
    options = [switchOneOption, switchAnotherOption];
  } else {
    console.error(
      `SingleTabSwitch: invalid options count of ${numberOfOptions}, should be only "2"`
    );
    options = [
      { backgroundColor: "#F44336", backgroundImageUrl: undefined, onClick: null, selected: true },
      { backgroundColor: "#009688", backgroundImageUrl: undefined, onClick: null, selected: false },
    ];
  }

  const oneOptionIndex = 0;
  const anotherOptionIndex = 1;
  let selectedIndex = oneOptionIndex;
  options.forEach((option, index) => {
    if (index > 2) {
      return;
    }
    if (option.selected) {
      selectedIndex = index;
      return;
    }
  });

  const switchOneOptionDisplay =
    !switchEnabled || oneOptionIndex !== selectedIndex ? "none" : "block";
  const switchAnotherOptionDisplay =
    !switchEnabled || anotherOptionIndex !== selectedIndex ? "none" : "block";

  options[oneOptionIndex].display = switchOneOptionDisplay;
  options[anotherOptionIndex].display = switchAnotherOptionDisplay;

  const borderColor = enabled ? options[selectedIndex].borderColor : "#C4C4C4";

  return {
    switchEnabled: enabled,
    switchBorderRadius: borderRadius,
    switchBorderColor: borderColor,
    switchBackgroundImageUrl: backgroundImageUrl,
    switchBackgroundImageSize: backgroundImageSize,
    switchOptions: options,
  };
};

export default function SingleTabSwitch({
  switchEnabled,
  switchBorderRadius,
  switchBorderColor,
  switchBackgroundImageUrl,
  switchBackgroundImageSize,
  switchOptions,
}) {
  const oneOptionIndex = 0;
  const oneOptionDisplay = switchOptions[oneOptionIndex].display;
  const oneOptionBorderColor = switchOptions[oneOptionIndex].borderColor;
  const oneOptionBackgroundColor = switchOptions[oneOptionIndex].backgroundColor;
  const oneOptionBackgroundImageUrl = switchOptions[oneOptionIndex].backgroundImageUrl;
  const oneOptionBackgroundImageSize = switchOptions[oneOptionIndex].backgroundImageSize;

  const anotherOptionIndex = 1;
  const anotherOptionDisplay = switchOptions[anotherOptionIndex].display;
  const anotherOptionBorderColor = switchOptions[anotherOptionIndex].borderColor;
  const anotherOptionBackgroundColor = switchOptions[anotherOptionIndex].backgroundColor;
  const anotherOptionBackgroundImageUrl = switchOptions[anotherOptionIndex].backgroundImageUrl;
  const anotherOptionBackgroundImageSize = switchOptions[anotherOptionIndex].backgroundImageSize;

  const handleOptionSelected = (oldSelectedOptionIndex) => {
    if (!switchEnabled) {
      return;
    }
    if (switchOptions[oldSelectedOptionIndex].onClick) {
      switchOptions[oldSelectedOptionIndex].onClick();
    }
  };

  return (
    <Wrapper
      borderRadius={switchBorderRadius}
      borderColor={switchBorderColor}
      backgroundImageUrl={switchBackgroundImageUrl}
      backgroundImageSize={switchBackgroundImageSize}
      enabled={switchEnabled}
    >
      <OptionWrapper
        display={oneOptionDisplay}
        borderColor={oneOptionBorderColor}
        backgroundColor={oneOptionBackgroundColor}
        backgroundImageUrl={oneOptionBackgroundImageUrl}
        backgroundImageSize={oneOptionBackgroundImageSize}
        onClick={() => {
          handleOptionSelected(oneOptionIndex);
        }}
      />
      <OptionWrapper
        display={anotherOptionDisplay}
        borderColor={anotherOptionBorderColor}
        backgroundColor={anotherOptionBackgroundColor}
        backgroundImageUrl={anotherOptionBackgroundImageUrl}
        backgroundImageSize={anotherOptionBackgroundImageSize}
        onClick={() => {
          handleOptionSelected(anotherOptionIndex);
        }}
      />
    </Wrapper>
  );
}
