import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Divider, Tooltip, Spin, Input, Button } from "antd"
import { LeftCircleOutlined } from "@ant-design/icons"
import { CHAINS_CONFIG } from "../chains"
import { ethers } from "ethers"

function Transfer({ wallet, seedPhrase, selectedChain }) {
  const navigate = useNavigate()
  // const [balance, setBalance] = useState(0)
  const [amountToSend, setAmountToSend] = useState(null)
  const [sendToAddress, setSendToAddress] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [hash, setHash] = useState(null)
  const chain = CHAINS_CONFIG[selectedChain]

  async function sendTransaction(to, amount) {
    console.log("chain", chain)

    const provider = new ethers.JsonRpcProvider(chain.rpcUrl)

    const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey

    const wallet = new ethers.Wallet(privateKey, provider)

    const tx = {
      to: to,
      value: ethers.parseEther(amount.toString()),
    }

    setProcessing(true)
    try {
      const transaction = await wallet.sendTransaction(tx)

      setHash(transaction.hash)
      const receipt = await transaction.wait()

      setHash(null)
      setProcessing(false)
      setAmountToSend(null)
      setSendToAddress(null)

      if (receipt.status === 1) {
        navigate("/yourwallet")
      } else {
        console.log("failed")
      }
    } catch (err) {
      setHash(null)
      setProcessing(false)
      setAmountToSend(null)
      setSendToAddress(null)
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
            Send
          </span>
        </div>
      </div>
      <Divider />
      <div className='sendRow'>
        <p style={{ width: "90px", textAlign: "left" }}> To:</p>
        <Input
          value={sendToAddress}
          onChange={(e) => setSendToAddress(e.target.value)}
          placeholder='0x...'
        />
      </div>
      <div className='sendRow'>
        <p style={{ width: "90px", textAlign: "left" }}> Amount:</p>
        <Input
          value={amountToSend}
          onChange={(e) => setAmountToSend(e.target.value)}
          placeholder='Native tokens you wish to send...'
        />
      </div>
      <Button
        style={{
          width: "100%",
          marginTop: "20px",
          marginBottom: "20px",
          backgroundColor: "#12655F",
          color: "white",
        }}
        type='primary'
        onClick={() => sendTransaction(sendToAddress, amountToSend)}
      >
        Send Tokens
      </Button>
      {processing && (
        <>
          <Spin />
          {hash && (
            <Tooltip title={hash}>
              <p>Hover For Tx Hash</p>
            </Tooltip>
          )}
        </>
      )}
    </div>
  )
}

export default Transfer
