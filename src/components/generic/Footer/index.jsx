import React, {useContext} from 'react';

import { ThemeContext } from '../../contexts/theme-context';

export default function Footer() {
  const { theme } = useContext(ThemeContext)

  return (
    <>
      <h3 style={{ color: theme.headerTextColor }}>Footer</h3>
    </>
  )
}