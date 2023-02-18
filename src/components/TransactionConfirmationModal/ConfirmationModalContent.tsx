import React from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Text } from '@sparkpointio/sparkswap-uikit';
import { Wrapper, Section, BottomSection, ContentHeader, ContentSection, CustomContentSection } from './helpers'

const ContentDiv = styled.div`
  width: 30%;
  text-align: left;
  @media (max-width: 500px) {
    text-align: center;
  }
`

type ConfirmationModalContentProps = {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}

const ConfirmationModalContent = ({ title, bottomContent, onDismiss, topContent }: ConfirmationModalContentProps) => {
  return (
    <Wrapper>
       <ContentHeader onDismiss={onDismiss}>{null}</ContentHeader>
       <CustomContentSection>
         <Text fontSize="24px">{title}</Text>
         {topContent()}
      </CustomContentSection>
      <BottomSection gap="12px">{bottomContent()}</BottomSection>
    </Wrapper>
  )
}

export default ConfirmationModalContent
