import React, { useCallback, useContext, useMemo, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { dexTheme } from 'ThemeContext'
import { Currency, currencyEquals, ETHER, Percent, WETH } from '@sparkpointio/sparkswap-sdk'
import { Button, Flex, Input, Text, Radio } from '@sparkpointio/sparkswap-uikit'
import { ArrowDown, Plus } from 'react-feather'
import { RouteComponentProps } from 'react-router'

import { BigNumber } from '@ethersproject/bignumber'
import ConnectWalletButton from 'components/ConnectWalletButton'

import CardNav from 'components/CardNav'
import DefaultCurrencyInputPanel from 'components/DefaultCurrencyInputPanel'
import CustomConfirmationModalContent from 'components/TransactionConfirmationModal/CustomConfirmationModalContent'
import CustomTransactionConfirmationModal from 'components/TransactionConfirmationModal/CustomTransactionConfirmationModal'
import { AutoColumn, ColumnCenter, StyledOptions } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import SwapCurrencyInputPanel from '../../components/SwapCurrencyInputPanel'

import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { MinimalPositionCard } from '../../components/PositionCard'
import { RowBetween, RowFixed, ToRowFixed } from '../../components/Row'
import Slider from '../../components/Slider'
import CurrencyLogo from '../../components/CurrencyLogo'
import { ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { usePairContract } from '../../hooks/useContract'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { StyledInternalLink, TYPE } from '../../components/Shared'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import AppBody from '../AppBody'
import { ClickableText, Wrapper } from '../Pool/styleds'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { CustomStyleCard, Dots, SwapButton, BG } from '../../components/swap/styleds'
import { useBurnActionHandlers, useDerivedBurnInfo, useBurnState } from '../../state/burn/hooks'

import { Field } from '../../state/burn/actions'
import { useUserDeadline, useUserSlippageTolerance } from '../../state/user/hooks'


const { italic: Italic } = TYPE

const Option = styled.div`
  padding: 0 4px;
  margin-right: 10px;
  margin-left: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 450px) {
    align-items: space-between;
    width: 100%;
    margin: 5px;
  }
`
const MobileDiv = styled.div`
  @media (min-width: 500px){
    width: 75%;
    margin-left: 5px;
  }
  @media (max-width: 450px){
    width: 50%;
  }
`


const OutlineCard = styled.div`
  // border: 1px solid ${({ theme }) => theme.colors.borderColor};
  // border-radius: 16px;
  padding: 24px;
  background-color: ${dexTheme.colors.background3};
  border: 1px solid ${dexTheme.colors.accent1};
  border-radius: 6px;
`

const Body = styled.div`
  padding: 0 4.5em 0 4.5em;
  @media (max-width: 500px) {
    padding: 1em 1em 1em 1em;
  }
`

const CustomDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  margin: 0 50px;
  @media (max-width: 500px) {
    margin: 0 0;
    align-items: center;
}
`

export default function RemoveLiquidity({
  history,
  match: {
    params: { currencyIdA, currencyIdB },
  },
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library } = useActiveWeb3React()
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId,
  ])

  const theme = useContext(ThemeContext)

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS)
  const [isPending, setPending] = useState<boolean>(false)
  const [clearHash, setClearHash] = useState<string>('')

  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')
    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account)

    const deadlineForSignature: number = Math.ceil(Date.now() / 1000) + deadline

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ]
    const domain = {
      name: 'SparkSwap LPs',
      version: '1',
      chainId,
      verifyingContract: pair.liquidityToken.address,
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ]
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS,
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadlineForSignature,
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    })
    setPending(true)
    setShowConfirm(true)
    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then((signature) => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadlineForSignature,
        })
      })
      .catch((e) => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (e?.code !== 4001) {
          approveCallback()
        }
        // cleanup
        // setShowConfirm(false)
        handleDismissConfirmation();
      })
      
  }

  // initial Mounting
  React.useEffect(() => {
    if (isPending) setClearHash('')
    
  }, [isPending])

  React.useEffect(() => {
    if (signatureData) {
      setShowConfirm(false);
      setTimeout(() => setPending(false), 500)
    }
    
  }, [signatureData, isPending])

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, val: string) => {
      setSignatureData(null)
      return _onUserInput(field, val)
    },
    [_onUserInput]
  )

  const onLiquidityInput = useCallback((val: string): void => onUserInput(Field.LIQUIDITY, val), [onUserInput])
  const onCurrencyAInput = useCallback((val: string): void => onUserInput(Field.CURRENCY_A, val), [onUserInput])
  const onCurrencyBInput = useCallback((val: string): void => onUserInput(Field.CURRENCY_B, val), [onUserInput])

  // tx sending
  const addTransaction = useTransactionAdder()
  async function onRemove() {
    if (!chainId || !library || !account) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    const router = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB === ETHER
    const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH
    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[]
    let args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadlineFromNow,
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadlineFromNow,
        ]
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }
    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName, index) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((e) => {
            console.error(`estimateGas failed`, index, methodName, args, e)
            return undefined
          })
      )
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
      BigNumber.isBigNumber(safeGasEstimate)
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      setAttemptingTxn(true)
      await router[methodName](...args, {
        gasLimit: safeGasEstimate,
      })
        .then((response: TransactionResponse) => {
          setAttemptingTxn(false)

          addTransaction(response, {
            summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${
              currencyA?.symbol
            } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`,
          })

          setTxHash(response.hash)
        })
        .catch((e: Error) => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(e)
        })
    }
  }

  function modalHeader() {
    return (
      <AutoColumn gap="md" style={{ marginTop: '20px' }}>
        <CustomDiv>
        <RowFixed align="center">
          <CurrencyLogo currency={currencyA} size="30px" />
          <Text fontSize="24px" style={{ marginLeft: '10px' }}>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Text>
          <Text fontSize="24px" style={{ marginLeft: '10px' }}>
              {currencyA?.symbol}
          </Text>
        </RowFixed>
        <ToRowFixed>
         <Text>and</Text>
        </ToRowFixed>
        <RowFixed align="center">
          <CurrencyLogo currency={currencyB} size="30px" />
          <Text fontSize="24px" style={{ marginLeft: '10px' }}>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Text>
          <Text fontSize="24px" style={{ marginLeft: '10px' }}>
            {currencyB?.symbol}
          </Text>
        </RowFixed>
        </CustomDiv>
        {/* <SwapButton fullWidth disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)} onClick={onRemove} style={{margin: '0 auto'}}>
          Confirm
        </SwapButton> */}
      </AutoColumn>
    )
  }

  function modalBottom() {
    return (
      <>
        <SwapButton fullWidth disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)} onClick={onRemove} style={{margin: '0 auto'}}>
          Confirm
        </SwapButton>
        <Text fontSize="12px" color={theme.colors.textSubtle} style={{textAlign: 'center'}}>
          {`Output is estimated. If the price changes by more than ${
            allowedSlippage / 100
          }% your transaction will revert.`}
        </Text>
        <RowBetween>
          <Text fontSize="15px" bold>{`${currencyA?.symbol}/${currencyB?.symbol}`} Burned</Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin />
            <Text color={dexTheme.colors.text2}>{parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}</Text>
          </RowFixed>
        </RowBetween>
        {pair && (
          <div style={{lineHeight: '0'}}>
            <RowBetween>
              <Text fontSize="15px" bold>Rate</Text>
              <Text fontSize="15px" color={dexTheme.colors.text2}>
                1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
              </Text>
            </RowBetween>
            <RowBetween>
              <Text fontSize="15px" bold style={{ textAlign: 'left' }}>
                Inverse Rate
              </Text>
              <Text fontSize="15px" color={dexTheme.colors.text2} style={{ textAlign: 'right' }}>
                1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
              </Text>
            </RowBetween>
          </div>
        )}

      </>
    )
  }

  const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencyA?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.symbol}`

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput]
  )

  const oneCurrencyIsETH = currencyA === ETHER || currencyB === ETHER
  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WETH[chainId], currencyA)) ||
        (currencyB && currencyEquals(WETH[chainId], currencyB)))
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        history.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
      } else {
        history.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        history.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
      } else {
        history.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )


  const handleDismissConfirmation = useCallback(() => {
    setClearHash('clear');
    setShowConfirm(false)
    setSignatureData(null)
    // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback
  )
  const [customValue, setCustomValue] = React.useState<string>('');
  const [useCustom, setUseCustom] = React.useState<boolean>(false);
  return (
    <>
    {/* <BG> */}
      <AppBody>
        <CustomStyleCard>
          <CardNav activeIndex={1}/>
          <AddRemoveTabs adding={false} />
          <Wrapper>
            <CustomTransactionConfirmationModal
              isOpen={showConfirm}
              onDismiss={handleDismissConfirmation}
              attemptingTxn={attemptingTxn}
              hash={txHash || clearHash}
              currInfo={{CURRENCY_A:currencyA, CURRENCY_B: currencyB}}
              approvalState={{ isPending }}
              content={() => (
                <CustomConfirmationModalContent 
                  title="Confirm removal of"
                  onDismiss={handleDismissConfirmation}
                  topContent={modalHeader}
                  bottomContent={modalBottom}
                />
              )}
              pendingText={pendingText}
            />
            <AutoColumn gap="md">
              <Body>
                <OutlineCard>
                  <AutoColumn>
                    <RowBetween>
                      <Text>Amount</Text>
                      <ClickableText
                        onClick={() => {
                          setShowDetailed(!showDetailed)
                        }}
                      >
                        {showDetailed ? 'Simple' : 'Detailed'}
                      </ClickableText>
                    </RowBetween>
                    {/* <Flex justifyContent="start">
                      <Text fontSize="64px">{formattedAmounts[Field.LIQUIDITY_PERCENT]}%</Text>
                    </Flex> */}
                    {!showDetailed && (
                      <>
                        {/* <Flex mb="8px">
                          <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                        </Flex> */}
                        <StyledOptions>
                          {['0','25', '50', '75', '100'].map((value) => {
                            return (
                              <Option key={value}>
                                <Radio
                                  scale="sm"
                                  name="Liquidity_Percent"
                                  onChange={() => {
                                    setUseCustom(false)
                                    onUserInput(Field.LIQUIDITY_PERCENT, value)
                                  }}
                                />
                                <Text style={{ marginLeft: '5px' }}>{value === '100' ? 'Max' : `${value}%`}</Text>
                              </Option>
                            )
                          })}

                          <Option>
                          <Radio
                            scale="sm"
                            name="Liquidity_Percent"
                            onChange={() => {
                              onUserInput(Field.LIQUIDITY_PERCENT, customValue)
                              setUseCustom(true)
                            }}
                          />
                          <MobileDiv>
                          <Input
                            type="number"
                            scale="sm"
                            min="1"
                            max="100"
                            placeholder="Custom"
                            onChange={(e) => {
                              const val = parseInt(e.target.value) > 100 ? '0': e.target.value
                              setCustomValue(val)
                              return useCustom && onUserInput(Field.LIQUIDITY_PERCENT, val)
                            }}
                          
                          />
                          </MobileDiv>
                          </Option>
                        </StyledOptions>
                      </>
                    )}
                  </AutoColumn>
                </OutlineCard>
              </Body>
              {!showDetailed && (
                <>
                  <ColumnCenter>
                    <ArrowDown size="16" color={theme.colors.textSubtle} />
                  </ColumnCenter>
                  <Body>
                    <OutlineCard>
                      <AutoColumn gap="10px">
                        <RowBetween>
                          <RowFixed>
                            <CurrencyLogo currency={currencyA} style={{ marginRight: '12px' }} />
                            <Text fontSize="24px" id="remove-liquidity-tokena-symbol">
                              {currencyA?.symbol}
                            </Text>
                          </RowFixed>
                          <Text fontSize="24px">{formattedAmounts[Field.CURRENCY_A] || '-'}</Text>
                        </RowBetween>
                        <RowBetween>
                          <RowFixed>
                            <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} />
                            <Text fontSize="24px" id="remove-liquidity-tokenb-symbol">
                              {currencyB?.symbol}
                            </Text>
                          </RowFixed>
                          <Text fontSize="24px">{formattedAmounts[Field.CURRENCY_B] || '-'}</Text>
                        </RowBetween>
                        {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                          <RowBetween style={{ justifyContent: 'flex-end' }}>
                            {oneCurrencyIsETH ? (
                              <StyledInternalLink
                                to={`/remove/${currencyA === ETHER ? WETH[chainId].address : currencyIdA}/${
                                  currencyB === ETHER ? WETH[chainId].address : currencyIdB
                                }`}
                              >
                                Receive WBNB
                              </StyledInternalLink>
                            ) : oneCurrencyIsWETH ? (
                              <StyledInternalLink
                                to={`/remove/${
                                  currencyA && currencyEquals(currencyA, WETH[chainId]) ? 'ETH' : currencyIdA
                                }/${currencyB && currencyEquals(currencyB, WETH[chainId]) ? 'ETH' : currencyIdB}`}
                              >
                                Receive BNB
                              </StyledInternalLink>
                            ) : null}
                          </RowBetween>
                        ) : null}
                      </AutoColumn>
                    </OutlineCard>
                  </Body>
                </>
              )}
              <Body style={{ paddingBottom: '24px' }}>
                {showDetailed && (
                  <>
                    <DefaultCurrencyInputPanel
                      value={formattedAmounts[Field.LIQUIDITY]}
                      onUserInput={onLiquidityInput}
                      onMax={() => {
                        onUserInput(Field.LIQUIDITY_PERCENT, '100')
                      }}
                      showMaxButton={!atMaxAmount}
                      disableCurrencySelect
                      currency={pair?.liquidityToken}
                      pair={pair}
                      id="liquidity-amount"
                    />
                    <ColumnCenter>
                      <ArrowDown size="16" color={theme.colors.textSubtle} />
                    </ColumnCenter>
                    <DefaultCurrencyInputPanel
                      hideBalance
                      value={formattedAmounts[Field.CURRENCY_A]}
                      onUserInput={onCurrencyAInput}
                      onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                      showMaxButton={!atMaxAmount}
                      currency={currencyA}
                      label="Output"
                      onCurrencySelect={handleSelectCurrencyA}
                      id="remove-liquidity-tokena"
                    />
                    <ColumnCenter>
                      <Plus size="16" color={theme.colors.textSubtle} />
                    </ColumnCenter>
                    <DefaultCurrencyInputPanel
                      hideBalance
                      value={formattedAmounts[Field.CURRENCY_B]}
                      onUserInput={onCurrencyBInput}
                      onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                      showMaxButton={!atMaxAmount}
                      currency={currencyB}
                      label="Output"
                      onCurrencySelect={handleSelectCurrencyB}
                      id="remove-liquidity-tokenb"
                    />
                  </>
                )}
                {pair && (
                  <div style={{ padding: '24px' }}>
                    <Flex justifyContent="space-between" mb="8px">
                      Rate:
                      <div>
                        1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'}{' '}
                        {currencyB?.symbol}
                      </div>
                    </Flex>
                    <Flex justifyContent="space-between">
                      Inverse Rate:
                      <div style={{ textAlign: 'right' }}>
                        1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'}{' '}
                        {currencyA?.symbol}
                      </div>
                    </Flex>
                  </div>
                )}
                <div style={{ position: 'relative' }}>
                  {!account ? (
                    <ConnectWalletButton fullWidth />
                  ) : (
                    <RowBetween style={{ columnGap: '20px' }}>
                      <SwapButton
                        onClick={onAttemptToApprove}
                        variant={approval === ApprovalState.APPROVED || signatureData !== null ? 'success' : 'primary'}
                        disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                        mr="8px"
                        fullWidth
                      >
                        {approval === ApprovalState.PENDING ? (
                          <Dots>Approving</Dots>
                        ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                          'Approved'
                        ) : (
                          'Approve'
                        )}
                      </SwapButton>
                      <SwapButton
                        onClick={() => {
                          setShowConfirm(true)
                        }}
                        disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                        variant={
                          !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                            ? 'danger'
                            : 'primary'
                        }
                        fullWidth
                      >
                        {error || 'Remove'}
                      </SwapButton>
                    </RowBetween>
                  )}
                </div>
              </Body>
            </AutoColumn>
          </Wrapper>
        </CustomStyleCard>
      </AppBody>

      {pair ? (
        <AppBody>
          <CustomStyleCard>
            <AutoColumn style={{ minWidth: '20rem'}}>
              <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
            </AutoColumn>
          </CustomStyleCard>
        </AppBody>
      ) : null}
    {/* </BG>  */}
    </>
  )
}
