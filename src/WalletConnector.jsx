import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

export default function WalletConnector() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Initialize Ethereum provider
  useEffect(() => {
    if (window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } else {
      console.error("MetaMask or a compatible wallet is required!");
    }
  }, []);

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this DApp.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setChainId(await window.ethereum.request({ method: "eth_chainId" }));
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // Disconnect Wallet (Clear state)
  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
  };

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };

    const handleChainChanged = (newChainId) => {
      setChainId(newChainId);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // Switch Ethereum Chain
  const switchChain = async (chainHex) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainHex }],
      });
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  // Add a custom Ethereum chain
  const addEthereumChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x89", // Polygon Mainnet
            chainName: "Polygon",
            rpcUrls: ["https://polygon-rpc.com/"],
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            blockExplorerUrls: ["https://polygonscan.com/"],
          },
        ],
      });
    } catch (error) {
      console.error("Failed to add chain:", error);
    }
  };

  // Send ETH between accounts
  const sendEth = async (to, amount) => {
    if (!provider || !account) return;
    try {
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      console.log("Transaction successful:", tx);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div>
      <h2>Ethereum Wallet</h2>
      {account ? (
        <div>
          <p>Connected: {account}</p>
          <p>Chain ID: {chainId}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
          <button onClick={() => switchChain("0x1")}>Switch to Ethereum</button>
          <button onClick={() => sendEth("0xRecipientAddress", "0.01")}>Send 0.01 ETH</button>
          <button onClick={addEthereumChain}>Add Polygon Network</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
