import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@sparkpointio/sparkswap-uikit'
import { Spinner } from '../Shared'
import { AutoColumn } from '../Column'
import Circle from '../../assets/images/blue-loader.svg'
import { Wrapper, Section, ConfirmedIcon, ContentHeader, StyledWrapper, CustomStyledWrapper } from './helpers'

type ConfirmationPendingContentProps = { onDismiss: () => void; pendingText: string }

const CustomLightSpinner = styled(Spinner)<{ size: string }>`
  height: ${({ size }) => size};
  width: ${({ size }) => size};
`

const ConfirmationPendingContent = ({ onDismiss, pendingText }: ConfirmationPendingContentProps) => {
  return (
    <CustomStyledWrapper>
      <Section >
          <AutoColumn gap="12px" justify="center">
            <Text fontSize="24px" bold>
              Wallet Confirmation Details
            </Text>
          </AutoColumn>
      </Section>
    </CustomStyledWrapper>
  )
}

export default ConfirmationPendingContent
