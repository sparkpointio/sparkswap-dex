import React, {useCallback, useContext, useState} from 'react'
import {Currency, Pair} from '@sparkpointio/sparkswap-sdk'
import {Button, ChevronDownIcon, Flex, Text} from '@sparkpointio/sparkswap-uikit'
import styled, {ThemeContext} from 'styled-components'
import ReactLoading from 'react-loading'
import {darken} from 'polished'
import {dexTheme} from 'ThemeContext'
import {useCurrencyBalance} from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import {RowBetween} from '../Row'
import {Input as CustomNumericalInput} from '../CustomNumericalInput'
import {useActiveWeb3React} from '../../hooks'
import TranslatedText from '../TranslatedText'
import {TranslateString} from '../../utils/translateTextHelpers'

const InputRow = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: ${({selected}) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 34px;
  font-size: 16px;
  font-weight: 500;
  background-color: transparent;
  color: ${({selected, theme}) => (selected ? theme.colors.text : '#FFFFFF')};
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;

  :focus,
  :hover {
    background-color: ${({theme}) => darken(0.05, theme.colors.input)};
  }
`

const LabelRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: ${({theme}) => theme.colors.text};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;

  span:hover {
    cursor: pointer;
    color: ${({theme}) => darken(0.2, theme.colors.textSubtle)};
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
    // border-radius: ${({hideInput}) => (hideInput ? '8px' : '20px')};
    // background-color: ${({theme}) => theme.colors.background};
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  // border-radius: 16px;
  background-color: ${({theme}) => theme.colors.background};
  border: solid 1px ${dexTheme.colors.accent2};
  border-radius: 6px;
  padding: 10px 16px 8px 0;
  height: 100px;
  box-shadow: ${({theme}) => theme.shadows.inset};
`

const CustomBalanceWrapper = styled(Flex)`
  align-items: center;
  @media (max-width: 500px) {
    align-items: flex-end;
  }
`

const StyledChevronDownIcon = styled(ChevronDownIcon)`
  margin-left: 6px;
  @media (max-width: 500px) {
    margin: auto;
  }
`

const BalanceText = styled(Text)`
  margin: 0 13px 3px auto;
  align-items: flex-end;
  @media (max-width: 500px) {
    margin: 0 10px 0 0;
  }
`

const ToPanelWrapper = styled(Flex)`
  align-items: center;
  margin: 0 0 0 40px;
  @media (max-width: 500px) {
    margin: 10px 0 0 0;
  }
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

export default function CurrencyInputPanel(
    {
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
    const {account} = useActiveWeb3React()
    const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
    const theme = useContext(ThemeContext)
    const handleDismissSearch = useCallback(() => {
        setModalOpen(false)
    }, [setModalOpen])

    return (
        <InputPanel id={id}>
            {/* <Text fontSize="14px">{label}</Text> */}
            <Container hideInput={hideInput}>
                <InputRow style={hideInput ? {padding: '0', borderRadius: '8px'} : {}} selected={disableCurrencySelect}>
                    {!hideInput && (
                        <>
                            <CustomNumericalInput
                                className="token-amount-input"
                                value={value}
                                onUserInput={(val) => {
                                    onUserInput(val)
                                }}
                            />

                            <CustomBalanceWrapper flexDirection="column">
                                {/* <Text fontSize="14px" mb="2px">Balance: 0.69</Text> */}
                                {!hideBalance && !!currency && currencyBalance
                                    ? <BalanceText
                                        fontSize="14px">Balance: {currencyBalance?.toSignificant(6)}</BalanceText>
                                    :
                                    <ReactLoading type='bubbles' color={theme.colors.text} width='21px' height='21px'/>}
                                {account && currency && showMaxButton && label !== 'To' ? (
                                    <>
                                        <Flex flexDirection="row" justifyContent="flex-end" style={{columnGap: '2px'}}>
                                            <Button onClick={onMax} size="sm" variant="text"
                                                    style={{width: '20%', fontSize: '14px'}}>
                                                <Text color={dexTheme.colors.accent1} bold>MAX</Text>
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
                                                        <DoubleCurrencyLogo currency0={pair.token0}
                                                                            currency1={pair.token1} size={16} margin/>
                                                    ) : currency ? (
                                                        <CurrencyLogo currency={currency} size="32px"
                                                                      style={{marginRight: '12px'}}/>
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
                                                                    : currency?.symbol) ||
                                                                <TranslatedText translationId={82}>Select a
                                                                    token</TranslatedText>}
                                                        </Text>
                                                    )}

                                                    {!disableCurrencySelect &&
                                                        <StyledChevronDownIcon color={`${dexTheme.colors.accent1}`}/>}
                                                </Aligner>
                                            </CurrencySelect>
                                        </Flex>
                                    </>
                                ) : (
                                    // To currency input panel
                                    <>
                                        <Flex flexDirection="row" justifyContent="flex-end" style={{columnGap: '2px'}}>
                                            <ToPanelWrapper>
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
                                                            <DoubleCurrencyLogo currency0={pair.token0}
                                                                                currency1={pair.token1} size={16}
                                                                                margin/>
                                                        ) : currency ? (
                                                            <CurrencyLogo currency={currency} size="32px"
                                                                          style={{marginRight: '8px'}}/>
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
                                                                        : currency?.symbol) ||
                                                                    <TranslatedText translationId={82}>Select a
                                                                        token</TranslatedText>}
                                                            </Text>
                                                        )}
                                                        {!disableCurrencySelect && <StyledChevronDownIcon
                                                            color={`${dexTheme.colors.accent1}`}/>}
                                                    </Aligner>
                                                </CurrencySelect>
                                            </ToPanelWrapper>
                                        </Flex>
                                    </>

                                )}
                            </CustomBalanceWrapper>
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
                            <Text onClick={onMax} fontSize="14px" style={{display: 'inline', cursor: 'pointer'}}>
                                {/* {!hideBalance && !!currency && currencyBalance
                  ? `Available: ${currencyBalance?.toSignificant(6)} ${currency.symbol}`
                  : <ReactLoading type='bubbles' color={theme.colors.text} width='21px' height='21px'/>} */}
                            </Text>
                        )}
                    </RowBetween>

                </LabelRow>
            )}

        </InputPanel>
    )
}
