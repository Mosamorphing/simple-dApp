import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function WalletConnector() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState(""); // State for recipient address
  const [amount, setAmount] = useState(""); // State for amount to send

  // Initialize Ethereum provider
  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
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

    // Cleanup function
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
      if (error.code === 4902) {
        console.error("Chain not added to wallet. Please add it first.");
      } else {
        console.error("Failed to switch chain:", error);
      }
    }
  };

  // Add a custom Ethereum chain
  const addEthereumChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x5", // Goerli Testnet
            chainName: "Goerli Testnet",
            rpcUrls: ["https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            blockExplorerUrls: ["https://goerli.etherscan.io/"],
          },
        ],
      });
    } catch (error) {
      console.error("Failed to add Ethereum chain:", error);
    }
  };

  // Send ETH between accounts
  const sendEth = async () => {
    if (!provider || !account || !recipientAddress || !amount) {
      alert("Please connect your wallet, enter a recipient address, and specify an amount.");
      return;
    }
    try {
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      console.log("Transaction successful:", tx);
      alert(`Transaction successful! TX Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      {/* Centered Headings */}
      <h1 style={{ margin: "0.4" }}>Simple dApp</h1>
      {/* <h2 style={{ margin: "0" }}>Ethereum Wallet</h2> */}

      {/* Wallet Address and Chain ID Display */}
      {account && (
        <div style={{ marginBottom: "10px" }}>
          <p style={{ margin: "0" }}>Connected: {account}</p>
          <p style={{ margin: "0" }}>Chain ID: {chainId}</p>
        </div>
      )}

      {/* Connect Wallet Button (if not connected) */}
      {!account && (
        <button onClick={connectWallet} style={{ width: "100%", padding: "10px" }}>
          Connect Wallet
        </button>
      )}

      {/* Wallet Actions (if connected) */}
      {account && (
        <>
          {/* Top Row: Disconnect and Switch to Ethereum */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={disconnectWallet} style={{ flex: 1 }}>
              Disconnect
            </button>
            <button onClick={() => switchChain("0x1")} style={{ flex: 1 }}>
              Switch to Ethereum
            </button>
          </div>

          {/* Middle Row: Recipient Address and Amount Inputs */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              style={{ flex: 1, padding: "8px" }}
            />
            <input
              type="text"
              placeholder="Amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ flex: 1, padding: "8px" }}
            />
          </div>

          {/* Bottom Row: Send ETH Button */}
          <button onClick={sendEth} style={{ width: "100%", padding: "10px" }}>
            Send ETH
          </button>

          {/* Last Row: Add Goerli Testnet Button */}
          <button onClick={addEthereumChain} style={{ width: "100%", padding: "10px" }}>
            Add Goerli Testnet
          </button>
        </>
      )}
    </div>
  );
}