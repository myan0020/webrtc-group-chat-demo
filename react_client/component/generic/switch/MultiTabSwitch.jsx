import * as React from "react";
import styled from "styled-components";

export const multiTabSwitchTabBuilder = ({
  switchTabName,
  switchTabBorderRadius,
  switchTabBadgeText,
  switchTabBadgeBackgroundImageUrl,
  switchTabSelectedBackgroundImageUrl,
  switchTabSelectedBackgroundImageSize,
  switchTabUnselectedBackgroundImageUrl,
  switchTabUnselectedBackgroundImageSize,
  switchTabOnClick,
  switchTabSelected,
}) => {
  const tabName = typeof switchTabName === "string" ? switchTabName : "TabName";
  const borderRadius = typeof switchTabBorderRadius === "number" ? switchTabBorderRadius : 5;

  const badgeBackgroundImageUrl =
    typeof switchTabBadgeBackgroundImageUrl === "string"
      ? switchTabBadgeBackgroundImageUrl
      : undefined;
  const selectedBackgroundImageUrl =
    typeof switchTabSelectedBackgroundImageUrl === "string"
      ? switchTabSelectedBackgroundImageUrl
      : undefined;
  const selectedBackgroundImageSize =
    typeof switchTabSelectedBackgroundImageSize === "string"
      ? switchTabSelectedBackgroundImageSize
      : "contain";
  const unselectedBackgroundImageUrl =
    typeof switchTabUnselectedBackgroundImageUrl === "string"
      ? switchTabUnselectedBackgroundImageUrl
      : undefined;
  const unselectedBackgroundImageSize =
    typeof switchTabUnselectedBackgroundImageSize === "string"
      ? switchTabUnselectedBackgroundImageSize
      : "contain";
  const onClick = typeof switchTabOnClick === "function" ? switchTabOnClick : null;
  const selected = typeof switchTabSelected === "boolean" ? switchTabSelected : false;

  const badgeText =
    typeof switchTabBadgeText === "string" && switchTabBadgeText.length > 0
      ? switchTabBadgeText
      : undefined;

  let badgeVisibility = "hidden";
  if (typeof badgeText === "string" && !selected) {
    badgeVisibility = "visible";
  }

  return {
    name: tabName,
    borderRadius,
    badgeVisibility,
    badgeText,
    badgeBackgroundImageUrl,
    selectedBackgroundImageUrl,
    selectedBackgroundImageSize,
    unselectedBackgroundImageUrl,
    unselectedBackgroundImageSize,
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

  return {
    switchEnabled: enabled,

    switchTabs: tabs,

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

  switchBorderRadius,
  switchOuterMostBorderWidth,
  switchFontSize,

  switchBackgroundColor,
  switchSelectedBackgroundColor,
  switchSelectedColor,
  switchUnselectedBackgroundColor,
  switchUnselectedColor,
}) {
  const tabWrappersRender = switchTabs.map((tab, index) => {
    const handleTabSelected = () => {
      if (!switchEnabled) {
        return;
      }
      if (tab.onClick) {
        tab.onClick();
      }
    };

    const borderRadius = tab.borderRadius;
    const badgeVisibility = tab.badgeVisibility;
    const badgeText = tab.badgeText;
    const badgeBackgroundImageUrl = tab.badgeBackgroundImageUrl;
    const backgroundImageUrl = tab.selected
      ? tab.selectedBackgroundImageUrl
      : tab.unselectedBackgroundImageUrl;
    const backgroundImageSize = tab.selected
      ? tab.selectedBackgroundImageSize
      : tab.unselectedBackgroundImageSize;
    const backgroundColor = tab.selected
      ? switchSelectedBackgroundColor
      : switchUnselectedBackgroundColor;
    const color = tab.selected ? switchSelectedColor : switchUnselectedColor;

    return (
      <TabWrapper
        key={index}
        backgroundImageUrl={backgroundImageUrl}
        backgroundImageSize={backgroundImageSize}
        backgroundColor={backgroundColor}
        color={color}
        borderRadius={borderRadius}
        fontSize={switchFontSize}
        enabled={switchEnabled}
        onClick={handleTabSelected}
      >
        <TabTextWrapper>{tab.name}</TabTextWrapper>
        <BadgeWrapper
          visibility={badgeVisibility}
          backgroundImageUrl={badgeBackgroundImageUrl}
        >
          {badgeText}
        </BadgeWrapper>
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
  ${(props) =>
    typeof props.backgroundImageUrl === "string" &&
    `background-image: url(${props.backgroundImageUrl});`}
  background-position: center;
  background-repeat: no-repeat;
  background-size: ${(props) => props.backgroundImageSize};
  color: ${(props) => props.color};
  font-size: ${(props) => props.fontSize}px;
  text-align: center;
  height: 100%;

  position: relative;

  &:hover,
  &:active {
    opacity: ${(props) => (props.enabled ? 0.5 : 1)};
  }
`;

const TabTextWrapper = styled.div`
  margin: auto;
`;

const BadgeWrapper = styled.div`
  visibility: ${(props) => props.visibility};
  width: 20px;
  height: 20px;
  position: absolute;
  top: -7px;
  right: 8px;

  border-radius: 5px;
  background-color: rgb(0, 150, 136);

  ${
    "" /* background-image: url(${(props) => props.backgroundImageUrl});
  background-position: 50% 2px;
  background-repeat: no-repeat;
  background-size: cover; */
  }

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: rgb(255, 255, 255);
`;
