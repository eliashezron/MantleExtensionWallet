import React, { useEffect, useState } from "react"
import { Divider, Tooltip, List, Avatar, Spin, Tabs, Button } from "antd"
import { LogoutOutlined, SwapOutlined, SendOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import logo from "../noImg.png"
import axios from "axios"
import { CHAINS_CONFIG } from "../chains"
import { ethers } from "ethers"
import { bit, weth } from "../assets"
// import ERC20_ABI from "../build/ERC20.json"
// const tokens = [{ name: "Mantle", symbol: "BIT", address: "0x000000000" , balance: balance}]
const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]
const nfts = null
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

function WalletView({
  wallet,
  setWallet,
  // eslint-disable-next-line
  seedPhrase,
  setSeedPhrase,
  selectedChain,
}) {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [wethBalance, setWethBalance] = useState(0)
  const [clownBalance, setClownBalance] = useState(0)
  // eslint-disable-next-line
  const [fetching, setFetching] = useState(false)

  const [txs, setTxs] = useState([])

  const tokens = [
    {
      name: "Mantle",
      symbol: "BIT",

      balance: balance,
      logo: bit,
    },
    {
      name: "Wrapped Ethereum",
      symbol: "WETH",

      balance: wethBalance,
      logo: weth,
    },
    {
      name: "Clown",
      symbol: "CLOWN",

      balance: clownBalance,
      logo: logo,
    },
  ]

  const items = [
    {
      key: "3",
      label: `Tokens`,
      children: (
        <>
          {tokens ? (
            <>
              <List
                bordered
                itemLayout='horizontal'
                dataSource={tokens}
                renderItem={(item, index) => (
                  <List.Item style={{ textAlign: "left" }}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo || logo} />}
                      title={item.symbol}
                      description={item.name}
                    />
                    <div style={{ fontWeight: "700" }}>
                      <span
                        style={{
                          color: "black",
                          fontWeight: "700",
                          fontSize: "1.5em",
                          marginRight: "0.1em",
                        }}
                      >
                        {" "}
                        {item.balance}
                      </span>
                      {item.symbol}
                    </div>
                  </List.Item>
                )}
              />
            </>
          ) : (
            <>
              <List bordered />
            </>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: `NFTs`,
      children: (
        <>
          {nfts ? (
            <>
              <List
                bordered
                itemLayout='horizontal'
                dataSource={nfts}
                renderItem={(item, index) => (
                  <List.Item style={{ textAlign: "left" }}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo || logo} />}
                      // title={item.symbol}
                      // description={item.name}
                    />
                    <div>{item.value}</div>
                  </List.Item>
                )}
              />
            </>
          ) : (
            <>
              <List bordered />
            </>
          )}
        </>
      ),
    },
    {
      key: "1",
      label: `Activity`,
      children: (
        <>
          {txs ? (
            <>
              <List
                bordered
                itemLayout='horizontal'
                dataSource={txs}
                renderItem={(item, index) => {
                  const date = new Date(
                    parseInt(item.timeStamp) * 1000
                  ).toLocaleString()
                  return (
                    <List.Item style={{ textAlign: "left" }}>
                      <List.Item.Meta title={item.Input} description={date} />
                      <div style={{ fontWeight: "700" }}>
                        <span
                          style={{
                            color: "black",
                            fontWeight: "700",
                            fontSize: "1.5em",
                            marginRight: "0.1em",
                          }}
                        >
                          {" "}
                          {ethers.formatEther(item.value)}
                        </span>
                        BIT
                      </div>
                    </List.Item>
                  )
                }}
              />
            </>
          ) : (
            <>
              <List bordered />
            </>
          )}
        </>
      ),
    },
  ]

  function logout() {
    setSeedPhrase(null)
    setWallet(null)
    setBalance(0)
    navigate("/")
  }

  useEffect(() => {
    if (!wallet || !selectedChain) return
    const chain = CHAINS_CONFIG[selectedChain]
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl)

    async function getBalance() {
      const balance = await provider.getBalance(wallet)
      setBalance(Number(ethers.formatEther(balance)).toFixed(2))
      const wethContract = new ethers.Contract(
        MantleTestnetCoins[1].address,
        abi,
        provider
      )
      const balance2 = await wethContract.balanceOf(wallet)
      setWethBalance(Number(ethers.formatEther(balance2)).toFixed(5))
      const clownContract = new ethers.Contract(
        MantleTestnetCoins[2].address,
        abi,
        provider
      )
      const balance3 = await clownContract.balanceOf(wallet)
      setClownBalance(Number(ethers.formatEther(balance3)).toFixed(4))
    }
    getBalance()
    // eslint-disable-next-line
  }, [balance, wethBalance, clownBalance, txs])
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "https://explorer.testnet.mantle.xyz/api",
          {
            params: {
              module: "account",
              action: "txlist",
              address: wallet,
              startblock: 0,
              endblock: 99999999,
              page: 1,
              offset: 100,
              sort: "desc",
            },
          }
        )
        // Handle the response data
        setTxs(response.data.result)
        // console.log(response.data)
      } catch (error) {
        // Handle any errors
        console.error("Error fetching data:", error)
      }
    }

    // Call the fetchData function
    fetchData()
  }, [txs, balance, wallet])

  return (
    <>
      <div className='content' style={{ marginTop: "-20px" }}>
        <div className='logoutButton' onClick={logout}>
          <LogoutOutlined />
        </div>
        <div className='walletName'>Account</div>
        <Tooltip title={wallet}>
          <div>
            {wallet.slice(0, 4)}...{wallet.slice(38)}
          </div>
        </Tooltip>
        <div
          className='walletName'
          style={{ marginTop: "10px", fontSize: "2em" }}
        >
          {balance} {CHAINS_CONFIG[selectedChain].ticker}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            style={{ marginRight: "10px" }}
            onClick={() => navigate("/transfer")}
          >
            send
            <SendOutlined />
          </Button>
          <Button onClick={() => navigate("/swap")}>
            Swap
            <SwapOutlined />
          </Button>
        </div>

        <Divider />
        {fetching ? (
          <Spin />
        ) : (
          <Tabs defaultActiveKey='3' items={items} className='walletView' />
        )}
      </div>
    </>
  )
}

export default WalletView
