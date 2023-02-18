import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Link } from 'react-router-dom'
import { Button, ButtonMenu, ButtonMenuItem, useModal, Flex, Text, IconButton, Toggle } from '@sparkpointio/sparkswap-uikit'
import { FaInfoCircle } from 'react-icons/fa'
import { DISPLAY_STEP_PROGRESS } from 'pages/Swap/types'
import { dexTheme } from 'ThemeContext'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Grid } from '@mui/material'
import { NavIconWrapper } from 'components/swap/styleds'
import SettingsModal from 'components/PageHeader/SettingsModal'
import SettingsIcon from './Settings'
import InfoIcon from './Information'
import TranslatedText from '../TranslatedText'
import RecentTransactionsModal from '../PageHeader/RecentTransactionsModal'


const StyledNav = styled.div`
  height: 3em;
  margin: 1em 5em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  // & > * {
  //   margin: auto;
  // }
  @media (max-width: 768px) {
    margin: 1em 3em;
  }
  @media (max-width: 500px) {
    margin: auto;
  }
  @media (max-width: 280px) {
    display: flex;
    flex-direction: column;
    margin: 0 0 3em 0;
  }
`

const StyledButtonMenu = styled(ButtonMenu)`
  & {
    width: 100%;
    flex: 2;
    background-color: ${({ theme }) => theme.colors.background};
  }
`
const StyledButton = styled(Button)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSubtle};
  height: 7vh;
`
const StyledFlex = styled(Flex)`
  // background-color: ${({ theme }) => theme.colors.background};
  width: 60%;
  display: inline-flex;
  & > * {
    color: ${({ theme }) => theme.isDark && theme.colors.textSubtle};
    flex: 1;
    width: 100%;
    text-align: center;
    padding: 14.5px;
    @media (max-width: 280px) {
      padding: 14.5px 8.5px;
    }
  }
 
`

const NavIconDiv = styled(Flex)`
  display: inline-block;
  float: right;
  & > * {
    padding: 7px;
  }
`

const StyledIconButton = styled(IconButton)`
  padding: auto;
  @media (max-width: 600px) {
    padding-top: 20px;
  }
`

const Nav = ({
  activeIndex = 0,
  displayStepProgress,
  onToggle
}: {
  activeIndex?: number
  displayStepProgress?: DISPLAY_STEP_PROGRESS
  onToggle?: (mode: DISPLAY_STEP_PROGRESS) => void
}) => {
  const theme = useContext(ThemeContext)
  const muitheme = useTheme()
  const mobileScreen = useMediaQuery(muitheme.breakpoints.up('sm'))
  const size = mobileScreen? 'md' : 'sm'
  const [onPresentRecentTransactions] = useModal(<RecentTransactionsModal />)
  const [onPresentSettings] = useModal(<SettingsModal />)
  const handleToggle = (mode: DISPLAY_STEP_PROGRESS) => {
    if ((displayStepProgress !== mode) && (onToggle)) {
      onToggle(mode)
    }
  }

  const NavGroup = () => {
    return (
      <NavIconDiv>
        <StyledIconButton variant="text" onClick={onPresentSettings} title="Settings" size={size}>
          <SettingsIcon />
        </StyledIconButton>
        <StyledIconButton variant="text" size={size} onClick={() => {
          if (displayStepProgress === DISPLAY_STEP_PROGRESS.ENABLE) {
            handleToggle(DISPLAY_STEP_PROGRESS.DISABLE)
          } else {
            handleToggle(DISPLAY_STEP_PROGRESS.ENABLE)
          }
        }} title="Toggle Step Progress">
          <InfoIcon />
        </StyledIconButton>
      </NavIconDiv>
    )
  }

  return (
    // <Grid container md={12} lg={12}>
    <StyledNav>
      <StyledFlex>
        {/* <Link  to="/swap" style={{backgroundColor: activeIndex === 0 ? theme.colors.primary: 'transparent'}}> */}
        <Link
          to="/swap"
          style={
            activeIndex === 0
              ? { borderBottom: `3px solid ${dexTheme.colors.accent1}`, color: '#FFFFFF' }
              : { color: 'textSubtle' }
          }
        >
          Swap
        </Link>
        {/* <Link  id="pool-nav-link" to="/pool" style={{backgroundColor: activeIndex === 1 ? theme.colors.primary: 'transparent'}}> */}
        <Link
          id="pool-nav-link"
          to="/liquidity"
          style={
            activeIndex === 1
              ? { borderBottom: `3px solid ${dexTheme.colors.accent1}`, color: '#FFFFFF' }
              : { color: 'textSubtle' }
          }
        >
          Liquidity
        </Link>
        {/* <Link  id="history-nav-link" to="/history" style={{backgroundColor: activeIndex === 2 ? theme.colors.primary: 'transparent'}}> */}
        <Link
          id="history-nav-link"
          to="/history"
          style={
            activeIndex === 2
              ? { borderBottom: `3px solid ${dexTheme.colors.accent1}`, color: '#FFFFFF' }
              : { color: 'textSubtle' }
          }
        >
          Transactions
        </Link>

        {/* <Link id="history-nav-link" to="/history">
      <FaInfoCircle />
      </Link> */}
      </StyledFlex>
      {activeIndex === 0 &&
        NavGroup()
      }
    </StyledNav>
    // </Grid>
  )
}

export default Nav
