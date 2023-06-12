import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Divider, Button, Select } from "antd"
import { LeftCircleOutlined } from "@ant-design/icons"
import { CHAINS_CONFIG } from "../chains"
import { ethers } from "ethers"
import BeatLoader from "react-spinners/BeatLoader"
import { ExclamationCircleOutlined } from "@ant-design/icons"
import {
  getAmountOut,
  swapTokens,
  getRouter,
  getBalanceOfTokens,
} from "../ethereumFunctions"

const MantleTestnetCoins = [
  {
    name: "BIT Token",
    symbol: "BIT",
    address: "0xfA09371349C98e4a57bBFd8cFF6084D6693C7243",
    // logo: bit,
  },
  {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
    // logo: weth,
  },
  {
    name: "Clown",
    symbol: "CLOWN",
    address: "0x0d7f7eb2efD4c97CA8883D197889B17615796871",
  },
]

function Swap({ wallet, seedPhrase, selectedChain }) {
  const chain = CHAINS_CONFIG[selectedChain]
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [swapLoading, setSwapLoading] = useState(false)
  const [swapAmount, setSwapAmount] = useState("0.1")
  const [swapInAmount, setSwapInAmount] = useState(0)
  const [nonValid, setNonValid] = useState(false)
  const [tokenIn, setTokenIn] = useState(MantleTestnetCoins[0])
  const [tokenOut, setTokenOut] = useState(MantleTestnetCoins[1])
  const [coin1, setCoin1] = useState({
    address: undefined,
    balance: undefined,
  })
  const [coin2, setCoin2] = useState({
    address: undefined,
    balance: undefined,
  })
  const provider = new ethers.JsonRpcProvider(chain.rpcUrl)
  //   console.log("this is provider", provider)
  const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey
  //   console.log("this is private key", privateKey)
  const signer = new ethers.Wallet(privateKey, provider)
  useEffect(() => {
    if (!tokenIn || !tokenOut) return
    setTokenIn(tokenIn)
    setTokenOut(tokenOut)
    if (tokenIn.symbol === tokenOut.symbol) {
      setNonValid(true)
    } else {
      console.log("this is token in", tokenIn)
      setNonValid(false)

      //   console.log("this is signer", signer)
      async function getBalance() {
        const router = getRouter(
          "0xdbf497b3D74E7812E81F87614316A90c3a1806f7",
          provider
        )
        const weth_address = await router.WETH()
        console.log("this is weth address", weth_address)
        getBalanceOfTokens(
          wallet,
          tokenIn.address,
          provider,
          signer,
          weth_address
        ).then((data) => {
          setCoin1({
            address: tokenIn.address,
            balance: data.balance,
          })
        })
        getBalanceOfTokens(
          wallet,
          tokenOut.address,
          provider,
          signer,
          weth_address
        ).then((data) => {
          setCoin2({
            address: tokenOut.address,
            balance: data.balance,
          })
        })
        if (isNaN(parseFloat(swapAmount))) {
          setSwapInAmount("")
        } else if (parseFloat(swapAmount)) {
          setLoading(true)
          getAmountOut(
            tokenIn.address,
            tokenOut.address,
            swapAmount,
            router,
            signer
          )
            .then((amount) => setSwapInAmount(amount), setLoading(false))
            .catch((e) => {
              console.log(e)
              setLoading(false)
              setSwapInAmount("NA")
            })
        } else {
          setSwapInAmount("")
        }
      }
      getBalance()
    }
    // eslint-disable-next-line
  }, [tokenIn, tokenOut, swapAmount])

  function handleChange(e) {
    setSwapAmount(e.target.value)
  }

  async function swap() {
    console.log("Attempting to swap tokens...")
    setSwapLoading(true)

    const provider = new ethers.JsonRpcProvider(chain.rpcUrl)
    const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey
    const signer = new ethers.Wallet(privateKey, provider)
    const router = await getRouter(
      "0xdbf497b3D74E7812E81F87614316A90c3a1806f7",
      provider
    )
    console.log("this is router", router)
    const res = await swapTokens(
      tokenIn.address,
      tokenOut.address,
      swapAmount,
      router,
      wallet,
      signer,
      seedPhrase
    )
    setSwapLoading(false)
    navigate("/yourwallet")
    if (res === undefined) {
      setSwapLoading(false)
      //   navigate("/yourwallet")
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <Button
          onClick={() => navigate("/yourwallet")}
          style={{ marginRight: "60px" }}
        >
          <LeftCircleOutlined />
          Back
        </Button>
        <div>
          <span
            style={{
              color: "black",
              fontWeight: "700",
              fontSize: "1.5em",
              marginRight: "20px",
            }}
          >
            Swap
          </span>
        </div>
      </div>
      <Divider />
      <div className='swapBody'>
        <div
          className='currencyInput'
          style={{ display: "flex", justifyContent: "space-around" }}
        >
          <div className='col-md-6 numberContainer'>
            <input
              className='currencyInputField'
              type='number'
              value={swapAmount}
              placeholder='0.0'
              onChange={handleChange}
            />
          </div>
          <div className='col-md-6 tokenContainer'>
            <span className='tokenName'>
              <Select
                defaultValue={tokenIn.symbol}
                style={{
                  width: 120,
                  color: "black",
                  fontWeight: "700",
                  fontSize: "1.5em",
                }}
                options={MantleTestnetCoins.map((token) => ({
                  value: token.symbol,
                }))}
                onChange={(value) =>
                  setTokenIn(
                    MantleTestnetCoins.find((token) => token.symbol === value)
                  )
                }
              />
            </span>
            <div className='balanceContainer'>
              <span className='balanceAmount'>Balance:{coin1.balance}</span>
            </div>
          </div>
        </div>
        <div
          className='currencyInput'
          style={{ display: "flex", justifyContent: "space-around" }}
        >
          <div className='col-md-6 numberContainer'>
            {loading ? (
              <div className='spinnerContainer'>
                <BeatLoader />
              </div>
            ) : (
              <input
                className='currencyInputField'
                placeholder='0.0'
                value={swapInAmount}
                disabled
              />
            )}
          </div>
          <div className='col-md-6 tokenContainer'>
            <span className='tokenName'>
              <Select
                defaultValue={tokenOut.symbol}
                style={{
                  width: 120,
                  color: "black",
                  fontWeight: "700",
                  fontSize: "1.5em",
                }}
                options={MantleTestnetCoins.map((token) => ({
                  value: token.symbol,
                }))}
                onChange={(value) =>
                  setTokenOut(
                    MantleTestnetCoins.find((token) => token.symbol === value)
                  )
                }
              />
            </span>
            <div className='balanceContainer'>
              <span className='balanceAmount'>Balance:{coin2.balance}</span>
            </div>
          </div>
        </div>
        {nonValid && (
          <div className='mnemonic'>
            <ExclamationCircleOutlined style={{ fontSize: "20px" }} />
            <div>Can't Swap same token</div>
          </div>
        )}
        <div className='swapButtonContainer'>
          <div onClick={swap} className='swapButton'>
            {swapLoading ? (
              <div>
                Swap <BeatLoader />{" "}
              </div>
            ) : (
              <span>Swap</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Swap
