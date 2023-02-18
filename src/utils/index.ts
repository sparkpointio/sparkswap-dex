import {Contract} from '@ethersproject/contracts'
import {getAddress} from '@ethersproject/address'
import {AddressZero} from '@ethersproject/constants'
import {JsonRpcSigner, Web3Provider} from '@ethersproject/providers'
import {BigNumber} from '@ethersproject/bignumber'
import {ChainId, Currency, CurrencyAmount, ETHER, JSBI, Percent, Token} from '@sparkpointio/sparkswap-sdk'
import {ROUTER_ADDRESS, SPARKREWARD_ABI, SPARKREWARD_ADDRESS} from '../constants'
import {TokenAddressMap} from '../state/lists/hooks'
import ROUTER_ABI from '../constants/router/abi.json'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
    56: '',
    97: 'testnet.'
}

export function getEtherscanLink(chainId: ChainId, data: string, type: 'transaction' | 'token' | 'address'): string {
    const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[56]}bscscan.com`

    switch (type) {
        case 'transaction': {
            return `${prefix}/tx/${data}`
        }
        case 'token': {
            return `${prefix}/token/${data}`
        }
        case 'address':
        default: {
            return `${prefix}/address/${data}`
        }
    }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
    const parsed = isAddress(address)
    if (!parsed) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }
    return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
    return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
    return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
    if (slippage < 0 || slippage > 10000) {
        throw Error(`Unexpected slippage value: ${slippage}`)
    }
    return [
        JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
        JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
    ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
    return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
    return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }

    return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getRouterContract(_: number, library: Web3Provider, account?: string): Contract {
    return getContract(ROUTER_ADDRESS, ROUTER_ABI, library, account)
}

export function getSwapRewardContract(_: number, library: Web3Provider, account?: string): Contract {
    return getContract(SPARKREWARD_ADDRESS, SPARKREWARD_ABI, library, account)
}

export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
    if (currency === ETHER) return true
    return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export const epochToDate = (epochTime) => {
    const date = new Date(0) // The 0 there is the key, which sets the date to the epoch
    date.setUTCSeconds(epochTime)

    return date
}
