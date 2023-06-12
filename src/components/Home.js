import React from "react"
import { Button } from "antd"
import { useNavigate } from "react-router-dom"

function Home() {
  const navigate = useNavigate()

  return (
    <>
      <div className='content'>
        <h2> Hey There 👋 </h2>
        <h4 className='h4'> Welcome to your mantle Wallet</h4>
        <Button
          onClick={() => navigate("/yourwallet")}
          className='frontPageButton'
          style={{ backgroundColor: "#12655F", color: "white" }}
        >
          Create A Wallet
        </Button>
        <Button
          onClick={() => navigate("/recover")}
          className='frontPageButton'
          type='default'
        >
          Sign In With Seed Phrase
        </Button>
        <p className='frontPageBottom'>
          Get faucet tokens from the{" "}
          <a
            href='https://faucet.testnet.mantle.xyz/'
            target='_blank'
            rel='noreferrer'
            style={{ color: "#12655F" }}
          >
            Mantle Faucet
          </a>
        </p>
      </div>
    </>
  )
}

export default Home
