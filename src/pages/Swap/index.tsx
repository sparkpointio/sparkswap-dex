import {CurrencyAmount, JSBI, Token, Trade} from '@sparkpointio/sparkswap-sdk'
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {ArrowDown} from 'react-feather'
import {Flex, IconButton, useModal} from '@sparkpointio/sparkswap-uikit'
import styled, {ThemeContext} from 'styled-components'
import AddressInputPanel from 'components/AddressInputPanel'
import Card from 'components/Card'
import {AutoColumn} from 'components/Column'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import SwapCurrencyInputPanel from 'components/SwapCurrencyInputPanel'
import CardNav from 'components/CardNav'
import {AutoRow, RowBetween} from 'components/Row'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink from 'components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import {
    ArrowWrapper,
    BottomGrouping,
    CustomStyleCard,
    StyledAutoColumn,
    StyledCardBody,
    StyledConnectButtonGroup,
    StyledSwapButtonGroup,
    SwapButton,
    SwapCallbackError,
    SwapDetailsBody,
} from 'components/swap/styleds'
import TokenWarningModal from 'components/TokenWarningModal'
import ProgressSteps from 'components/ProgressSteps'

import {BETTER_TRADE_LINK_THRESHOLD} from 'constants/index'
import {isTradeBetter} from 'data/V1'
import {useActiveWeb3React} from 'hooks'
import {useCurrency} from 'hooks/Tokens'
import {ApprovalState, useApproveCallbackFromTrade} from 'hooks/useApproveCallback'
import {useSwapCallback} from 'hooks/useSwapCallback'
import useToggledVersion, {Version} from 'hooks/useToggledVersion'
import useWrapCallback, {WrapType} from 'hooks/useWrapCallback'
import usePersistState from 'hooks/usePersistentState'
import useReload from 'hooks/useReload'
import {Field} from 'state/swap/actions'
import {useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers, useSwapState} from 'state/swap/hooks'
import {useExpertModeManager, useUserDeadline, useUserSlippageTolerance} from 'state/user/hooks'
import {LinkStyledButton, TYPE} from 'components/Shared'
import {maxAmountSpend} from 'utils/maxAmountSpend'
import {computeTradePriceBreakdown, warningSeverity} from 'utils/prices'
import Loader from 'components/Loader'
import {TranslateString} from 'utils/translateTextHelpers'
import StepProgress from 'components/StepProgress'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Icon from './Arrow'
import SettingsModal from '../../components/PageHeader/SettingsModal'
import AppBody from '../AppBody'
import SlippageController, {initialState, reducer} from '../../hooks/slippageController'
import {DISPLAY_STEP_PROGRESS} from './types'

const {main: Main} = TYPE

// Address
const MAX_SLIPPAGE = 5000
const RISKY_SLIPPAGE_LOW = 50
const RISKY_SLIPPAGE_HIGH = 500
const SRKb = '0xc3440c10c4f36f354eb591b19fafb4906d449b75'
const SFUEL = '0x37ac4d6140e54304d77437a5c11924f61a2d976f'

