import { Contract, ethers } from "ethers"
import * as chains from "./constants/chains"
// import COINS from "./constants/coins"
import Web3 from "web3"
import toast from "react-hot-toast"
import { BigNumber } from "@ethersproject/bignumber"
const ROUTER = require("./build/UniswapV2Router02.json")
const ERC20 = require("./build/ERC20.json")
const FACTORY = require("./build/IUniswapV2Factory.json")
const PAIR = require("./build/IUniswapV2Pair.json")
const web3 = new Web3("https://rpc.testnet.mantle.xyz")
export function getProvider() {
  return new ethers.JsonRpcProvider("https://rpc.testnet.mantle.xyz")
}

export function getSigner(provider, seedPhrase) {
  const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey
  const signer = new ethers.Wallet(privateKey, provider)
  return signer
}

export async function getNetwork(provider) {
  const network = await provider.getNetwork()
  return network.chainId
}

export function getRouter(address, signer) {
  return new ethers.Contract(address, ROUTER.abi, signer)
}

export async function checkNetwork(provider) {
  const chainId = getNetwork(provider)
  if (chains.networks.includes(chainId)) {
    return true
  }
  return false
}

export function getWeth(address, signer) {
  return new Contract(address, ERC20.abi, signer)
}

export function getFactory(address, signer) {
  return new Contract(address, FACTORY.abi, signer)
}

export async function getAccount() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  })

  return accounts[0]
}

//This function checks if a ERC20 token exists for a given address
//    `address` - The Ethereum address to be checked
//    `signer` - The current signer
export function doesTokenExist(address, signer) {
  try {
    return new Contract(address, ERC20.abi, signer)
  } catch (err) {
    return false
  }
}

export async function getDecimals(token) {
  const decimals = await token
    .decimals()
    .then((result) => {
      return result
    })
    .catch((error) => {
      console.log("No tokenDecimals function for this token, set to 0")
      return 0
    })
  return decimals
}

// This function returns an object with 2 fields: `balance` which container's the account's balance in the particular token,
// and `symbol` which is the abbreviation of the token name. To work correctly it must be provided with 4 arguments:
//    `accountAddress` - An Ethereum address of the current user's account
//    `address` - An Ethereum address of the token to check for (either a token or AUT)
//    `provider` - The current provider
//    `signer` - The current signer
export async function getBalanceOfTokens(
  accountAddress,
  address,
  provider,
  signer,
  weth_address
  // coins
) {
  try {
    if (address === weth_address) {
      const balance = await provider.getBalance(accountAddress)
      return {
        balance: Number(ethers.formatEther(balance)).toFixed(6),
        // symbol: coins[0].symbol,
      }
    } else {
      const token = new Contract(address, ERC20.abi, signer)
      // const tokenDecimals = await getDecimals(token)
      const balance = await token.balanceOf(accountAddress)
      // const symbol = await token.symbol()

      return {
        balance: Number(ethers.formatEther(balance)).toFixed(6),
        // symbol: symbol,
      }
    }
  } catch (error) {
    console.log("The getBalanceAndSymbol function had an error!")
    console.log(error)
    return false
  }
}

