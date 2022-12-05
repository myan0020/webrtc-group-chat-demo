import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  background-color: rgba(0, 0, 0, 0);
  background-image: url(${(props) => props.backgroundImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  border-style: solid;
  border-radius: ${(props) => props.borderRadius}px;
  border-width: 1px;
  border-color: ${(props) => props.borderColor};
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const OptionWrapper = styled.div`
  display: ${(props) => props.display};
  border-width: 0px;
  border-color: transparent;
  border-style: solid;
  background-color: ${(props) => props.backgroundColor};
  background-image: url(${(props) => props.backgroundImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
`;

export const singleTabSwitchOptionBuilder = ({
  switchOptionBorderColor,
  switchOptionBackgroundColor,
  switchOptionBackgroundImageUrl,
  switchOptionOnClick,
  switchOptionSelected,
}) => {
  const borderColor =
    typeof switchOptionBorderColor === "string" ? switchOptionBorderColor : "#C4C4C4";
  const backgroundColor =
    typeof switchOptionBackgroundColor === "string" ? switchOptionBackgroundColor : "#F44336";
  const backgroundImageUrl =
    typeof switchOptionBackgroundImageUrl === "string"
      ? switchOptionBackgroundImageUrl
      : "switchOptionBackgroundImageUrl";
  const onClick = typeof switchOptionOnClick === "function" ? switchOptionOnClick : null;
  const selected = typeof switchOptionSelected === "boolean" ? switchOptionSelected : false;

  return {
    borderColor,
    backgroundColor,
    backgroundImageUrl,
    onClick,
    selected,
  };
};

export const singleTabSwitchPropsBuilder = ({
  switchEnabled,
  switchBorderRadius,
  switchBackgroundImageUrl,
  switchOneOption,
  switchAnotherOption,
}) => {
  const enabled = typeof switchEnabled === "boolean" ? switchEnabled : true;
  const borderRadius = typeof switchBorderRadius === "number" ? switchBorderRadius : 10;
  const backgroundImageUrl =
    typeof switchBackgroundImageUrl === "string"
      ? switchBackgroundImageUrl
      : "switchBackgroundImageUrl";

  const numberOfOptions = (switchOneOption ? 1 : 0) + (switchAnotherOption ? 1 : 0);
  let options;
  if (numberOfOptions === 2) {
    options = [switchOneOption, switchAnotherOption];
  } else {
    console.error(
      `SingleTabSwitch: invalid options count of ${numberOfOptions}, should be only "2"`
    );
    options = [
      { backgroundColor: "#F44336", backgroundImageUrl: "url", onClick: null, selected: true },
      { backgroundColor: "#009688", backgroundImageUrl: "url", onClick: null, selected: false },
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
    switchOptions: options,
  };
};

export default function SingleTabSwitch({
  switchEnabled,
  switchBorderRadius,
  switchBorderColor,
  switchBackgroundImageUrl,
  switchOptions,
}) {
  const oneOptionIndex = 0;
  const oneOptionDisplay = switchOptions[oneOptionIndex].display;
  const oneOptionBorderColor = switchOptions[oneOptionIndex].borderColor;
  const oneOptionBackgroundColor = switchOptions[oneOptionIndex].backgroundColor;
  const oneOptionBackgroundImageUrl = switchOptions[oneOptionIndex].backgroundImageUrl;

  const anotherOptionIndex = 1;
  const anotherOptionDisplay = switchOptions[anotherOptionIndex].display;
  const anotherOptionBorderColor = switchOptions[anotherOptionIndex].borderColor;
  const anotherOptionBackgroundColor = switchOptions[anotherOptionIndex].backgroundColor;
  const anotherOptionBackgroundImageUrl = switchOptions[anotherOptionIndex].backgroundImageUrl;

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
    >
      <OptionWrapper
        display={oneOptionDisplay}
        borderColor={oneOptionBorderColor}
        backgroundColor={oneOptionBackgroundColor}
        backgroundImageUrl={oneOptionBackgroundImageUrl}
        onClick={() => {
          handleOptionSelected(oneOptionIndex);
        }}
      />
      <OptionWrapper
        display={anotherOptionDisplay}
        borderColor={anotherOptionBorderColor}
        backgroundColor={anotherOptionBackgroundColor}
        backgroundImageUrl={anotherOptionBackgroundImageUrl}
        onClick={() => {
          handleOptionSelected(anotherOptionIndex);
        }}
      />
    </Wrapper>
  );
}
