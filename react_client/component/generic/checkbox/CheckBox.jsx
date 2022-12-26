import React, { useState } from "react";
import styled from "styled-components";

import checkMarkUrl from "resource/image/check_mark_3x.png";

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: ${(props) => props.borderWidth}px solid ${(props) => props.borderColor};
  border-radius: ${(props) => props.borderRadius}px;
  background-color: ${(props) => props.backgroundColor};
  &:hover,
  &:active {
    opacity: ${(props) => (props.enabled ? 0.5 : 1)};
  }
`;

const CheckMarkWrapper = styled.div`
  visibility: ${(props) => props.visiblility};
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.checkMarkBackgroundColor};
  background-image: url(${(props) => props.checkMarkImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: ${(props) => props.checkMarkImageSize};
`;

export const checkBoxPropsBuilder = ({
  initialEnabled,
  initalChecked,

  boxBorderRadius,
  boxBorderWidth,
  boxBorderColor,
  boxBackgroundColor,
  onBoxClick,

  boxCheckMarkBackgroundColor,
  boxCheckMarkColor,
  boxCheckMarkImageUrl,
  boxCheckMarkImageSize,

  boxCheckMarkSizePercentage,
}) => {
  const enabled = typeof initialEnabled === "boolean" ? initialEnabled : true;
  const checked = typeof initalChecked === "boolean" ? initalChecked : true;

  const borderRadius = typeof boxBorderRadius === "number" ? boxBorderRadius : 5;
  const borderWidth = typeof boxBorderWidth === "number" ? boxBorderWidth : 1;

  let borderColor = "rgba(196, 196, 196, 0.5)";
  let backgroundColor = "rgb(255, 255, 255)";
  if (enabled) {
    borderColor = typeof boxBorderColor === "string" ? boxBorderColor : "rgb(33, 150, 243)";
    backgroundColor =
      typeof boxBackgroundColor === "string" ? boxBackgroundColor : "rgb(255, 255, 255)";
  }

  const onClick = typeof onBoxClick === "function" ? onBoxClick : null;

  let checkMarkBackgroundColor = "rgba(196, 196, 196, 0.5)";
  let checkMarkColor = "rgb(255, 255, 255)";
  if (enabled) {
    checkMarkBackgroundColor =
      typeof boxCheckMarkBackgroundColor === "string"
        ? boxCheckMarkBackgroundColor
        : "rgb(33, 150, 243)";
    checkMarkColor =
      typeof boxCheckMarkColor === "string" ? boxCheckMarkColor : "rgb(255, 255, 255)";
  }

  const checkMarkImageUrl =
    typeof boxCheckMarkImageUrl === "string" ? boxCheckMarkImageUrl : checkMarkUrl;

  const checkMarkImageSize =
    typeof boxCheckMarkImageSize === "string" ? boxCheckMarkImageSize : "contain";

  const markSizePercentage =
    typeof boxCheckMarkSizePercentage === "number" &&
    boxCheckMarkSizePercentage < 1 &&
    boxCheckMarkSizePercentage > 0
      ? boxCheckMarkSizePercentage
      : 15 / 20;

  return {
    initialEnabled: enabled,
    initalChecked: checked,

    boxBorderRadius: borderRadius,
    boxBorderWidth: borderWidth,
    boxBorderColor: borderColor,
    boxBackgroundColor: backgroundColor,
    onBoxClick: onClick,

    boxCheckMarkBackgroundColor: checkMarkBackgroundColor,
    boxCheckMarkColor: checkMarkColor,
    boxCheckMarkImageUrl: checkMarkImageUrl,
    boxCheckMarkImageSize: checkMarkImageSize,

    boxCheckMarkSizePercentage: markSizePercentage,
  };
};

export default function CheckBox({
  initialEnabled,
  initalChecked,

  boxBorderRadius,
  boxBorderWidth,
  boxBorderColor,
  boxBackgroundColor,
  onBoxClick,

  boxCheckMarkBackgroundColor,
  boxCheckMarkColor,
  boxCheckMarkImageUrl,
  boxCheckMarkImageSize,

  boxCheckMarkSizePercentage,
}) {
  const [checked, setChecked] = useState(initalChecked);

  const handleBoxClick = () => {
    if (!initialEnabled) {
      return;
    }
    if (onBoxClick) {
      onBoxClick(!checked);
    }
    setChecked(!checked);
  };

  const checkMarkVisibility = checked ? "visible" : "hidden";

  return (
    <Wrapper
      // used
      borderRadius={boxBorderRadius}
      borderWidth={boxBorderWidth}
      borderColor={boxBorderColor}
      backgroundColor={boxBackgroundColor}
      enabled={initialEnabled}
      onClick={handleBoxClick}
    >
      <CheckMarkWrapper
        // used
        visiblility={checkMarkVisibility}
        checkMarkBackgroundColor={boxCheckMarkBackgroundColor}
        checkMarkImageUrl={boxCheckMarkImageUrl}
        checkMarkImageSize={boxCheckMarkImageSize}
        // unused
        borderRadius={boxBorderRadius}
        checkMarkColor={boxCheckMarkColor}
        checkMarkSizePercentage={boxCheckMarkSizePercentage}
      />
    </Wrapper>
  );
}
