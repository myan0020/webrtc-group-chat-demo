import React, { useContext } from "react";
import styled from "styled-components";

import { LocalizationContext } from "../../../context/localization-context.js";
import { localeTypeEnum, localizableStringKeyEnum } from "../../../util/localizable-strings.js";
import DropdownSwitch, {
  dropdownSwitchOptionBuilder,
  dropdownSwitchPropsBuilder,
} from "./../../generic/switch/DropdownSwitch.jsx";
import globalImageUrl from "./images/gobal_3x.png";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export default function LocalizationSwitch({}) {
  const { localizedStrings, changeLocalization } = useContext(LocalizationContext);

  const EnglishOption = dropdownSwitchOptionBuilder({
    dropdownOptionName:
      localizedStrings[localizableStringKeyEnum.NAVIGATION_LOCALIZATION_ENGLISH_ITEM_TEXT],
    dropdownOptionSelected: true,
    dropdownOptionOnClick: () => {
      changeLocalization(localeTypeEnum.ENGLISH);
    },
  });
  const ChineseOption = dropdownSwitchOptionBuilder({
    dropdownOptionName:
      localizedStrings[localizableStringKeyEnum.NAVIGATION_LOCALIZATION_CHINESE_ITEM_TEXT],
    dropdownOptionSelected: false,
    dropdownOptionOnClick: () => {
      changeLocalization(localeTypeEnum.CHINESE);
    },
  });

  return (
    <Wrapper>
      <DropdownSwitch
        {...dropdownSwitchPropsBuilder({
          dropdownSwitchIconImageUrl: globalImageUrl,
          dropdownSwitchIconImageWidth: 35,
          dropdownSwitchSelectedOptionText:
            localizedStrings[localizableStringKeyEnum.NAVIGATION_LOCALIZATION_SELECTED_TEXT],
          dropdownSwitchOptions: [EnglishOption, ChineseOption],
        })}
      />
    </Wrapper>
  );
}
