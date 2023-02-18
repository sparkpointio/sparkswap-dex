import React, { useState, useCallback, useContext } from 'react'
import { Currency, Pair } from '@sparkpointio/sparkswap-sdk'
import { Button, ChevronDownIcon, Dropdown, Text, Flex } from '@sparkpointio/sparkswap-uikit'
import styled, { ThemeContext } from 'styled-components'
import ReactLoading from 'react-loading'
import { darken } from 'polished'
import { dexTheme } from 'ThemeContext'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { Input as NumericalInput } from '../NumericalInput'
import { useActiveWeb3React } from '../../hooks'
import TranslatedText from '../TranslatedText'
import { TranslateString } from '../../utils/translateTextHelpers'

const InputRow = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 34px;
  font-size: 16px;
  font-weight: 500;
  background-color: transparent;
  color: ${({ selected, theme }) => (selected ? theme.colors.text : '#FFFFFF')};
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;

  :focus,
  :hover {
    background-color: ${({ theme }) => darken(0.05, theme.colors.input)};
  }
`

const LabelRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.colors.textSubtle)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  // border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  // background-color: ${({ theme }) => theme.colors.background};
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  // border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.background};
  border: solid 1px ${dexTheme.colors.accent2};
  border-radius: 6px;
  padding: 10px 16px 8px 0;
  height: 100px;
  box-shadow: ${({ theme }) => theme.shadows.inset};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = TranslateString(132, 'Input'),
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useContext(ThemeContext)
  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id}>
      {/* <Text fontSize="14px">{label}</Text> */}
      <Container hideInput={hideInput}>
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
          {/* <CurrencySelect
            selected={!!currency}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
              ) : currency ? (
                <CurrencyLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />
              ) : null}
              {pair ? (
                <Text>
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </Text>
              ) : (
                <Text>
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                        currency.symbol.length - 5,
                        currency.symbol.length
                      )}`
                    : currency?.symbol) || <TranslatedText translationId={82}>Select a token</TranslatedText>}
                </Text>
              )}
              {!disableCurrencySelect && <ChevronDownIcon color={`${theme.colors.primary}`} />}
            </Aligner>
          </CurrencySelect> */}

          {!hideInput && (
            <>
              <NumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />

              <Flex flexDirection="column" style={{ alignItems: 'center' }}>
                {account && currency && showMaxButton && label !== 'To' ? (
                  <>
                    <Text fontSize="14px">Balance: 0.69</Text>
                    <Flex flexDirection="row" justifyContent="center" style={{ columnGap: '2px' }}>
                      <Button onClick={onMax} size="sm" variant="text" style={{ width: '20%', fontSize: '14px' }}>
                        MAX
                      </Button>
                      <CurrencySelect
                        selected={!!currency}
                        className="open-currency-select-button"
                        onClick={() => {
                          if (!disableCurrencySelect) {
                            setModalOpen(true)
                          }
                        }}
                      >
                        <Aligner>
                          {pair ? (
                            <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
                          ) : currency ? (
                            <CurrencyLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />
                          ) : null}

                          {!disableCurrencySelect && <ChevronDownIcon color={`${theme.colors.primary}`} />}
                        </Aligner>
                      </CurrencySelect>

                    </Flex>

                  </>
                ) : (
                  // To currency input panel
                  <Flex style={{ alignItems: 'center', marginRight: '16px' }}>
                    <CurrencySelect
                      selected={!!currency}
                      className="open-currency-select-button"
                      onClick={() => {
                        if (!disableCurrencySelect) {
                          setModalOpen(true)
                        }
                      }}
                    >
                      <Aligner>
                        {pair ? (
                          <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
                        ) : currency ? (
                          <CurrencyLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />
                        ) : null}
                        {pair ? (
                <Text className="token-symbol-container">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </Text>
              ) : (
                <Text className="token-symbol-container">
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                        currency.symbol.length - 5,
                        currency.symbol.length
                      )}`
                    : currency?.symbol) || <TranslatedText translationId={82}>Select a token</TranslatedText>}
                </Text>
              )}
                        {!disableCurrencySelect && <ChevronDownIcon color={`${theme.colors.primary}`} />}
                      </Aligner>
                    </CurrencySelect>
                  </Flex>
                )}
              </Flex>
            </>
          )}
        </InputRow>

      </Container>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
      {!hideInput && (
        <LabelRow>
          <RowBetween>
            {account && (
              <Text onClick={onMax} fontSize="14px" style={{ display: 'inline', cursor: 'pointer' }}>
                {/* {!hideBalance && !!currency && selectedCurrencyBalance
                  ? `Available: ${selectedCurrencyBalance?.toSignificant(6)} ${currency.symbol}`
                  : <ReactLoading type='bubbles' color={theme.colors.text} width='21px' height='21px'/>} */}
              </Text>
            )}
          </RowBetween>

        </LabelRow>
      )}

    </InputPanel>
  )
}
