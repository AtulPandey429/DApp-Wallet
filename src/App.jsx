import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit, useAppKitProvider } from './AppKitProvider';
import { contractABI, contractAddress } from './abi';
import { BrowserProvider, Contract } from 'ethers';

function App() {
  const { address, isConnected } = useAccount();
  const { modal } = useAppKit();
  const { walletProvider } = useAppKitProvider('eip155'); // ✅ use wallet provider

  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txError, setTxError] = useState('');

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    setTxSuccess(false);
    setTxError('');

    try {
      const provider = new BrowserProvider(walletProvider); // ✅ Wrap AppKit wallet provider
      const signer = await provider.getSigner();            // ✅ Get signer
      const contract = new Contract(contractAddress, contractABI, signer); // ✅ Load contract

      const tx = await contract.addPlayer(playerName);      // ✅ Call method
      await tx.wait();                                      // ✅ Wait for confirmation
      setTxSuccess(true);
    } catch (err) {
      console.error(err);
      setTxError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🏏 Cricket Scorecard</h1>
      <p>Account: {isConnected ? address : 'Not connected'}</p>

      {!isConnected ? (
        <button onClick={() => modal.open()}>Connect Wallet</button>
      ) : (
        <div>
          <h3>Add Player</h3>
          <input
            type="text"
            placeholder="Player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button
            onClick={handleAddPlayer}
            disabled={loading || !playerName.trim()}
          >
            {loading ? 'Processing...' : 'Add Player'}
          </button>

          {txSuccess && <p style={{ color: 'green' }}>Player added successfully!</p>}
          {txError && <p style={{ color: 'red' }}>Error: {txError}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