// This function swaps two particular tokens / AUT, it can handle switching from AUT to ERC20 token, ERC20 token to AUT, and ERC20 token to ERC20 token.
// No error handling is done, so any issues can be caught with the use of .catch()
// To work correctly, there needs to be 7 arguments:
//    `address1` - An Ethereum address of the token to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a token or AUT)
//    `amount` - A float or similar number representing the value of address1's token to trade
//    `routerContract` - The router contract to carry out this trade
//    `accountAddress` - An Ethereum address of the current user's account
//    `signer` - The current signer
export async function swapTokens(
  address1,
  address2,
  amount,
  routerContract,
  accountAddress,
  signer,
  seedPhrase
) {
  const tokens = [address1, address2]
  const time = Math.floor(Date.now() / 1000) + 200000
  const deadline = BigNumber.from(time.toString())

  const token1 = new Contract(address1, ERC20.abi, signer)
  // const tokenDecimals = await getDecimals(token1)

  const amountIn = ethers.parseUnits(amount, 18)
  const amountOut = await routerContract.getAmountsOut(amountIn, tokens)

  await token1.approve(routerContract.target, amountIn)
  const wethAddress = await routerContract.WETH()
  const nounce = await web3.eth.getTransactionCount(accountAddress)
  const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey
  if (address1 === wethAddress && amountOut) {
    const functionSignature = {
      name: "swapExactETHForTokens",
      type: "function",
      inputs: [
        {
          internalType: "uint256",
          name: "amountOutMin",
          type: "uint256",
        },
        {
          internalType: "address[]",
          name: "path",
          type: "address[]",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "deadline",
          type: "uint256",
        },
      ],
    }

    const params = [
      BigNumber.from(amountOut[1]),
      tokens,
      accountAddress,
      deadline,
    ]
    const data = web3.eth.abi.encodeFunctionCall(functionSignature, params)

    const txObject = {
      from: accountAddress,
      to: "0xdbf497b3D74E7812E81F87614316A90c3a1806f7",
      data: data,
      value: amountIn,
      gas: 1000000,
      gasPrice: ethers.parseUnits("1", "wei"),
      nounce: nounce, // Optional, only needed if you want to specify a specific nonce
    }

    const signedTransaction = await web3.eth.accounts.signTransaction(
      txObject,
      privateKey
    )
    try {
      const transactionReceipt = await web3.eth.sendSignedTransaction(
        signedTransaction.rawTransaction
      )
      toast("transaction successfull")
      return transactionReceipt
    } catch (error) {
      console.log(error)
      toast(error.message, {
        className: "border border-red-500",
      })
    }
  } else if (address2 === wethAddress) {
    // Token -> Eth
    const functionSignature1 = {
      name: "swapExactTokensForETH",
      type: "function",
      inputs: [
        {
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountOutMin",
          type: "uint256",
        },
        {
          internalType: "address[]",
          name: "path",
          type: "address[]",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "deadline",
          type: "uint256",
        },
      ],
    }

    const params1 = [
      amountIn,
      BigNumber.from(amountOut[1]),
      tokens,
      accountAddress,
      deadline,
    ]
    const data1 = web3.eth.abi.encodeFunctionCall(functionSignature1, params1)

    const txObject1 = {
      from: accountAddress,
      to: "0xdbf497b3D74E7812E81F87614316A90c3a1806f7",
      data: data1,
      gas: 1000000,
      gasPrice: ethers.parseUnits("1", "wei"),
      nounce: nounce, // Optional, only needed if you want to specify a specific nonce
    }

    const signedTransaction = await web3.eth.accounts.signTransaction(
      txObject1,
      privateKey
    )
    try {
      const transactionReceipt = await web3.eth.sendSignedTransaction(
        signedTransaction.rawTransaction
      )
      toast("transaction successfull")
      return transactionReceipt
    } catch (error) {
      console.log(error)
      toast(error.message, {
        className: "border border-red-500",
      })
    }
  } else {
    const functionSignature = {
      name: "swapExactTokensForTokens",
      type: "function",
      inputs: [
        {
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountOutMin",
          type: "uint256",
        },
        {
          internalType: "address[]",
          name: "path",
          type: "address[]",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "deadline",
          type: "uint256",
        },
      ],
    }

    const params = [
      amountIn,
      BigNumber.from(amountOut[1]),
      tokens,
      accountAddress,
      deadline,
    ]
    const data = web3.eth.abi.encodeFunctionCall(functionSignature, params)

    const txObject = {
      from: accountAddress,
      to: "0xdbf497b3D74E7812E81F87614316A90c3a1806f7",
      data: data,
      gas: 1000000,
      gasPrice: ethers.parseUnits("1", "wei"),
      nounce: nounce, // Optional, only needed if you want to specify a specific nonce
    }

    const signedTransaction = await web3.eth.accounts.signTransaction(
      txObject,
      privateKey
    )
    try {
      const transactionReceipt = await web3.eth.sendSignedTransaction(
        signedTransaction.rawTransaction
      )
      toast("transaction successfull")
      return transactionReceipt
    } catch (error) {
      console.log(error)
      toast(error.message, {
        className: "border border-red-500",
      })
    }
  }
}

