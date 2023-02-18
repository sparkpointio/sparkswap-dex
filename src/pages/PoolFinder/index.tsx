import { Currency, ETHER, JSBI, TokenAmount } from '@sparkpointio/sparkswap-sdk'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import { Button, AddIcon, CardBody, Text } from '@sparkpointio/sparkswap-uikit'
import CardNav from 'components/CardNav'
import Card, { LightCard } from 'components/Card'
import { AutoColumn, ColumnCenter } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { ChevronDownIcon } from 'components/PositionCard/CustomChevron'
import { FindPoolTabs } from 'components/NavigationTabs'
import { MinimalPositionCard } from 'components/PositionCard'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { PairState, usePair } from 'data/Reserves'
import { dexTheme } from 'ThemeContext'
import RewardsEarned from 'components/RewardsEarned'
import { useActiveWeb3React } from 'hooks'
import { usePairAdder } from 'state/user/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { StyledButtonLink, StyledInternalLink } from 'components/Shared'
import { currencyId } from 'utils/currencyId'
import TranslatedText from 'components/TranslatedText'
import { CustomStyleCard, BG, SwapButton, RewardsEarnedBody } from 'components/swap/styleds'
import styled, { ThemeContext } from 'styled-components'
import AppBody from '../AppBody'
import { Dots } from '../Pool/styleds'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

const StyledCurrencyGroup = styled.div`
  display: flex;
  margin-bottom: 10px;
  column-gap: 50px;
  @media (max-width: 400px) {
    flex-wrap: wrap;
    column-gap: 10px;
  }
`

const CustomCardBody = styled(CardBody)`
  margin: 0 3em;
  @media (max-width: 500px) {
    margin: auto;
  }
`

const StyledInfoText = styled(Text)`
  text-align: center;
  margin: 0 0 2em 0;
`

const CustomButton = styled(Button)`
  background: ${dexTheme.colors.background3};
  border: 1px solid ${dexTheme.colors.accent2};
  border-radius: 6px;
  justify-content: flex-start;
  width: 100%;
  @media (max-width: 500px) {
    width: 48%;
  }
`

export default function PoolFinder() {
  const { account } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

  const [currency0, setCurrency0] = useState<Currency | null>(ETHER)
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0))
    )

  const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)))

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField]
  )

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false)
  }, [setShowSearch])

  const prerequisiteMessage = (
    <LightCard padding="45px 10px">
      <Text style={{ textAlign: 'center' }}>
        {!account ? 'Connect to a wallet to find pools' : 'Select a token to find your liquidity.'}
      </Text>
    </LightCard>
  )

  return (
    <>
    {/* <BG> */}
      <AppBody>
        {/* <RewardsEarnedBody>
          <RewardsEarned/>
        </RewardsEarnedBody> */}
        <CustomStyleCard>
        <CardNav activeIndex={1} />
          <FindPoolTabs />
          <CustomCardBody>
            <AutoColumn gap="md">
              <StyledCurrencyGroup>
                <CustomButton
                  onClick={() => {
                    setShowSearch(true)
                    setActiveField(Fields.TOKEN0)
                  }}
                  startIcon={currency0 ? <CurrencyLogo currency={currency0} style={{ marginRight: '1rem' }} /> : null}
                  endIcon={
                    <div style={{ marginLeft: '1rem' }}>
                      <ChevronDownIcon />
                    </div>
                  }
                  fullWidth
                >
                  {currency0 ? currency0.symbol : <TranslatedText translationId={82}>Select a Token</TranslatedText>}
                </CustomButton>

                {/* <ColumnCenter>
                  <AddIcon color="primary" style={{ width: '50px' }} />
                </ColumnCenter> */}

                <CustomButton
                  onClick={() => {
                    setShowSearch(true)
                    setActiveField(Fields.TOKEN1)
                  }}
                  startIcon={currency1 ? <CurrencyLogo currency={currency1} style={{ marginRight: '1rem' }} /> : null}
                  endIcon={
                    <div style={{ marginLeft: '1rem' }}>
                      <ChevronDownIcon />
                    </div>
                  }
                  fullWidth
                >
                  {currency1 ? currency1.symbol : <TranslatedText translationId={82}>Select a Token</TranslatedText>}
                </CustomButton>
              </StyledCurrencyGroup>
              {hasPosition && (
                <ColumnCenter
                  style={{ justifyItems: 'center', backgroundColor: '', padding: '12px 0px', borderRadius: '12px' }}
                >
                  <Text style={{ textAlign: 'center' }}>Pool Found!</Text>
                </ColumnCenter>
              )}

              {currency0 && currency1 ? (
                pairState === PairState.EXISTS ? (
                  !hasPosition &&
                  pair && (
                    <Card padding="45px 0">
                      <AutoColumn gap="sm" justify="center">
                        <StyledInfoText>You don’t have liquidity in this pool yet.</StyledInfoText>

                        <StyledButtonLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                          <Text style={{ textAlign: 'center' }}>
                            <TranslatedText translationId={100}>Add Liquidity</TranslatedText>
                          </Text>
                        </StyledButtonLink>
                      </AutoColumn>
                    </Card>
                  )
                ) : validPairNoLiquidity ? (
                  <Card padding="45px 10px">
                    <AutoColumn gap="sm" justify="center">
                      <Text style={{ textAlign: 'center' }}>No pool found.</Text>
                      <StyledButtonLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                        Create pool.
                      </StyledButtonLink>
                    </AutoColumn>
                  </Card>
                ) : pairState === PairState.INVALID ? (
                  <Card padding="45px 10px">
                    <AutoColumn gap="sm" justify="center">
                      <Text style={{ textAlign: 'center' }}>
                        <TranslatedText translationId={136}>Invalid pair.</TranslatedText>
                      </Text>
                    </AutoColumn>
                  </Card>
                ) : pairState === PairState.LOADING ? (
                  <Card padding="45px 10px">
                    <AutoColumn gap="sm" justify="center">
                      <Text style={{ textAlign: 'center' }}>
                        Loading
                        <Dots />
                      </Text>
                    </AutoColumn>
                  </Card>
                ) : null
              ) : (
                prerequisiteMessage
              )}
            </AutoColumn>

            <CurrencySearchModal
              isOpen={showSearch}
              onCurrencySelect={handleCurrencySelect}
              onDismiss={handleSearchDismiss}
              showCommonBases
              selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
            />
          </CustomCardBody>
        </CustomStyleCard>
      </AppBody>
      {currency0 && currency1 && pairState === PairState.EXISTS && hasPosition && pair && (
        <AppBody>
          <CustomStyleCard>
            <MinimalPositionCard pair={pair} />
          </CustomStyleCard>
        </AppBody>
      )}
      {/* </BG> */}
    </>
  )
}
