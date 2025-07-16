import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit, useAppKitProvider } from './AppKitProvider';
import { auctionHouseAbi, auctionHouseAddress } from './auctionHouse.abi';
import { tokenAbi, tokenContractAddress } from './token.abi';
import { BrowserProvider, Contract, ethers } from 'ethers';

function App() {
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { modal } = useAppKit();
  const { walletProvider } = useAppKitProvider('eip155');

  const [loading, setLoading] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [approvalError, setApprovalError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const isDev = true;
    const isMobile = window.innerWidth <= 768;

    if ((isDev || isMobile) && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/eruda';
      script.onload = () => {
        window.eruda && window.eruda.init();
      };
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    document.body.style.background = darkMode ? '#121212' : '#ffffff';
    document.body.style.color = darkMode ? '#ffffff' : '#000000';
  }, [darkMode]);

  const handleApproveToken = async () => {
    setApprovalSuccess(false);
    setApprovalError('');
    setLoading(true);

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const tokenContract = new Contract(
        tokenContractAddress,
         ["function approve(address spender, uint256 amount) returns (bool)", "function decimals() view returns (uint8)", "function symbol() view returns (string)"],
        signer
      );
      console.log(`Approving token contract at ${tokenContractAddress} for auction house at ${auctionHouseAddress}`);
      console.log({tokenContract})
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();
      const amount = ethers.parseUnits('0.01', decimals); // approve 0.01

      const tx = await tokenContract.approve(auctionHouseAddress, amount);
      await tx.wait();

      setApprovalSuccess(true);
      console.log(`✅ Approved 0.01 ${symbol} to ${auctionHouseAddress}`);
    } catch (err) {
      console.error(err);
      setApprovalError(err.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🏦 Token Approval</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: '4px 10px',
            fontSize: '14px',
            background: darkMode ? '#333' : '#ddd',
            color: darkMode ? '#fff' : '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <p>Account: {isConnected ? address : 'Not connected'}</p>
        {isConnected && (
          <button
            onClick={() => disconnect()}
            style={{
              background: '#e53935',
              color: '#fff',
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Disconnect
          </button>
        )}
      </div>

      {!isConnected ? (
        <button
          onClick={() => modal.open()}
          style={{
            background: '#6200ea',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <hr style={{ margin: '20px 0', border: '1px dashed #888' }} />
          <h3>Approve Token</h3>
          <button
            onClick={handleApproveToken}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: loading ? '#aaa' : '#ffb300',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Approving...' : 'Approve 0.01 Token'}
          </button>

          {approvalSuccess && <p style={{ color: 'green' }}>✅ Token approved successfully!</p>}
          {approvalError && <p style={{ color: 'red' }}>❌ Error: {approvalError}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
