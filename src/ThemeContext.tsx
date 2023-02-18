import React, { useState } from 'react'
import { ThemeProvider as SCThemeProvider } from 'styled-components'
import { light, dark } from '@sparkpointio/sparkswap-uikit'

const CACHE_KEY = 'IS_DARK'

export interface DexProperty {
  [key:string]: {
    [key:string]: string
  } 
}

const dexTheme: DexProperty = {
    colors: {
      navbar: '#080D14',
      accent1: '#39BEEC',
      accent2: '#0071BC',
      text1: '#FFFFFF',
      text2: '#9FA0A1',
      background1: '#161C26',
      background2: '#15151A',
      background3: '#030A14'
    },
  }

const newDark = {
  ...dark,
  dexTheme,
}


export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType>({ isDark: true, toggleTheme: () => null })

const ThemeContextProvider: React.FC = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const isDarkUserSetting = localStorage.getItem(CACHE_KEY)
    return isDarkUserSetting ? JSON.parse(isDarkUserSetting) : true
  })

  const toggleTheme = () => {
    setIsDark((prevState: any) => {
      localStorage.setItem(CACHE_KEY, JSON.stringify(!prevState))
      return !prevState
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <SCThemeProvider theme={newDark}>{children}</SCThemeProvider>
    </ThemeContext.Provider>
  )
}

export { ThemeContext, ThemeContextProvider, dexTheme }
