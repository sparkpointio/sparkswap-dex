import React, {useContext} from 'react'
import styled, {ThemeContext} from 'styled-components'
// import { Link} from 'react-router-dom'
import {Button, Flex, Link, Text, useModal} from '@sparkpointio/sparkswap-uikit'
import {dexTheme} from 'ThemeContext'
import RecentTransactionsModal from '../PageHeader/RecentTransactionsModal';


const ClaimButton = styled(Button)`
  background: linear-gradient(to right, ${dexTheme.colors.accent2}, ${dexTheme.colors.accent1});
  border-radius: 4px;
`

const StyledDiv = styled.div`
  display: flex;
  align-items: center;

  & > * {
    margin: 0px 5px 0px auto;
  }
`

const StyledLink = styled(Link)`
  color: ${dexTheme.colors.accent1};

  &:hover {
    text-decoration: underline;
  }
`

const SwapDetailsHeading = styled(Text)`
  display: inline-flex;
`

const SwapDetailsValue = styled(Text)`
  display: inline-flex;
  float: right;
  @media (max-width: 500px) {
    float: auto;
  }
`

const DetailsContainer = styled(Flex)`
  flex-direction: column;
  @media (max-width: 768px) {
    margin: 20px;
  }

`

const SwapDetails = () => {
    const theme = useContext(ThemeContext)
    const [onPresentRecentTransactions] = useModal(<RecentTransactionsModal/>)
    const incoming_token = 'ETH'
    const reward_token = 'Reward Coin'
    const fee_token = 'BNB'
    const helpLink = <StyledLink>[?]</StyledLink>


    return (
        <>
            <DetailsContainer>
                <div>
                    <SwapDetailsHeading>Minimum received &nbsp; {helpLink}</SwapDetailsHeading>
                    <SwapDetailsValue>6.9 {incoming_token}</SwapDetailsValue><br/>
                </div>
                <div>
                    <SwapDetailsHeading>Price impact &nbsp; {helpLink}</SwapDetailsHeading>
                    <SwapDetailsValue> 0.69%</SwapDetailsValue>
                </div>
                <div>
                    <SwapDetailsHeading>Trade fee</SwapDetailsHeading>
                    <SwapDetailsValue>0.00069 {fee_token} - 0.69 $</SwapDetailsValue>
                </div>
                { /* <div> */}
                { /*  <SwapDetailsHeading>Reward earned</SwapDetailsHeading> */}
                { /*  <SwapDetailsValue>0.69 {reward_token}</SwapDetailsValue> */}
                { /* </div> */}
            </DetailsContainer>
        </>

    )
}

export default SwapDetails
