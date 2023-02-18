import React from 'react'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { dexTheme } from 'ThemeContext'
import { Button, ButtonProps, ConnectorId, useWalletModal } from '@sparkpointio/sparkswap-uikit'
import { injected, walletconnect, bsc } from 'connectors'
import useI18n from 'hooks/useI18n'

const SwapButton = styled(Button)`
  background: linear-gradient(to right, ${dexTheme.colors.accent2}, ${dexTheme.colors.accent1});
  border-radius: 4px;
  margin: 0 0 0 0;
  // height: 58px;
  @media (max-width: 500px) {
    font-size: 12px;
  }
`

const UnlockButton: React.FC<ButtonProps> = props => {
  const TranslateString = useI18n()
  const { account, activate, deactivate } = useWeb3React()

  const handleLogin = (connectorId: ConnectorId) => {
    if (connectorId === 'walletconnect') {
      return activate(walletconnect)
    }
    if (connectorId === 'bsc') {
      return activate(bsc)
    }
    return activate(injected)
  }

  const { onPresentConnectModal } = useWalletModal(handleLogin, deactivate, account as string)

  return (
    <SwapButton onClick={onPresentConnectModal} {...props}>
      {TranslateString(292, 'Connect')}
    </SwapButton>
  )
}

export default UnlockButton
