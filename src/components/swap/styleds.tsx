import { transparentize } from 'polished'
import React from 'react'
import { AlertTriangle } from 'react-feather'
// import { isMobile } from 'react-device-detect'
import { Text, CardBody, Button } from '@sparkpointio/sparkswap-uikit'
import { dexTheme } from 'ThemeContext'
import { StyledContainer } from 'pages/SparkSwapWebsite/components/styles/Containers'
import styled, { css } from 'styled-components'
import { AutoColumn } from '../Column'

export const Wrapper = styled.div`
  position: relative;
  background-color: red;
`

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  padding: 2px;
  margin-bottom: 12px;
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            // opacity: 0.8;
            // transform: scale(1.1);
          }
        `
      : null}
`

export const NavIconWrapper = styled.div<{ clickable: boolean }>`
  padding: 2px;
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
          }
        `
      : null}
`

export const SectionBreak = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.tertiary};
`

export const BottomGrouping = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  // border: 1px solid blue;
  padding: 0px 50px 0px 50px;
  @media (max-width: 500px) {
    padding: 0 10px;
  }
`

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.colors.failure
      : severity === 2
      ? theme.colors.binance
      : severity === 1
      ? theme.colors.text
      : theme.colors.success};
`

export const StyledBalanceMaxMini = styled.button`
  height: 22px;
  width: 22px;
  background-color: ${({ theme }) => theme.colors.invertedContrast};
  border: none;
  border-radius: 50%;
  padding: 0.2rem;
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 0.4rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSubtle};
  display: flex;
  justify-content: center;
  align-items: center;
  float: right;

  :hover {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }
  :focus {
    background-color: ${({ theme }) => theme.colors.tertiary};
    outline: none;
  }
`

export const TruncatedText = styled(Text)`
  text-overflow: ellipsis;
  width: 220px;
  overflow: hidden;
`

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

const SwapCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.colors.failure)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.colors.failure};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.colors.failure)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

export function SwapCallbackError({ error }: { error: string }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p>{error}</p>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.9, theme.colors.primary)};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.5rem;
  border-radius: 5px;
  margin-top: 8px;
`

export const CustomStyleCard = styled.div`
  // border: 2px solid ${({ theme }) => (theme.isDark ? theme.colors.primary : '#FFFFFF')};
  border: 1px solid ${({ theme }) => (theme.isDark ? dexTheme.colors.accent1 : '#FFFFFF')};
  // background-color: ${({ theme }) => (theme.isDark ? "#191B1F" : '#FFFFFF')};
  background: rgba(25, 27, 31, .3);
  backdrop-filter: blur(2px);
  min-height: 35vh;
  // padding: 0 3em 0 3em;
  @media (max-width: 1000px) {
    margin: 0 1em;
  }
  @media (max-width: 280px) {
    width: auto;
    // margin: 0 .6em;
  }
`

export const StyledCardBody = styled(CardBody)`
  display: flex;
  flex-direction: column;
  min-height: 50vmin;
  // border: 2px solid ${({ theme }) => (theme.isDark ? theme.colors.primary : '#FFFFFF')};
  justify-content: space-between;
  // background-color: ${({ theme }) => (theme.isDark ? theme.colors.background : '#FFFFFF')};
  @media ( max-width: 768px) {
    flex-direction: column;
    padding: 0;
    margin: 1em 0;
    width: 100%;
  }
`

export const RewardsEarnedBody = styled(CardBody)`
  border: 1px solid ${({ theme }) => (theme.isDark ? dexTheme.colors.accent1 : '#FFFFFF')};
  justify-content: space-between;
  background: rgba(25, 27, 31, .3);
  backdrop-filter: blur(2px);
  padding: 1em 5em;
  max-width: 1024px;
  width: 100%;
  margin: 0 0 0 0;
  // background-color: ${({ theme }) => (theme.isDark ? theme.colors.background : '#FFFFFF')};
  @media ( max-width: 1000px ) {
    width: 96%;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
    margin: auto;
    width: 92%;
  }
  @media (max-width: 280px) {
    width: 90%;
    margin: 0 .6em;
  }
`

export const SwapDetailsBody = styled(CardBody)`
  display: block;
  flex-direction: column;
  min-height: 10vmin;
  margin: 2em 0em;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => (theme.isDark ? dexTheme.colors.accent1 : '#FFFFFF')};
  justify-content: space-between;
  background-color: ${({ theme }) => (theme.isDark ? theme.colors.background : '#FFFFFF')};
  @media ( max-width: 768px) {
    flex-direction: column;
    padding: 20px;
  }
`

export const SparkDetailsBody = styled(CardBody)`
  display: flex;
  flex-direction: column;
  min-height: 10vmin;
  margin-bottom: 2em;
  border: 1px solid ${({ theme }) => (theme.isDark ? dexTheme.colors.accent1 : '#FFFFFF')};
  justify-content: space-between;
  // background-color: ${({ theme }) => (theme.isDark ? theme.colors.background : '#FFFFFF')};
  @media ( max-width: 768px) {
    flex-direction: column;
    padding: 0;
  }
  // background: rgba(25, 27, 31, .3);
  // backdrop-filter: blur(2px);
`

export const StyledAutoColumn = styled(AutoColumn)`
  flex: 1;
  padding: 0 50px 0 50px;
  // border: 1px solid red;
  @media (max-width: 500px) {
    padding: 10px 10px 0 10px;
  }
`

export const StyledSwapDetails = styled.div`
  padding-top: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  // border: 1px solid green;
`

export const StyledSwapButtonGroup = styled.div`
  width: 100%;
  // margin-bottom: 40px;
  // @media ( min-width: 2560px ){ 
  //   margin-bottom: 55px;
  // }
`
export const StyledConnectButtonGroup = styled.div`
  padding-top: 20px;
  @media ( min-width: 2560px){
    margin-bottom: -13px;
  }
`

export const BG = styled(StyledContainer)`
  background: url('/images/Website/hero-bg.png');
  background-color: ${dexTheme.colors.background1};
  background-blend-mode: overlay;
  padding: 3rem 0 8rem 0;
  min-height: 80vh;
  // justify-content: start;
  position: relative;
`

export const SwapButton = styled(Button)`
  background: linear-gradient(to right, ${dexTheme.colors.accent2}, ${dexTheme.colors.accent1});
  border-radius: 4px;
  margin: 0 0 0 0;
`