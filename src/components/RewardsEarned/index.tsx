import React, {useContext} from 'react'
import styled, {ThemeContext} from 'styled-components'
import {useWeb3React} from '@web3-react/core'
import ReactTooltip from 'react-tooltip'
// import { Link} from 'react-router-dom'
import {Button, Flex, Link, Progress, Text, useModal} from '@sparkpointio/sparkswap-uikit'
import useMediaQuery from '@mui/material/useMediaQuery'
import {useTheme} from '@mui/material/styles'
import UnlockButton from 'components/ConnectWalletButton'
import {dexTheme} from 'ThemeContext'
import {MouseoverTooltip} from 'components/CustomTooltip'
import RecentTransactionsModal from '../PageHeader/RecentTransactionsModal';
import {useUserRewardInfo} from "../../state/wallet/hooks";
import {useClaimCallback} from "../../hooks/useClaimCallback";
import {getBalanceAmount, toBigNumber} from "../../utils/formatBalance";
import {epochToDate} from "../../utils";


const StyledButton = styled(Button)`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background};
  color: ${({theme}) => theme.colors.textSubtle};
  height: 7vh;
`

const ClaimButton = styled(Button)`
  background: ${({theme}) =>
          `linear-gradient(to right, ${theme.dexTheme.colors.accent2}, ${theme.dexTheme.colors.accent1})`};
  border-radius: 4px;
  float: right;
`

const ProgressGroup = styled(Flex)`
  flex-direction: column;
  margin: 15px 0px;
`

const RewardsInfoWrapper = styled.div`
  display: inline-flex;
`

const ClaimContainer = styled.div`
  display: inline-flex;
  float: right;
  @media (max-width: 280px) {
    margin: 8px 0;
    float: inherit;
  }
`

const StyledLink = styled(Link)`
  color: ${dexTheme.colors.accent1};
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`

const StyledReactTooltip = styled(ReactTooltip)`
  background-color: ${dexTheme.colors.background1} !important;
  color: ${dexTheme.colors.accent1} !important;
  box-shadow: 0px 2px 2px ${dexTheme.colors.accent2};

  &:after {
    border-top-color: ${dexTheme.colors.text2} !important;
  }
`

const StyledUnlockBtn = styled(UnlockButton)`
  border-radius: 8px;
  // float: right;
`

const RewardsEarned = () => {
    const theme = useContext(ThemeContext)
    const [onPresentRecentTransactions] = useModal(<RecentTransactionsModal/>)
    const token = 'RCOIN'

    const userInfo = useUserRewardInfo()
    const nextRefresh = epochToDate(userInfo.nextRefresh)
    const remainingLimit = getBalanceAmount(toBigNumber(userInfo.remainingLimit))
    const claimableAmount = getBalanceAmount(toBigNumber(userInfo.claimableAmount))
    const userLimit = getBalanceAmount(toBigNumber(userInfo.userLimit))
    const percentage = claimableAmount.div(userLimit).multipliedBy(100).toNumber()
    const maxLimitReached = remainingLimit.eq(0) && percentage >= 99
    const hasLimitButNoSpace = remainingLimit.gt(0) && (percentage >= 97)

    const [claimRewards] = useClaimCallback()


    const RenderClaim: React.FC = () => {
        const {account} = useWeb3React()
        const muitheme = useTheme()
        const mobileScreen = useMediaQuery(muitheme.breakpoints.up('sm'))
        const size = mobileScreen ? 'md' : 'sm'
        return (
            !account ?
                <StyledUnlockBtn size={size}/> :
                <ClaimButton onClick={claimRewards} size={size} disabled={claimableAmount.eq(0)}>
                    Claim
                </ClaimButton>
        )
    }

    const infoHover = (
        <Flex>
            <Text> Rewards Earned&nbsp; </Text>
            <MouseoverTooltip text="Perform a Swap on SparkSwap and get RCOIN as a reward.">
                <Flex pt="2px">
                    <StyledLink>[?]</StyledLink>
                </Flex>
            </MouseoverTooltip>
        </Flex>
    )

    const RewardsEarnedInfo = (
        <Flex>
            <div>
                <img src={`${process.env.PUBLIC_URL}/images/profile.png`} width="50px" alt="profile"/>
            </div>
            <Flex flexDirection="column" margin="0px 1.5em">
                {infoHover}
                <Text bold>
                    {claimableAmount.toString()} {token}
                </Text>
            </Flex>
        </Flex>
    )

    return (
        <>
            <Flex flexDirection="column">
                <div>
                    <RewardsInfoWrapper>{RewardsEarnedInfo}</RewardsInfoWrapper>
                    <ClaimContainer>
                        <RenderClaim/>
                    </ClaimContainer>
                </div>
            </Flex>
            <ProgressGroup>
                <Progress primaryStep={percentage} variant="flat"/>
            </ProgressGroup>

            {(remainingLimit.eq(0) || (remainingLimit.gt(0) && (percentage > 75))) &&
                <Flex flexDirection="column">
                    <Text style={{'textAlign': 'center'}}>
                        {(maxLimitReached) && <>
                                You have reached the max rewards for the day, it will reset in {nextRefresh.toUTCString()}
                            </>
                        }
                        {(hasLimitButNoSpace) &&
                            <>
                                Please claim your rewards to continue earning
                            </>}
                    </Text>
                </Flex>}
        </>
    )
}

export default RewardsEarned