//This function returns the conversion rate between two token addresses
//    `address1` - An Ethereum address of the token to swaped from (either a token or AUT)
//    `address2` - An Ethereum address of the token to swaped to (either a token or AUT)
//    `amountIn` - Amount of the token at address 1 to be swaped from
//    `routerContract` - The router contract to carry out this swap
export async function getAmountOut(
  address1,
  address2,
  amountIn,
  routerContract,
  signer
) {
  try {
    const token1 = new Contract(address1, ERC20.abi, signer)
    // eslint-disable-next-line
    const token1Decimals = await getDecimals(token1)

    const token2 = new Contract(address2, ERC20.abi, signer)
    // eslint-disable-next-line
    const token2Decimals = await getDecimals(token2)

    const values_out = await routerContract.getAmountsOut(
      ethers.parseEther(amountIn.toString()),
      [address1, address2]
    )
    const amount_out = ethers.formatEther(values_out[1].toString())
    console.log("amount out: ", amount_out)
    return amount_out
  } catch {
    return false
  }
}

// This function calls the pair contract to fetch the reserves stored in a the liquidity pool between the token of address1 and the token
// of address2. Some extra logic was needed to make sure that the results were returned in the correct order, as
// `pair.getReserves()` would always return the reserves in the same order regardless of which order the addresses were.
//    `address1` - An Ethereum address of the token to trade from (either a ERC20 token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a ERC20 token or AUT)
//    `pair` - The pair contract for the two tokens
export async function fetchReserves(address1, address2, pair, signer) {
  try {
    // Get decimals for each coin
    const coin1 = new Contract(address1, ERC20.abi, signer)
    const coin2 = new Contract(address2, ERC20.abi, signer)

    const coin1Decimals = await getDecimals(coin1)
    const coin2Decimals = await getDecimals(coin2)

    // Get reserves
    const reservesRaw = await pair.getReserves()

    // Put the results in the right order
    const results = [
      (await pair.token0()) === address1 ? reservesRaw[0] : reservesRaw[1],
      (await pair.token1()) === address2 ? reservesRaw[1] : reservesRaw[0],
    ]

    // Scale each to the right decimal place
    return [
      results[0] * 10 ** -coin1Decimals,
      results[1] * 10 ** -coin2Decimals,
    ]
  } catch (err) {
    console.log("error!")
    console.log(err)
    return [0, 0]
  }
}

// This function returns the reserves stored in a the liquidity pool between the token of address1 and the token
// of address2, as well as the liquidity tokens owned by accountAddress for that pair.
//    `address1` - An Ethereum address of the token to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a token or AUT)
//    `factory` - The current factory
//    `signer` - The current signer
export async function getReserves(
  address1,
  address2,
  factory,
  signer,
  accountAddress
) {
  try {
    const pairAddress = await factory.getPair(address1, address2)
    const pair = new Contract(pairAddress, PAIR.abi, signer)

    if (pairAddress !== "0x0000000000000000000000000000000000000000") {
      const reservesRaw = await fetchReserves(address1, address2, pair, signer)
      const liquidityTokens_BN = await pair.balanceOf(accountAddress)
      const liquidityTokens = Number(ethers.formatEther(liquidityTokens_BN))

      return [
        reservesRaw[0].toPrecision(6),
        reservesRaw[1].toPrecision(6),
        liquidityTokens,
      ]
    } else {
      console.log("no reserves yet")
      return [0, 0, 0]
    }
  } catch (err) {
    console.log("error!")
    console.log(err)
    return [0, 0, 0]
  }
}
