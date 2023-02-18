import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Trade, TradeType } from '@sparkpointio/sparkswap-sdk'
import { Button, Text } from '@sparkpointio/sparkswap-uikit'
import { ArrowDown, AlertTriangle } from 'react-feather'

import { Field } from '../../state/swap/actions'
import { TYPE } from '../Shared'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed, ToRowFixed } from '../Row'
import { SwapShowAcceptChanges } from './styleds'

const { main: Main } = TYPE

const PriceInfoText = styled(Text)`
  font-style: italic;
  line-height: 1.3;

  span {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`

const PriceHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  margin: 0 50px;
  @media (max-width: 500px) {
    margin: 0 0;
    align-items: center;
  }
`

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: Trade
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage,
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap="md">
      <PriceHeader>
        <RowFixed gap="0px" style={{ margin: '3px' }}>
          <CurrencyLogo currency={trade.inputAmount.currency} size="32px" style={{ marginRight: '12px' }} />
          <Text
            // fontSize="18px"
            fontSize="24px"
            bold
            color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.colors.primary : 'text'}
          >
            {trade.inputAmount.toSignificant(6)}
          </Text>
          <Text fontSize="24px" bold style={{ marginLeft: '5px'}}>
            {trade.inputAmount.currency.symbol}
          </Text>
        </RowFixed>

        <ToRowFixed>
          <Text bold>to</Text>
        </ToRowFixed>

        <RowFixed gap="0px" style={{margin: '3px'}}> 
          <CurrencyLogo currency={trade.outputAmount.currency} size="32px" style={{ marginRight: '12px' }} />
          <Text
            // fontSize="18px"
            fontSize="24px"
            bold
            style={{ marginLeft: '5px'}}
            // color={
            //   priceImpactSeverity > 2
            //     ? theme.colors.failure
            //     : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
            //     ? theme.colors.primary
            //     : 'text'
            // }
          >{trade.outputAmount.toSignificant(6)}
          </Text>
          <Text fontSize="24px" bold style={{ marginLeft: '10px'}}>
            {trade.outputAmount.currency.symbol}
          </Text>
        </RowFixed>
      </PriceHeader>
      {/* {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap="0px">
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <Main color={theme.colors.primary}> Price Updated</Main>
            </RowFixed>
            <Button onClick={onAcceptChanges}>Accept</Button>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null} */}
      {/* <AutoColumn justify="flex-start" gap="sm" style={{ padding: '16px 0 0' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <PriceInfoText>
            {`Output is estimated. You will receive at least `}
            <span>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </span>
            {' or the transaction will revert.'}
          </PriceInfoText>
        ) : (
          <PriceInfoText>
            {`Input is estimated. You will sell at most `}
            <span>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </span>
            {' or the transaction will revert.'}
          </PriceInfoText>
        )}
      </AutoColumn> */}
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '16px 0 0' }}>
          <Main>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </Main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
