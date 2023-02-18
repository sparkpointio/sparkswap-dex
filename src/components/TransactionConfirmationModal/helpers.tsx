import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { dexTheme } from 'ThemeContext'
import { FaTimes } from 'react-icons/fa'
import { Heading, IconButton, CloseIcon, Button } from '@sparkpointio/sparkswap-uikit'
import { AutoColumn, ColumnCenter } from '../Column'


export const Wrapper = styled.div`
  width: 100%;
  overflow-y: auto;
  background-color: ${dexTheme.colors.background2};
  // border: 1px solid ${({theme}) => theme.isDark? dexTheme.colors.primary: '#FFFFFF'};
  padding: 0 10px 10px 10px;
`

export const CustomWrapper = styled.div`
  width: 100%;
  overflow-y: auto;
  min-height: 438px;
  background-color: ${dexTheme.colors.background2};
  padding: 0 10px 10px 10px;
  @media(max-width: 1000px) {
    min-height: auto;
  }
`

export const StyledWrapper = styled(Wrapper)`
  display: flex;
  min-height: 10vh;
  max-height: 30vh;
  align-items: center;
  justify-content: center;
  border: none;
`

export const CustomStyledWrapper = styled(Wrapper)`
  display: flex;
  min-height: 438px;
  align-items: center;
  justify-content: center;
  border: none;
  @media (max-width: 1000px) {
    min-height: 40vh;
    max-height: auto;
  }
`

export const Section = styled(AutoColumn)`
  padding: 15px;
  text-align: center;
`

export const ConfirmedIcon = styled(ColumnCenter)`
  padding: 40px 0;
`

export const BottomSection = styled(Section)`
  background-color: ${({ theme }) => 'transparent'};
  // display: flex;
  justify-content: center;
`

export const ContentSection = styled(Section)`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 3em;
  @media (max-width: 500px) {
    flex-direction: column;
    margin: 0 0;
  }
`

export const CustomContentSection = styled(Section)`
  display: flex;
  flex-direction:column;
  align-items: center;
`

/**
 * TODO: Remove this when modal system from the UI Kit is implemented
 */
const StyledContentHeader = styled.div`
  align-items: center;
  flex-direction: column;
  display: flex;
  // margin-bottom: 15px;
  // padding-bottom: 10px;
  & > ${Heading} {
    flex: 1;
  }
`
export const OptionButton = styled(Button)`
  border-radius: 4px;
  background: linear-gradient(to right, ${dexTheme.colors.accent2}, ${dexTheme.colors.accent1});
  // min-width: 100px;
  
`

type ContentHeaderProps = {
  children: ReactNode
  onDismiss: () => void
}

export const ContentHeader = ({ children, onDismiss }: ContentHeaderProps) => (
  <StyledContentHeader>
    <div style={{ width: '100%', textAlign: 'right' }}>
      <IconButton onClick={onDismiss} variant="text">
        <FaTimes color={dexTheme.colors.accent1} />
      </IconButton>
    </div>
    <Heading>{children}</Heading>
  </StyledContentHeader>
)
