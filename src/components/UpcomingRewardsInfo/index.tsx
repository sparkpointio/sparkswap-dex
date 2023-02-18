import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Link, Heading } from '@sparkpointio/sparkswap-uikit'
import RewardsIcon from './Rewards'

const StyledLink = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.dexTheme.colors.accent1};
  &:hover,
  &:active {
    text-decoration: underline;
  }
  &:visited {
    color: pink;
  }
  &:active {
    color: white;
  }
`

const RewardsWrapper = styled(Flex)`
  column-gap: 30px;
  @media (max-width: 500px) {
    flex-direction: column;
    align-items: center;
    row-gap: 10px;
  }
`

const UpcomingRewardsInfo = () => {
  return (
    <RewardsWrapper >
      <div>
        <RewardsIcon />
      </div>
      <Flex flexDirection="column" >
        <div>
          <Heading mb="10px"> A new way to earn rewards is coming to SparkSwap! </Heading>
          <Text color="textSubtle">Watch this space as we unveil more details about our new reward system. Follow <StyledLink href="https://twitter.com/SparkDeFi" target="_blank" rel="noopener noreferrer">@SparkDeFi</StyledLink> on Twitter for the latest update! ⚡🚀</Text>
        </div>
        
      </Flex>
    </RewardsWrapper>
  )
}

export default UpcomingRewardsInfo