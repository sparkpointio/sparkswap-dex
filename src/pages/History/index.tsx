import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import Moment from 'react-moment'
import 'moment-timezone'
import ReactTooltip from 'react-tooltip'
import { ExternalLink } from 'react-feather'
import {
  CardBody,
  Text,
  Button,
  ConnectorId,
  useWalletModal,
  CheckmarkCircleIcon,
  ErrorIcon,
  LinkExternal,
} from '@sparkpointio/sparkswap-uikit'
import { useActiveWeb3React } from 'hooks'
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { getEtherscanLink } from 'utils'
import { TransactionDetails } from 'state/transactions/reducer'
import { injected, walletconnect, bsc } from 'connectors'
import CardNav from 'components/CardNav'
import AppBody from 'pages/AppBody'
import TranslatedText from 'components/TranslatedText'
import { CustomStyleCard, Dots, BG, RewardsEarnedBody, SwapButton } from 'components/swap/styleds'
import PageHeader from 'components/PageHeader'
import Loader from 'components/Loader'
import Table from './Table'
import { TABLE_TYPE } from './type'

const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  &:hover {
    text-decoration: underline;
  }
`
export default function History() {
  const theme = useContext(ThemeContext)
  const { account, activate, deactivate } = useWeb3React()
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()

  const tableType = (type:string) => {
    switch(type){
      case 'Add':
        return TABLE_TYPE.Add
      case 'Remove':
        return TABLE_TYPE.Remove
      case 'Swap':
        return TABLE_TYPE.Swap    
      default: 
      return '-'
    }    
  }

  const handleLogin = (connectorId: ConnectorId) => {
    if (connectorId === 'walletconnect') {
      return activate(walletconnect)
    }
    if (connectorId === 'bsc') {
      return activate(bsc)
    }
    return activate(injected)
  }

  const getRowStatus = (sortedRecentTransaction: TransactionDetails) => {
    const { hash, receipt } = sortedRecentTransaction

    if (!hash) {
      return { icon: <Loader />, color: 'text' }
    }

    if (hash && receipt?.status === 1) {
      return { icon: <CheckmarkCircleIcon color="success" />, color: 'success' }
    }

    return { icon: <ErrorIcon color="failure" />, color: 'failure' }
  }

  const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => b.addedTime - a.addedTime

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs
      .filter((tx) => tx.from === account)
      .filter(isTransactionRecent)
      .sort(newTransactionsFirst)
  }, [allTransactions, account])

  const { onPresentConnectModal } = useWalletModal(handleLogin, deactivate, account as string)
  // new Date(row.confirmedTime).toLocaleString()
  // Data
  const columns = React.useMemo(
    () => [
      {
        name: 'Timestamp',
        selector: 'confirmedTime',
        cell: (row) => (
          <Text fontSize="12px">
            <Moment data-tip={new Date(row.confirmedTime).toLocaleString()} format='HH:mm - DD/MM/YY'>
              {row.confirmedTime}
            </Moment>
          </Text>
        ),
      },
      {
        name: 'Type',
        selector: 'type',
        cell: (row) => {
          const data = row.summary.split(' ');
          const type = tableType(data[0]);
          return <Text fontSize='12px'>{type}</Text>
        },
        hide: 'sm'
      },
      {
        name: 'Amount',
        selector: 'amount',
        cell: (row) => {
        const data = row.summary.split(' ')
        const amount = data.splice(1,2).join(' ');
        // if (data[0].toLowerCase() === 'add' || data[0].toLowerCase() === 'remove') {
        //   return <Text fontSize='12px'>-</Text>
        // }
        return <Text fontSize='12px'>{amount}</Text>
      },
      hide: 'sm'
      },
      {
        name: 'Summary',
        selector: 'Summary',
        cell: (row) => {
        
        return <Text fontSize='12px'>{row.summary}</Text>
      },
    },
      {
        name: 'View',
        selector: 'view',
        cell: (row) => (
          <StyledLink
            target="_blank"
            rel="noreferrer noopener"
            href={getEtherscanLink(row.chainId, row.hash, 'transaction')}
          >
            {' '}<ExternalLink color="#FFFF" />{' '}
          </StyledLink>
        ),
      },
    ],
    []
  )

  React.useEffect(() => {
    document.title = 'History | SparkSwap'
  })

  return (
    <>
      <AppBody>
        <CustomStyleCard>
          <CardNav activeIndex={2} />
          <PageHeader title="Transaction History">
            {!account && (
              <SwapButton fullWidth id="join-pool-button" onClick={onPresentConnectModal}>
                <TranslatedText translationId={100}>Connect Wallet</TranslatedText>
              </SwapButton>
            )}
          </PageHeader>
          {/* {account && chainId && sortedRecentTransactions.length === 0 && (  <Text> No recent transactions</Text>)} */}
          {account && chainId && (
            <TableContainer>
              <Table columns={columns} data={sortedRecentTransactions} />
              <ReactTooltip />
            </TableContainer>
          )}
        </CustomStyleCard>
      </AppBody>
    </>
  )
}

const TableContainer = styled.div`
  margin: 0rem;
  ${({theme}) => theme.mediaQueries.md} {
    margin: 0rem 3rem 0rem 3rem;
  }
`  

