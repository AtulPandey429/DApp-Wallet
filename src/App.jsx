import React, { useState, useEffect } from 'react';
import { useAccount,useDisconnect } from 'wagmi';
import { useAppKit, useAppKitProvider } from './AppKitProvider';
import { contractABI, contractAddress } from './abi';
import { BrowserProvider, Contract } from 'ethers';

function App() {
  const { disconnect } = useDisconnect();

  const { address, isConnected } = useAccount();
  const { modal } = useAppKit();
  const { walletProvider } = useAppKitProvider('eip155');

  const [playerName, setPlayerName] = useState('');
  const [lookupName, setLookupName] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txError, setTxError] = useState('');
  const [darkMode, setDarkMode] = useState(true);
 useEffect(() => {
    // Only load in development or if window width is mobile-like
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

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    setTxSuccess(false);
    setTxError('');

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);

      const tx = await contract.addPlayer(playerName);
      await tx.wait();
      setTxSuccess(true);
      setPlayerName('');
    } catch (err) {
      console.error(err);
      setTxError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGetPlayer = async () => {
    if (!lookupName.trim()) return;
    try {
      const provider = new BrowserProvider(walletProvider);
      const contract = new Contract(contractAddress, contractABI, provider);
      const data = await contract.getPlayer(lookupName);
      setPlayerInfo(data);
    } catch (err) {
      console.error(err);
      setPlayerInfo(null);
      alert('❌ Player not found or error fetching data.');
    }
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🏏 Cricket Scorecard</h1>
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
            cursor: 'pointer'
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <h3>Add Player</h3>
          <input
            type="text"
            placeholder="Player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{
              padding: '8px',
              width: '200px',
              marginRight: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: darkMode ? '#1f1f1f' : '#fff',
              color: darkMode ? '#fff' : '#000'
            }}
          />
          <button
            onClick={handleAddPlayer}
            disabled={loading || !playerName.trim()}
            style={{
              padding: '8px 16px',
              background: loading ? '#aaa' : '#03dac6',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'Add Player'}
          </button>

          {txSuccess && <p style={{ color: 'green' }}>✅ Player added successfully!</p>}
          {txError && <p style={{ color: 'red' }}>❌ Error: {txError}</p>}

        </div>
      )}
    </div>
  );
}

export default App;
