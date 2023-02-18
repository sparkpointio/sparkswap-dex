import React, {Fragment, useContext} from 'react'
import {Trade, TradeType} from '@sparkpointio/sparkswap-sdk'
import {Link, Text} from '@sparkpointio/sparkswap-uikit'
import styled, {ThemeContext} from 'styled-components'
import {ChevronRight} from 'react-feather'
import {dexTheme} from 'ThemeContext'
import {MouseoverTooltip} from 'components/Tooltip'
import {Field} from '../../state/swap/actions'
import {useUserSlippageTolerance} from '../../state/user/hooks'
import {computeSlippageAdjustedAmounts, computeTradePriceBreakdown} from '../../utils/prices'
import CurrencyLogo from '../CurrencyLogo'
import {AutoColumn} from '../Column'
import {RowBetween, RowFixed} from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'

const StyledLink = styled(Link)`
  color: ${dexTheme.colors.accent1};
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`

const SwapDetailsHeading = styled(Text)`
  display: inline-flex;
  font-size: 12px;
`

const SwapDetailsValue = styled(Text)`
  font-size: 14px;
  display: inline-flex;
  float: right;
  @media (max-width: 500px) {
    float: auto;
  }
`

function TradeSummary({trade, allowedSlippage}: { trade: Trade; allowedSlippage: number }) {
    const {priceImpactWithoutFee, realizedLPFee} = computeTradePriceBreakdown(trade)
    const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
    const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)
    const theme = useContext(ThemeContext)

    const rewardTokenRate = true;
    const reward_token = 'Reward Coin'
    const fee_token = 'BNB'
    const helpLink = <StyledLink href="#">[?]</StyledLink>

    return (
        //   <Card style={{backgroundColor: 'transparent'}}>
        //     <CardBody style={{lineHeight: '30px', display: 'flex', flexDirection: 'column', height:'auto'}}>
        <div style={{display: 'flex', flexDirection: 'column', height: 'auto', justifyContent: 'space-between'}}>

            <RowBetween>
                <RowFixed>
                    {isExactIn ? <SwapDetailsHeading>Minimum received &nbsp;
                            <MouseoverTooltip
                                text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.">
                                <StyledLink>[?]</StyledLink>
                            </MouseoverTooltip>
                        </SwapDetailsHeading> :
                        <SwapDetailsHeading>Maximum sold</SwapDetailsHeading>}
                    {/* <SwapDetailsHeading fontSize="12px">{isExactIn ? 'Minimum received' : 'Maximum sold'}</SwapDetailsHeading> */}
                    {/* <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." /> */}
                </RowFixed>
                <RowFixed>
                    <SwapDetailsValue>
                        {isExactIn
                            ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                            '-'
                            : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ?? '-'}
                    </SwapDetailsValue>
                </RowFixed>
            </RowBetween>

            <RowBetween>
                <RowFixed>
                    <SwapDetailsHeading>Price Impact &nbsp;
                        <MouseoverTooltip
                            text="The difference between the market price and estimated price due to trade size.">
                            <StyledLink>[?]</StyledLink>
                        </MouseoverTooltip>
                    </SwapDetailsHeading>
                    {/* <QuestionHelper text="The difference between the market price and estimated price due to trade size." /> */}
                </RowFixed>
                <RowFixed>
                    <FormattedPriceImpact priceImpact={priceImpactWithoutFee}/>
                </RowFixed>
            </RowBetween>

            <RowBetween>
                <RowFixed>
                    <SwapDetailsHeading>Rate</SwapDetailsHeading>
                </RowFixed>
                <RowFixed>
                    <SwapDetailsValue>{`${trade.executionPrice.invert().toSignificant(6)} ${trade.inputAmount.currency.symbol} / ${
                        trade.outputAmount.currency.symbol
                    }`}</SwapDetailsValue>
                </RowFixed>
            </RowBetween>

            <RowBetween>
                <RowFixed>
                    <SwapDetailsHeading>Inverse Rate</SwapDetailsHeading>
                </RowFixed>
                <RowFixed>
                    <SwapDetailsValue>{`${trade.executionPrice.toSignificant(6)} ${trade.outputAmount.currency.symbol} / ${
                        trade.inputAmount.currency.symbol
                    }`}</SwapDetailsValue>
                </RowFixed>
            </RowBetween>

            <RowBetween>
                <RowFixed>
                    <SwapDetailsHeading>Trade Fee</SwapDetailsHeading>
                    {/* <QuestionHelper text="For each trade a total of .20% is charged, .17% goes to liquidity providers as incentive while the other .03% goes to SparkSwap treasury." /> */}
                </RowFixed>
                <RowFixed>
                    <SwapDetailsValue>{realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}</SwapDetailsValue>
                </RowFixed>
            </RowBetween>

            {/* <RowBetween>
        <RowFixed>
          <SwapDetailsHeading>Reward Earned</SwapDetailsHeading>
        </RowFixed>
        <RowFixed>
          <SwapDetailsValue>{rewardTokenRate ? `0.069 ${reward_token}` : '-'}</SwapDetailsValue>
        </RowFixed>
      </RowBetween> */}

            <RowBetween>
                <RowFixed>
                    <SwapDetailsHeading>Route</SwapDetailsHeading>
                </RowFixed>
                <RowFixed>
                    {/* <CurrencyLogo currency={trade.inputAmount.currency} size="24px" />
           <ArrowRight size="16" color={theme.colors.textSubtle} style={{ margin: '0 12px 0 12px', minWidth: '16px' }} />
           <CurrencyLogo currency={trade.outputAmount.currency} size="24px" /> */}
                    {trade.route.path.map((token, i, path) => {
                        const isLastItem: boolean = i === path.length - 1
                        return (
                            <Fragment key={token.symbol}>
                                <CurrencyLogo currency={token} size="1.5rem"/>
                                {/* <Black fontSize={14} color={theme.colors.text} ml="0.5rem">
                  {token.symbol}
                </Black> */}
                                {isLastItem ? null : <ChevronRight color={theme.colors.textSubtle}/>}
                            </Fragment>
                        )
                    })}
                </RowFixed>
            </RowBetween>
        </div>
    )
}

export interface AdvancedSwapDetailsProps {
    trade?: Trade
}

export function AdvancedSwapDetails({trade}: AdvancedSwapDetailsProps) {
    const [allowedSlippage] = useUserSlippageTolerance()

    const showRoute = Boolean(trade && trade.route.path.length > 2)

    return (
        <AutoColumn gap="md">
            {trade && (
                <>
                    <TradeSummary trade={trade} allowedSlippage={allowedSlippage}/>
                    {/* {showRoute && (
            <>
              <SectionBreak />
              <AutoColumn style={{ padding: '0 24px' }}>
                <RowFixed>
                  <Text fontSize="14px">Route</Text>
                  <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
                </RowFixed>
                <SwapRoute trade={trade} />
              </AutoColumn>
            </>
          )} */}
                </>
            )}
        </AutoColumn>
    )
}
