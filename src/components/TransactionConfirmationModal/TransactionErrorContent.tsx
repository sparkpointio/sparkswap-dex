import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Button, Text } from '@sparkpointio/sparkswap-uikit'
import { AlertTriangle } from 'react-feather'
import { AutoColumn } from '../Column'
import { Wrapper, Section, BottomSection, ContentHeader, OptionButton, CustomWrapper } from './helpers'

type TransactionErrorContentProps = { message: string; onDismiss: () => void }

const TransactionErrorContent = ({ message, onDismiss }: TransactionErrorContentProps) => {
  const theme = useContext(ThemeContext)
  return (
    <CustomWrapper>
      <Section>
        <ContentHeader onDismiss={onDismiss}>Error</ContentHeader>
        <AutoColumn style={{ marginTop: 30, marginBottom: 30, padding: '1rem 0' }} gap="22px" justify="center">
          <AlertTriangle color={theme.colors.failure} style={{ strokeWidth: 1.5 }} size={64} />
          <Text fontSize="16px" color="failure" style={{ textAlign: 'center', width: '85%' }}>
            {message}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <OptionButton onClick={onDismiss} style={{borderRadius: '5px'}}>Dismiss</OptionButton>
      </BottomSection>
    </CustomWrapper>
  )
}

export default TransactionErrorContent
