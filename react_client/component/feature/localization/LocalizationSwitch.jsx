import React, { useContext } from "react";
import styled from "styled-components";

import * as localizableEnum from "constant/enum/localizable";
import DropdownSwitch, {
  dropdownSwitchOptionBuilder,
  dropdownSwitchPropsBuilder,
} from "../../generic/switch/DropdownSwitch";
import { GlobalContext } from "context/global-context";

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

const MemorizedLocalizationSwitch = React.memo(LocalizationSwitchToMemo, arePropsEqual);

function LocalizationSwitchToMemo({
  iconImageUrl,
  selectedTextColor,
  isSelectedTextKeyVisible,

  localizedStrings,
  changeLocalization,
}) {
  const EnglishOption = dropdownSwitchOptionBuilder({
    dropdownOptionName: localizedStrings[localizableEnum.key.LOCALIZATION_ENGLISH_ITEM_TEXT],
    dropdownOptionSelected: true,
    dropdownOptionOnClick: () => {
      changeLocalization(localizableEnum.type.ENGLISH);
    },
  });
  const ChineseOption = dropdownSwitchOptionBuilder({
    dropdownOptionName: localizedStrings[localizableEnum.key.LOCALIZATION_CHINESE_ITEM_TEXT],
    dropdownOptionSelected: false,
    dropdownOptionOnClick: () => {
      changeLocalization(localizableEnum.type.CHINESE);
    },
  });

  return (
    <Wrapper>
      <DropdownSwitch
        {...dropdownSwitchPropsBuilder({
          dropdownSwitchIconImageUrl: iconImageUrl,
          dropdownSwitchIconImageWidth: 25,
          dropdownSwitchSelectedOptionTextKey:
            localizedStrings[localizableEnum.key.LOCALIZATION_SELECTED_TEXT_KEY],
          dropdownSwitchSelectedOptionTextValue:
            localizedStrings[localizableEnum.key.LOCALIZATION_SELECTED_TEXT_VALUE],
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

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;