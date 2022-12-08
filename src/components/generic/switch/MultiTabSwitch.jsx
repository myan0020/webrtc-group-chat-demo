import React, { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  background-color: ${(props) => props.backgroundColor};
  border-style: solid;
  border-radius: ${(props) => props.borderRadius}px;
  border-width: ${(props) => props.outerMostBorderWidth}px;
  border-color: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const TabWrapper = styled.div`
  flex: 1;
  border-radius: ${(props) => props.borderRadius}px;
  border-width: 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.backgroundColor};
  background-image: url(${(props) => props.backgroundImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  color: ${(props) => props.color};
  font-size: ${(props) => props.fontSize}px;
  text-align: center;
  height: 100%;

  &:hover,
  &:active {
    opacity: ${(props) => (props.enabled ? 0.5 : 1)};
  }
`;

const TabTextWrapper = styled.div`
  margin: auto;
`;

export const multiTabSwitchTabBuilder = ({
  switchTabName,
  switchTabSelectedBackgroundImageUrl,
  switchTabUnselectedBackgroundImageUrl,
  switchTabOnClick,
  switchTabSelected,
}) => {
  const tabName = typeof switchTabName === "string" ? switchTabName : "TabName";
  const selectedBackgroundImageUrl =
    typeof switchTabSelectedBackgroundImageUrl === "string"
      ? switchTabSelectedBackgroundImageUrl
      : "switchTabSelectedBackgroundImageUrl";
  const unselectedBackgroundImageUrl =
    typeof switchTabUnselectedBackgroundImageUrl === "string"
      ? switchTabUnselectedBackgroundImageUrl
      : "switchTabUnselectedBackgroundImageUrl";
  const onClick = typeof switchTabOnClick === "function" ? switchTabOnClick : null;
  const selected = typeof switchTabSelected === "boolean" ? switchTabSelected : false;
  return {
    name: tabName,
    selectedBackgroundImageUrl: selectedBackgroundImageUrl,
    unselectedBackgroundImageUrl: unselectedBackgroundImageUrl,
    onClick: onClick,
    selected: selected,
  };
};

export const multiTabSwitchPropsBuilder = ({
  switchTabs,

  switchEnabled,

  switchBorderRadius,
  switchOuterMostBorderWidth,
  switchFontSize,

  switchEnabledBackgroundColor,
  switchEnabledSelectedBackgroundColor,
  switchEnabledSelectedColor,
  switchEnabledUnselectedBackgroundColor,
  switchEnabledUnsectedColor,
}) => {
  const tabs =
    switchTabs && switchTabs instanceof Array && switchTabs.length >= 2
      ? switchTabs
      : [
          { name: "Tab1", onClick: null, selected: true },
          { name: "Tab2", onClick: null, selected: false },
        ];

  const enabled = switchEnabled;

  const borderRadius = typeof switchBorderRadius === "number" ? switchBorderRadius : 5;
  const outerMostBorderWidth =
    typeof switchOuterMostBorderWidth === "number" ? switchOuterMostBorderWidth : 3;
  const fontSize = typeof switchFontSize === "number" ? switchFontSize : 16;

  let backgroundColor = "rgba(255, 255, 255, 0)";
  let selectedBackgroundColor = "rgba(196, 196, 196, 0.25)";
  let selectedColor = "#C4C4C4";
  let unselectedBackgroundColor = "rgba(255, 255, 255, 0)";
  let unselectedColor = "#C4C4C4";

  if (enabled) {
    backgroundColor =
      typeof switchEnabledBackgroundColor === "string"
        ? switchEnabledBackgroundColor
        : "rgba(255, 255, 255, 0)";

    selectedBackgroundColor =
      typeof switchEnabledSelectedBackgroundColor === "string"
        ? switchEnabledSelectedBackgroundColor
        : "rgb(33, 150, 243)";
    selectedColor =
      typeof switchEnabledSelectedColor === "string"
        ? switchEnabledSelectedColor
        : "rgb(255, 255, 255)";
    unselectedBackgroundColor =
      typeof switchEnabledUnselectedBackgroundColor === "string"
        ? switchEnabledUnselectedBackgroundColor
        : "rgba(255, 255, 255, 0)";
    unselectedColor =
      typeof switchEnabledUnsectedColor === "string"
        ? switchEnabledUnsectedColor
        : "rgb(33, 150, 243)";
  }

  let selectedIndex = undefined;
  tabs.forEach((tab, index) => {
    if (tab.selected) {
      selectedIndex = index;
    }
  });

  return {
    switchEnabled: enabled,

    switchTabs: tabs,
    switchSelectedIndex: selectedIndex,

    switchBorderRadius: borderRadius,
    switchOuterMostBorderWidth: outerMostBorderWidth,
    switchFontSize: fontSize,

    switchBackgroundColor: backgroundColor,
    switchSelectedBackgroundColor: selectedBackgroundColor,
    switchSelectedColor: selectedColor,
    switchUnselectedBackgroundColor: unselectedBackgroundColor,
    switchUnselectedColor: unselectedColor,
  };
};

export default function MultiTabSwitch({
  switchEnabled,

  switchTabs,
  switchSelectedIndex,

  switchBorderRadius,
  switchOuterMostBorderWidth,
  switchFontSize,

  switchBackgroundColor,
  switchSelectedBackgroundColor,
  switchSelectedColor,
  switchUnselectedBackgroundColor,
  switchUnselectedColor,
}) {
  const [tabs, setTabs] = useState(switchTabs);
  const [selectedTabIndex, setSelectedTabIndex] = useState(switchSelectedIndex);

  const tabWrappersRender = tabs.map((tab, index) => {
    const handleTabSelected = () => {
      if (!switchEnabled) {
        return;
      }
      if (tab.onClick) {
        tab.onClick();
      }
      const newTabs = [...tabs];
      newTabs[index].selected = true;
      if (selectedTabIndex !== undefined && selectedTabIndex !== index) {
        newTabs[selectedTabIndex].selected = false;
      }
      setTabs(newTabs);
      setSelectedTabIndex(index);
    };

    const backgroundImageUrl = tab.selected
      ? tab.selectedBackgroundImageUrl
      : tab.unselectedBackgroundImageUrl;
    const backgroundColor = tab.selected
      ? switchSelectedBackgroundColor
      : switchUnselectedBackgroundColor;
    const color = tab.selected ? switchSelectedColor : switchUnselectedColor;

    return (
      <TabWrapper
        key={index}
        backgroundImageUrl={backgroundImageUrl}
        backgroundColor={backgroundColor}
        color={color}
        borderRadius={switchBorderRadius}
        fontSize={switchFontSize}
        enabled={switchEnabled}
        onClick={handleTabSelected}
      >
        <TabTextWrapper>{tab.name}</TabTextWrapper>
      </TabWrapper>
    );
  });

  return (
    <Wrapper
      backgroundColor={switchBackgroundColor}
      borderRadius={switchBorderRadius}
      outerMostBorderWidth={switchOuterMostBorderWidth}
    >
      {tabWrappersRender}
    </Wrapper>
  );
}
