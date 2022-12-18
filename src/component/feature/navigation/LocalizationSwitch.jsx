import React, { useContext } from "react";
import styled from "styled-components";

import { LocalizationContext } from "context/localization-context";
import { localeTypeEnum, localizableStringKeyEnum } from "resource/string/localizable-strings";
import DropdownSwitch, {
  dropdownSwitchOptionBuilder,
  dropdownSwitchPropsBuilder,
} from "./../../generic/switch/DropdownSwitch";
import globalImageUrl from "resource/image/gobal_3x.png";

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
