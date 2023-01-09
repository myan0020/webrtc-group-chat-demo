import React, { useContext } from "react";
import styled from "styled-components";

import { localeTypeEnum, localizableStringKeyEnum } from "../../../resource/string/localizable-strings";
import DropdownSwitch, {
  dropdownSwitchOptionBuilder,
  dropdownSwitchPropsBuilder,
} from "../../generic/switch/DropdownSwitch";
import { GlobalContext } from "../../../context/global-context";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

function LocalizationSwitchToMemo({
  iconImageUrl,
  selectedTextColor,
  isSelectedTextKeyVisible,

  localizedStrings,
  changeLocalization,
}) {
  const EnglishOption = dropdownSwitchOptionBuilder({
    dropdownOptionName: localizedStrings[localizableStringKeyEnum.LOCALIZATION_ENGLISH_ITEM_TEXT],
    dropdownOptionSelected: true,
    dropdownOptionOnClick: () => {
      changeLocalization(localeTypeEnum.ENGLISH);
    },
  });
  const ChineseOption = dropdownSwitchOptionBuilder({
    dropdownOptionName: localizedStrings[localizableStringKeyEnum.LOCALIZATION_CHINESE_ITEM_TEXT],
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

const arePropsEqual = (prevProps, nextProps) => {
  const isIconImageUrlEqual = Object.is(prevProps.iconImageUrl, nextProps.iconImageUrl);
  const isSelectedTextColorEqual = Object.is(
    prevProps.selectedTextColor,
    nextProps.selectedTextColor
  );
  const isIsSelectedTextKeyVisibleEqual = Object.is(
    prevProps.isSelectedTextKeyVisible,
    nextProps.isSelectedTextKeyVisible
  );
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isChangeLocalizationEqual = Object.is(
    prevProps.changeLocalization,
    nextProps.changeLocalization
  );
  return (
    isIconImageUrlEqual &&
    isSelectedTextColorEqual &&
    isIsSelectedTextKeyVisibleEqual &&
    isLocalizedStringEqual &&
    isChangeLocalizationEqual
  );
};

const MemorizedLocalizationSwitch = React.memo(LocalizationSwitchToMemo, arePropsEqual);

export default function LocalizationSwitch({
  iconImageUrl,
  selectedTextColor,
  isSelectedTextKeyVisible,
}) {
  const { localizedStrings, changeLocalization } = useContext(GlobalContext);
  return (
    <MemorizedLocalizationSwitch
      iconImageUrl={iconImageUrl}
      selectedTextColor={selectedTextColor}
      isSelectedTextKeyVisible={isSelectedTextKeyVisible}
      localizedStrings={localizedStrings}
      changeLocalization={changeLocalization}
    />
  );
}
