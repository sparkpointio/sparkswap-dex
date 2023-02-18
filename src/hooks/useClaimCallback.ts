import {TransactionResponse} from '@ethersproject/providers'
import {Contract} from "@ethersproject/contracts";
import {useCallback} from 'react'
import {useTransactionAdder} from '../state/transactions/hooks'
import {calculateGasMargin, getSwapRewardContract} from '../utils'
import {useActiveWeb3React} from './index'

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useClaimCallback(): [() => Promise<void>] {
    const {account, chainId, library} = useActiveWeb3React()
    const addTransaction = useTransactionAdder()

    // @ts-ignore
    const contract: Contract | null = getSwapRewardContract(chainId, library, account);

    const claimRewards = useCallback(async (): Promise<void> => {
        const estimatedGas = await contract.estimateGas.claimRewards(account)

        // eslint-disable-next-line consistent-return
        return contract
            .claimRewards(account, {
                gasLimit: calculateGasMargin(estimatedGas),
            })
            .then((response: TransactionResponse) => {

                addTransaction(response, {
                    summary: `Claim swap rewards`,
                })
            })
            .catch((error: Error) => {
                console.error('Failed to claim rewards', error)
                throw error
            })
    }, [account, contract, addTransaction])

    return [claimRewards]
}
