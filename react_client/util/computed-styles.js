function getElementComputedStyles(element) {
  if (!(element instanceof Element)) {
    return;
  }
  return getComputedStyle(element);
}

function getElementContentWidth(element) {
  if (!(element instanceof Element)) {
    return;
  }

  const computedStyles = getElementComputedStyles(element);
  return (
    element.clientWidth -
    parseFloat(computedStyles.paddingLeft) -
    parseFloat(computedStyles.paddingRight)
  );
}

function getElementContentHeight(element) {
  if (!(element instanceof Element)) {
    return;
  }

  const computedStyles = getElementComputedStyles(element);
  return (
    element.clientWidth -
    parseFloat(computedStyles.paddingLeft) -
    parseFloat(computedStyles.paddingRight)
  );
}

export { getElementComputedStyles, getElementContentWidth, getElementContentHeight };
