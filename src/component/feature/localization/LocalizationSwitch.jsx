import React, { useContext } from "react";
import styled from "styled-components";

import { LocalizationContext } from "context/localization-context";
import { localeTypeEnum, localizableStringKeyEnum } from "resource/string/localizable-strings";
import DropdownSwitch, {
  dropdownSwitchOptionBuilder,
  dropdownSwitchPropsBuilder,
} from "../../generic/switch/DropdownSwitch";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export default function LocalizationSwitch({
  iconImageUrl,
  selectedTextColor,
  isSelectedTextKeyVisible,
}) {
  const { localizedStrings, changeLocalization } = useContext(LocalizationContext);

  const EnglishOption = dropdownSwitchOptionBuilder({
    dropdownOptionName:
      localizedStrings[localizableStringKeyEnum.LOCALIZATION_ENGLISH_ITEM_TEXT],
    dropdownOptionSelected: true,
    dropdownOptionOnClick: () => {
      changeLocalization(localeTypeEnum.ENGLISH);
    },
  });
  const ChineseOption = dropdownSwitchOptionBuilder({
    dropdownOptionName:
      localizedStrings[localizableStringKeyEnum.LOCALIZATION_CHINESE_ITEM_TEXT],
    dropdownOptionSelected: false,
    dropdownOptionOnClick: () => {
      changeLocalization(localeTypeEnum.CHINESE);
    },
  });

  return (
    <Wrapper>
      <DropdownSwitch
        {...dropdownSwitchPropsBuilder({
          dropdownSwitchIconImageUrl: iconImageUrl,
          dropdownSwitchIconImageWidth: 25,
          dropdownSwitchSelectedOptionTextKey:
            localizedStrings[localizableStringKeyEnum.LOCALIZATION_SELECTED_TEXT_KEY],
          dropdownSwitchSelectedOptionTextValue:
            localizedStrings[localizableStringKeyEnum.LOCALIZATION_SELECTED_TEXT_VALUE],
          dropdownSwitchSelectedOptionTextColor: selectedTextColor,
          dropdownSwitchSelectedTextKeyVisible: isSelectedTextKeyVisible,
          dropdownSwitchOptions: [EnglishOption, ChineseOption],
        })}
      />
    </Wrapper>
  );
}
