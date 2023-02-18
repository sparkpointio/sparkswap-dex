import React, { useContext, useMemo, useEffect } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { Pair } from '@sparkpointio/sparkswap-sdk'
import { Button, CardBody, Text, useWalletModal, ConnectorId } from '@sparkpointio/sparkswap-uikit'
import { injected, walletconnect, bsc } from 'connectors'
import { useHistory } from 'react-router-dom'
import RewardsEarned from 'components/RewardsEarned'
import { Grid } from '@mui/material'
import StepProgress from 'components/StepProgress'
import CardNav from 'components/CardNav'
import Question from 'components/QuestionHelper'
import FullPositionCard from 'components/PositionCard'
import { useUserHasLiquidityInAllTokens } from 'data/V1'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { StyledInternalLink, TYPE } from 'components/Shared'
import { LightCard } from 'components/Card'
import { RowBetween } from 'components/Row'
import { AutoColumn, LiquidityAutoColumn } from 'components/Column'
import { usePairs } from 'data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { CustomStyleCard, Dots, BG, RewardsEarnedBody, SwapButton } from 'components/swap/styleds'
import TranslatedText from 'components/TranslatedText'
import { TranslateString } from 'utils/translateTextHelpers'
import PageHeader from 'components/PageHeader'
import { dexTheme } from 'ThemeContext'
import AppBody from '../AppBody'

const StyledHr = styled.hr `
  border: 1px solid ${dexTheme.colors.accent1};
`

const { body: Body } = TYPE

export default function Pool() {
  const theme = useContext(ThemeContext)
  const history = useHistory()

  const { account, activate, deactivate } = useWeb3React()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens,
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

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
  const handleClick = () => {
    if (!account) {
      onPresentConnectModal()
    }
    return account && history.push('/add/ETH')
  }

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)
  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))
  const hasV1Liquidity = useUserHasLiquidityInAllTokens()

  React.useEffect(() => {
    document.title="Liquidity | SparkSwap";
  })

  return (
    <>
      <AppBody>
      {/* <div style={{margin: '4rem 2rem'}}>
       <StepProgress approveState={{approval}} trade={trade} swapInputError={swapInputError}/>
      </div> */}
        <CustomStyleCard>
          <CardNav activeIndex={1} />
          <PageHeader title="Add liquidity to receive LP tokens">
            <SwapButton fullWidth id="join-pool-button" onClick={handleClick}>
              <TranslatedText translationId={100}>{account ? 'Add Liquidity' : 'Connect Wallet'}</TranslatedText>
            </SwapButton>
          </PageHeader>
          <StyledHr style={{ width: '85%'}} />
          {/* <Grid item xs={12} sm={4} md={12} lg={8}>  */}
          <AutoColumn gap="lg">
            <CardBody>
              <LiquidityAutoColumn gap="12px" >
                <RowBetween>
                  <Text>
                    <TranslatedText translationId={102}>Your Liquidity</TranslatedText>
                  </Text>
                  {/* <Question
                  text={TranslateString(
                    130,
                    'When you add liquidity, you are given pool tokens that represent your share. If you don’t see a pool you joined in this list, try importing a pool below.'
                  )}
                /> */}
                </RowBetween>

                {!account ? (
                  <LightCard>
                    <Body color={theme.colors.textDisabled} textAlign="center">
                      Connect to a wallet to view your liquidity.
                    </Body>
                  </LightCard>
                ) : v2IsLoading ? (
                  <LightCard>
                    <Body color={theme.colors.textDisabled} textAlign="center">
                      <Dots>Loading</Dots>
                    </Body>
                  </LightCard>
                ) : allV2PairsWithLiquidity?.length > 0 ? (
                  <>
                    {allV2PairsWithLiquidity.map((v2Pair) => (
                      <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                    ))}
                  </>
                ) : (
                  <LightCard>
                    <Body color={theme.colors.textDisabled} textAlign="center">
                      <TranslatedText translationId={104}>No liquidity found.</TranslatedText>
                    </Body>
                  </LightCard>
                )}

                {account && (
                  <div style={{ textAlign: 'center' }}>
                    <Text fontSize="14px" style={{ padding: '.5rem 0 .5rem 0' }}>
                      {hasV1Liquidity
                        ? 'Uniswap V1 liquidity found!'
                        : TranslateString(106, 'Missing a pool in the list?')}{' '}
                      <StyledInternalLink
                        // style={{ textDecoration: 'underline' }}
                        id="import-pool-link"
                        to={hasV1Liquidity ? '/migrate/v1' : '/find'}
                      >
                        {hasV1Liquidity ? 'Migrate now.' : TranslateString(108, 'Import here.')}
                      </StyledInternalLink>
                    </Text>
                  </div>
                )}
              </LiquidityAutoColumn>
            </CardBody>
          </AutoColumn>
          {/* </Grid> */}
        </CustomStyleCard>
      </AppBody>
    </>
  )
}