const Swap = () => {
    const loadedUrlParams = useDefaultsFromURLSearch()
    const [showStep, setShowStep] = usePersistState(DISPLAY_STEP_PROGRESS.ENABLE, {localStorageKey: 'dex_show_step'})
    // token warning stuff
    const [loadedInputCurrency, loadedOutputCurrency] = [
        useCurrency(loadedUrlParams?.inputCurrencyId),
        useCurrency(loadedUrlParams?.outputCurrencyId),
    ]
    type SlipErrorType = {
        slipWarning: boolean
    }
    // const [slipError, setSlip] = useState<SlipErrorType>({Error: true})
    const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
    const [isSyrup, setIsSyrup] = useState<boolean>(false)
    const [wrapState, setWrapState] = useState<string | undefined>(undefined)
    const [syrupTransactionType, setSyrupTransactionType] = useState<string>('')
    const urlLoadedTokens: Token[] = useMemo(
        () =>
            [loadedInputCurrency, loadedOutputCurrency]
                ?.filter((c): c is Token => {
                    return c instanceof Token
                })
                .filter((c) => {
                    return c.address.toLocaleLowerCase() !== SFUEL && c.address.toLocaleLowerCase() !== SRKb
                }) ?? [],
        [loadedInputCurrency, loadedOutputCurrency]
    )
    const handleConfirmTokenWarning = useCallback(() => {
        setDismissTokenWarning(true)
    }, [])

    const handleConfirmSyrupWarning = useCallback(() => {
        setIsSyrup(false)
        setSyrupTransactionType('')
    }, [])

    const {account} = useActiveWeb3React()
    const theme = useContext(ThemeContext)

    const [isExpertMode] = useExpertModeManager()

    // get custom setting values for user
    const [deadline] = useUserDeadline()
    const [allowedSlippage] = useUserSlippageTolerance()
    const [userSlippageTolerance] = useUserSlippageTolerance()
    // swap state
    const {independentField, typedValue, recipient} = useSwapState()
    const {
        v1Trade,
        v2Trade,
        currencyBalances,
        parsedAmount,
        currencies,
        inputError: swapInputError,
    } = useDerivedSwapInfo()
    const {wrapType, execute: onWrap, inputError: wrapInputError} = useWrapCallback(
        currencies[Field.INPUT],
        currencies[Field.OUTPUT],
        typedValue
    )

    const handleOnWrap = useCallback(async () => {
        if (!onWrap) {
            return
        }
        setSwapState((prevState) => ({
            ...prevState,
            attemptingTxn: true,
            swapErrorMessage: undefined,
            txHash: undefined,
            showConfirm: true,
        }))
        onWrap()
            .then((hash) => {
                setSwapState((prevState) => ({
                    ...prevState,
                    attemptingTxn: false,
                    txHash: hash,
                }))
            })
            .catch((err) => {
                setSwapState((prevState) => ({
                    ...prevState,
                    attemptingTxn: false,
                    swapErrorMessage: err.message,
                    txHash: undefined,
                    showConfirm: false,
                    hash: undefined,
                }))
            })
        // Clean up
    }, [onWrap])

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
    //   const { address: recipientAddress } = useENSAddress(recipient)
    const toggledVersion = useToggledVersion()
    const trade = showWrap
        ? undefined
        : {
            [Version.v1]: v1Trade,
            [Version.v2]: v2Trade,
        }[toggledVersion]

    const betterTradeLinkVersion: Version | undefined =
        toggledVersion === Version.v2 && isTradeBetter(v2Trade, v1Trade, BETTER_TRADE_LINK_THRESHOLD)
            ? Version.v1
            : toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade)
                ? Version.v2
                : undefined

    const parsedAmounts = showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
        }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
        }

    const {onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient} = useSwapActionHandlers()
    const isValid = !swapInputError
    const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
    const resetHash = useCallback(() => {
        setSwapState((prevState) => ({
            ...prevState,
            txHash: undefined,
        }));
    }, [])

    const handleTypeInput = useCallback(
        (value: string) => {
            resetHash()
            onUserInput(Field.INPUT, value)
        },
        [onUserInput, resetHash]
    )
    const handleTypeOutput = useCallback(
        (value: string) => {
            resetHash()
            onUserInput(Field.OUTPUT, value)
        },
        [onUserInput, resetHash]
    )

    // modal and loading
    const [{showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash}, setSwapState] = useState<{
        showConfirm: boolean
        tradeToConfirm: Trade | undefined
        attemptingTxn: boolean
        swapErrorMessage: string | undefined
        txHash: string | undefined
    }>({
        showConfirm: false,
        tradeToConfirm: undefined,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        txHash: undefined,
    })

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: showWrap
            ? parsedAmounts[independentField]?.toExact() ?? ''
            : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }

    const route = trade?.route
    const userHasSpecifiedInputOutput = Boolean(
        currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
    )
    const noRoute = !route

    // check whether the user has approved the router on the input token
    const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

    // check if user has gone through approval process, used to show two step buttons, reset on token change
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
    const [state, dispatch] = React.useReducer(reducer, initialState)

    // mark when a user has submitted an approval, reset onTokenSelection for input field
    useEffect(() => {
        if (approval === ApprovalState.PENDING) {
            setApprovalSubmitted(true)
        }
    }, [approval, approvalSubmitted])

    // Slippage check on load
    useEffect(() => {
        if (allowedSlippage / 100 < 0.5) {
            dispatch({type: 'Set'})
            SlippageController.setWarning()
        }
    }, [allowedSlippage])
    // Check for error

    const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
    const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

    // the callback to execute the swap
    const {callback: swapCallback, error: swapCallbackError} = useSwapCallback(
        trade,
        allowedSlippage,
        deadline,
        recipient
    )

    const {priceImpactWithoutFee} = computeTradePriceBreakdown(trade)
    const handleSwap = useCallback(() => {
        if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
            return
        }
        if (!swapCallback) {
            return
        }
        setSwapState((prevState) => ({
            ...prevState,
            attemptingTxn: true,
            swapErrorMessage: undefined,
            txHash: undefined
        }))
        swapCallback()
            .then((hash) => {
                setSwapState((prevState) => ({
                    ...prevState,
                    attemptingTxn: false,
                    swapErrorMessage: undefined,
                    txHash: hash,
                }))
            })
            .catch((error) => {
                setSwapState((prevState) => ({
                    ...prevState,
                    attemptingTxn: false,
                    swapErrorMessage: error.message,
                    txHash: undefined,
                }))
            })
    }, [priceImpactWithoutFee, swapCallback, setSwapState])

    // errors
    const [showInverted, setShowInverted] = useState<boolean>(false)

    // Loader

    // warnings on slippage
    const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

    // show approve flow when: no error on inputs, not approved or pending, or approved in current session
    // never show if price impact is above threshold in non expert mode
    const showApproveFlow =
        !swapInputError &&
        (approval === ApprovalState.NOT_APPROVED ||
            approval === ApprovalState.PENDING ||
            (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
        !(priceImpactSeverity > 3 && !isExpertMode)

    const handleConfirmDismiss = useCallback(() => {
        setSwapState((prevState) => ({...prevState, showConfirm: false}))

        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.INPUT, '')
        }
    }, [onUserInput, txHash, setSwapState])

    const handleAcceptChanges = useCallback(() => {
        setSwapState((prevState) => ({...prevState, tradeToConfirm: trade}))
    }, [trade])

    // This will check to see if the user has selected Syrup to either buy or sell.
    // If so, they will be alerted with a warning message.
    const checkForSyrup = useCallback(
        (selected: string, purchaseType: string) => {
            if (selected === 'syrup') {
                setIsSyrup(true)
                setSyrupTransactionType(purchaseType)
            }
        },
        [setIsSyrup, setSyrupTransactionType]
    )

    const handleInputSelect = useCallback(
        (inputCurrency) => {
            setApprovalSubmitted(false) // reset 2 step UI for approvals
            onCurrencySelection(Field.INPUT, inputCurrency)
            if (inputCurrency.symbol.toLowerCase() === 'syrup') {
                checkForSyrup(inputCurrency.symbol.toLowerCase(), 'Selling')
            }
        },
        [onCurrencySelection, setApprovalSubmitted, checkForSyrup]
    )
    const [onPresentSettings] = useModal(<SettingsModal action={dispatch}/>)
    const handleMaxInput = useCallback(() => {
        if (maxAmountInput) {
            resetHash()
            onUserInput(Field.INPUT, maxAmountInput.toExact())
        }
    }, [maxAmountInput, onUserInput, resetHash])

    const handleOutputSelect = useCallback(
        (outputCurrency) => {
            onCurrencySelection(Field.OUTPUT, outputCurrency)
            if (outputCurrency.symbol.toLowerCase() === 'syrup') {
                checkForSyrup(outputCurrency.symbol.toLowerCase(), 'Buying')
            }
        },
        [onCurrencySelection, checkForSyrup]
    )

    React.useEffect(() => {
        document.title = 'Swap | SparkSwap'
    })

    const [calculating, setCalculate] = useState<boolean>(true)

    const RenderFoundText = () => {
        setTimeout(() => {
            if (noRoute) {
                setCalculate(false)
            }
        }, 5000)
        return <Main mb="4px">{calculating ? 'Calculating' : 'Insufficient liquidity for this trade'}</Main>
    }

    return (
        <>
            {/* {stepProgress} */}
            <TokenWarningModal
                isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
                tokens={urlLoadedTokens}
                onConfirm={handleConfirmTokenWarning}
            />

            {/* <SyrupWarningModal
        isOpen={isSyrup}
        transactionType={syrupTransactionType}
        onConfirm={handleConfirmSyrupWarning}
      /> */}
            <AppBody>
                {/* <CardNav /> */}
                {/* <Grid item xs={12} md={4} lg={12} justifyContent="center"> */}

                {showStep === DISPLAY_STEP_PROGRESS.ENABLE && (
                    <ProgressDiv justifyContent='center' alignItems='center'>
                        <StepProgress approveState={{approval}}
                                      attemptingTxn={attemptingTxn}
                                      txHash={txHash}
                                      trade={trade} swapInputError={swapInputError}/>
                    </ProgressDiv>
                )}
                <CustomStyleCard>
                    <CardNav displayStepProgress={showStep}
                        onToggle={(mode: DISPLAY_STEP_PROGRESS) => setShowStep(mode)} />
                    {/* <Wrapper id="swap-page"> */}
                    <ConfirmSwapModal
                        isOpen={showConfirm}
                        trade={trade}
                        originalTrade={tradeToConfirm}
                        onAcceptChanges={handleAcceptChanges}
                        attemptingTxn={attemptingTxn}
                        txHash={txHash}
                        recipient={recipient}
                        allowedSlippage={allowedSlippage}
                        onConfirm={handleSwap}
                        swapErrorMessage={swapErrorMessage}
                        onDismiss={handleConfirmDismiss}
                        wrapState={wrapState}
                        currencies={{CURRENCY_A: currencies[Field.INPUT], CURRENCY_B: currencies[Field.OUTPUT]}}
                    />
                    {/* <PageHeader title=" " /> */}

                    <StyledCardBody>
                        <StyledAutoColumn gap="xs">
                            <SwapCurrencyInputPanel
                                label={
                                    independentField === Field.OUTPUT && !showWrap && trade
                                        ? 'From (estimated)'
                                        : TranslateString(76, 'From')
                                }
                                value={formattedAmounts[Field.INPUT]}
                                showMaxButton={!atMaxAmountInput}
                                currency={currencies[Field.INPUT]}
                                onUserInput={handleTypeInput}
                                onMax={handleMaxInput}
                                onCurrencySelect={handleInputSelect}
                                otherCurrency={currencies[Field.OUTPUT]}
                                id="swap-currency-input"
                            />
                            <AutoColumn justify="space-between">
                                <AutoRow justify={isExpertMode ? 'space-between' : 'center'}>
                                    <ArrowWrapper clickable>
                                        <IconButton
                                            onClick={() => {
                                                setApprovalSubmitted(false) // reset 2 step UI for approvals
                                                onSwitchTokens()
                                            }}
                                            style={{
                                                backgroundColor: 'transparent',
                                                width: '100%',
                                                marginTop: '10px',
                                                boxShadow: 'none'
                                            }}
                                            size="sm"
                                        >
                                            <Icon />
                                        </IconButton>
                                    </ArrowWrapper>
                                    {recipient === null && !showWrap && isExpertMode ? (
                                        <LinkStyledButton id="add-recipient-button"
                                            onClick={() => onChangeRecipient('')}>
                                            + Add a send (optional)
                                        </LinkStyledButton>
                                    ) : null}
                                </AutoRow>
                            </AutoColumn>
                            <SwapCurrencyInputPanel
                                value={formattedAmounts[Field.OUTPUT]}
                                onUserInput={handleTypeOutput}
                                label={
                                    independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : TranslateString(80, 'To')
                                }
                                showMaxButton={!atMaxAmountInput}
                                currency={currencies[Field.OUTPUT]}
                                onCurrencySelect={handleOutputSelect}
                                otherCurrency={currencies[Field.INPUT]}
                                id="swap-currency-output"
                            />

                            {recipient !== null && !showWrap ? (
                                <>
                                    <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                                        <ArrowWrapper clickable={false}>
                                            <ArrowDown size="16" color={theme.colors.textSubtle} />
                                        </ArrowWrapper>
                                        <LinkStyledButton id="remove-recipient-button"
                                            onClick={() => onChangeRecipient(null)}>
                                            - Remove send
                                        </LinkStyledButton>
                                    </AutoRow>
                                    <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                                </>
                            ) : null}

                            {showWrap ? null : (
                                <Card padding=".25rem .75rem 0 .75rem" borderRadius="20px">
                                    {/* <AutoColumn gap="4px">
                    {Boolean(trade) && (
                      <RowBetween align="center">
                        <Text fontSize="14px">Price</Text>
                        <TradePrice
                          price={trade?.executionPrice}
                          showInverted={showInverted}
                          setShowInverted={setShowInverted}
                        />
                      </RowBetween>
                    )}
                  </AutoColumn> */}
                                </Card>
                            )}
                        </StyledAutoColumn>
                        <BottomGrouping>
                            {/* Transaction swap btn */}
                            {/* <SwapButton fullWidth > Swap </SwapButton> */}
                            <StyledSwapButtonGroup>
                                {!account ? (
                                    <StyledConnectButtonGroup>
                                        <ConnectWalletButton fullWidth style={{ marginBottom: '3px' }} />
                                    </StyledConnectButtonGroup>
                                ) : showWrap ? (
                                    <SwapButton
                                        disabled={Boolean(wrapInputError)}
                                        onClick={handleOnWrap}
                                        fullWidth
                                        style={{ height: '58px', marginBottom: '22px', marginTop: '41px' }}
                                    >
                                        {wrapInputError ??
                                            (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                                    </SwapButton>
                                ) : noRoute && userHasSpecifiedInputOutput ? (
                                    <SwapButton style={{ textAlign: 'center', marginBottom: '20px', height: '58px' }}
                                        fullWidth disabled>
                                        {RenderFoundText()}
                                    </SwapButton>
                                ) : showApproveFlow ? (
                                    <RowBetween>
                                        <SwapButton
                                            onClick={approveCallback}
                                            disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                                            style={{ width: '48%', height: '58px', marginTop: '45px' }}
                                            variant={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
                                        >
                                            {approval === ApprovalState.PENDING ? (
                                                <AutoRow gap="6px" justify="center">
                                                    Approving <Loader stroke="white" />
                                                </AutoRow>
                                            ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                                                'Approved'
                                            ) : (
                                                `Approve ${currencies[Field.INPUT]?.symbol}`
                                            )}
                                        </SwapButton>

                                        <SwapButton
                                            onClick={() => {
                                                if (isExpertMode) {
                                                    handleSwap()
                                                } else {
                                                    setSwapState({
                                                        tradeToConfirm: trade,
                                                        attemptingTxn: false,
                                                        swapErrorMessage: undefined,
                                                        showConfirm: true,
                                                        txHash: undefined,
                                                    })
                                                }
                                            }}
                                            style={{ width: '48%', height: '58px', marginTop: '43px' }}
                                            id="swap-button"
                                            disabled={
                                                !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                                            }
                                            variant={isValid && priceImpactSeverity > 2 ? 'danger' : 'primary'}
                                        >
                                            {priceImpactSeverity > 3 && !isExpertMode
                                                ? `Price Impact High`
                                                : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                                        </SwapButton>
                                    </RowBetween>
                                ) : (
                                    <SwapButton
                                        onClick={() => {
                                            if (isExpertMode) {
                                                handleSwap()
                                            } else {
                                                setSwapState({
                                                    tradeToConfirm: trade,
                                                    attemptingTxn: false,
                                                    swapErrorMessage: undefined,
                                                    showConfirm: true,
                                                    txHash: undefined,
                                                })
                                            }
                                        }}
                                        id="swap-button"
                                        disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                                        variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
                                        fullWidth
                                        style={{
                                            marginBottom:
                                                swapInputError === 'Enter an amount' || swapInputError === 'Select a token' ? '22px' : '28px',
                                            height: '58px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        {swapInputError ||
                                            (priceImpactSeverity > 3 && !isExpertMode
                                                ? `Price Impact Too High`
                                                : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`)}
                                    </SwapButton>
                                )}
                                {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />}
                                {isExpertMode && swapErrorMessage ?
                                    <SwapCallbackError error={swapErrorMessage} /> : null}
                                {betterTradeLinkVersion && <BetterTradeLink version={betterTradeLinkVersion} />}
                            </StyledSwapButtonGroup>
                            {!noRoute && (
                                <SwapDetailsBody>
                                    <AdvancedSwapDetailsDropdown trade={trade} />
                                </SwapDetailsBody>
                            )}

                            {/* <StyledSwapDetails>

                  <RowBetween align="center">
                    <Text fontSize="14px">Slippage Tolerance</Text>
                    <Button
                      size="sm"
                      style={{
                        backgroundColor: `${theme.colors.input}`,
                        color: `${theme.colors.textSubtle}`,
                        minWidth: '60px',
                        maxWidth: '60px',
                      }}
                      onClick={onPresentSettings}
                    >
                      {allowedSlippage / 100}%
                    </Button>
                  </RowBetween>

                  {userSlippageTolerance < RISKY_SLIPPAGE_LOW && (
                    <Text color="red" fontSize="12px" style={{ marginTop: '-10px' }}>
                      Note: Your Transaction may fail
                    </Text>
                  )}

                  {!noRoute && <AdvancedSwapDetailsDropdown trade={trade} />}
                </StyledSwapDetails> */}

                            {/* <StyledSwapButtonGroup>
                  {!account ? (
                    <StyledConnectButtonGroup>
                      <ConnectWalletButton fullWidth style={{ marginBottom: '3px' }} />
                    </StyledConnectButtonGroup>
                  ) : showWrap ? (
                    <Button
                      disabled={Boolean(wrapInputError)}
                      onClick={handleOnWrap}
                      fullWidth
                      style={{ height: '58px', marginBottom: '22px', marginTop: '41px' }}
                    >
                      {wrapInputError ??
                        (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                    </Button>
                  ) : noRoute && userHasSpecifiedInputOutput ? (
                    <Button style={{ textAlign: 'center', marginBottom: '20px', height: '58px' }} fullWidth disabled>
                      {RenderFoundText()}
                    </Button>
                  ) : showApproveFlow ? (
                    <RowBetween>
                      <Button
                        onClick={approveCallback}
                        disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                        style={{ width: '48%', height: '58px', marginTop: '45px' }}
                        variant={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
                      >
                        {approval === ApprovalState.PENDING ? (
                          <AutoRow gap="6px" justify="center">
                            Approving <Loader stroke="white" />
                          </AutoRow>
                        ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                          'Approved'
                        ) : (
                          `Approve ${currencies[Field.INPUT]?.symbol}`
                        )}
                      </Button>

                      <Button
                        onClick={() => {
                          if (isExpertMode) {
                            handleSwap()
                          } else {
                            setSwapState({
                              tradeToConfirm: trade,
                              attemptingTxn: false,
                              swapErrorMessage: undefined,
                              showConfirm: true,
                              txHash: undefined,
                            })
                          }
                        }}
                        style={{ width: '48%', height: '58px', marginTop: '43px' }}
                        id="swap-button"
                        disabled={
                          !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                        }
                        variant={isValid && priceImpactSeverity > 2 ? 'danger' : 'primary'}
                      >
                        {priceImpactSeverity > 3 && !isExpertMode
                          ? `Price Impact High`
                          : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                      </Button>
                    </RowBetween>
                  ) : (
                    <Button
                      onClick={() => {
                        if (isExpertMode) {
                          handleSwap()
                        } else {
                          setSwapState({
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            showConfirm: true,
                            txHash: undefined,
                          })
                        }
                      }}
                      id="swap-button"
                      disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                      variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
                      fullWidth
                      style={{
                        marginBottom:
                          swapInputError === 'Enter an amount' || swapInputError === 'Select a token' ? '22px' : '28px',
                        height: '58px',
                        marginTop: '10px',
                      }}
                    >
                      {swapInputError ||
                        (priceImpactSeverity > 3 && !isExpertMode
                          ? `Price Impact Too High`
                          : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`)}
                    </Button>
                  )}
                  {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />}
                  {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                  {betterTradeLinkVersion && <BetterTradeLink version={betterTradeLinkVersion} />}
                </StyledSwapButtonGroup> */}
                        </BottomGrouping>
                    </StyledCardBody>
                    {/* </Wrapper> */}
                </CustomStyleCard>
            </AppBody>
        </>
    )
}

export default Swap

const ProgressDiv = styled(Flex)`
  margin: 0rem;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin: 0rem 0rem 2rem 0rem;
  }
`
