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

type CustomConfirmationModalContentProps = {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}

const CustomConfirmationModalContent = ({ title, bottomContent, onDismiss, topContent }: CustomConfirmationModalContentProps) => {
  return (
    <Wrapper>
       <ContentHeader onDismiss={onDismiss}>{null}</ContentHeader>
       <ContentSection>
        <ContentDiv>
          <Text fontSize="24px" bold>{title}</Text>
        </ContentDiv>
         {/*
        <div style={{ width: '100%'}}> */}
          {topContent()}
        {/* </div> */}
      </ContentSection>
      <BottomSection gap="12px">{bottomContent()}</BottomSection>
    </Wrapper>
  )
}

export default CustomConfirmationModalContent
