import "./App.css"
import { useState } from "react"
import logo from "./mantlelogo.svg"
import { Select } from "antd"
import { Routes, Route } from "react-router-dom"
import Home from "./components/Home"
import CreateAccount from "./components/CreateAccount"
import RecoverAccount from "./components/RecoverAccount"
import WalletView from "./components/WalletView"
import Transfer from "./components/Transfer"
import Swap from "./components/Swap"
import { Toaster } from "react-hot-toast"
function App() {
  const [wallet, setWallet] = useState(null)
  const [seedPhrase, setSeedPhrase] = useState(null)
  const [selectedChain, setSelectedChain] = useState("5001")

  return (
    <div className='App'>
      <header>
        <img src={logo} className='headerLogo' alt='logo' />
        <Select
          onChange={(val) => setSelectedChain(val)}
          value={selectedChain}
          options={[
            {
              label: "Testnet",
              value: "5001",
            },
          ]}
          className='dropdown'
        ></Select>
      </header>
      {wallet && seedPhrase ? (
        <Routes>
          <Route
            path='/yourwallet'
            element={
              <WalletView
                wallet={wallet}
                setWallet={setWallet}
                seedPhrase={seedPhrase}
                setSeedPhrase={setSeedPhrase}
                selectedChain={selectedChain}
              />
            }
          />
          <Route
            path='/transfer'
            element={
              <Transfer
                wallet={wallet}
                seedPhrase={seedPhrase}
                selectedChain={selectedChain}
              />
            }
          />
          <Route
            path='/swap'
            element={
              <Swap
                wallet={wallet}
                seedPhrase={seedPhrase}
                selectedChain={selectedChain}
              />
            }
          />
        </Routes>
      ) : (
        <Routes>
          <Route path='/' element={<Home />} />
          <Route
            path='/recover'
            element={
              <RecoverAccount
                setSeedPhrase={setSeedPhrase}
                setWallet={setWallet}
              />
            }
          />
          <Route
            path='/yourwallet'
            element={
              <CreateAccount
                setSeedPhrase={setSeedPhrase}
                setWallet={setWallet}
              />
            }
          />
        </Routes>
      )}
      <Toaster
        position='top-right'
        reverseOrder={false}
        gutter={8}
        containerClassName=''
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: "border border-primary-green",
          duration: 5000,
          style: {
            background: "#15171A",
            color: "#65B3AD",
          },
        }}
      />
    </div>
  )
}

export default App
