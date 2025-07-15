import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./abi";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isScorer, setIsScorer] = useState(false);
  const [players, setPlayers] = useState([]);
  const [matchName, setMatchName] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [name, setName] = useState("");
  const [runs, setRuns] = useState("");
  const [wickets, setWickets] = useState("");
  const [scorerAddress, setScorerAddress] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const owner = await contractInstance.owner();
        const scorer = await contractInstance.scorer();

        setContract(contractInstance);
        setAccount(address);
        setIsOwner(address.toLowerCase() === owner.toLowerCase());
        setIsScorer(
          address.toLowerCase() === owner.toLowerCase() ||
          address.toLowerCase() === scorer.toLowerCase()
        );

        const allPlayers = await contractInstance.getAllPlayers();
        setPlayers(allPlayers);

        const total = await contractInstance.getTotalScore();
        setTotalScore(total.toString());

        const name = await contractInstance.matchName();
        const date = await contractInstance.matchDate();
        setMatchName(name);
        setMatchDate(date);
      }
    };

    init();
  }, []);

  const handleAddPlayer = async () => {
    if (!name) return;
    const tx = await contract.addPlayer(name);
    await tx.wait();
    window.location.reload();
  };

  const handleUpdateScore = async () => {
  if (!selectedPlayer || !runs || !wickets) return;
  const tx = await contract.updateScore(selectedPlayer, Number(runs), Number(wickets));
  await tx.wait();
  window.location.reload();
};

  const handleSetMatchInfo = async () => {
    if (!matchName || !matchDate) return;
    const tx = await contract.setMatchInfo(matchName, matchDate);
    await tx.wait();
    window.location.reload();
  };

  const handleAssignScorer = async () => {
    if (!scorerAddress) return;
    const tx = await contract.setScorer(scorerAddress);
    await tx.wait();
    alert("Scorer assigned");
  };

  const handleReset = async () => {
    const tx = await contract.resetAllScores();
    await tx.wait();
    window.location.reload();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">🏏 Cricket Scorecard</h1>
        <div className="wallet-info">
          <span className="wallet-address">{account}</span>
          {isOwner && <span className="owner-badge">Owner</span>}
        </div>
      </header>

      <div className="match-info">
        <h2 className="match-name">{matchName || "N/A"}</h2>
        <p className="match-date">{matchDate || "N/A"}</p>
        <div className="total-score">
          <span>Total Runs: </span>
          <span className="score-value">{totalScore}</span>
        </div>
      </div>

      {(isOwner || isScorer) && (
        <div className="management-section">
          <div className="form-group">
            <h4>Add Player</h4>
            <div className="input-group">
              <input placeholder="Player Name" onChange={(e) => setName(e.target.value)} />
              <button className="btn-primary" onClick={handleAddPlayer}>Add Player</button>
            </div>
          </div>

         <div className="form-group">
  <h4>Update Score</h4>
  <div className="input-group">
    <select 
      onChange={(e) => setSelectedPlayer(e.target.value)}
      className="player-select"
    >
      <option value="">Select Player</option>
      {players.map((p, i) => (
        <option key={i} value={p.name}>{p.name}</option>
      ))}
    </select>
    <input 
      placeholder="Runs" 
      type="number" 
      onChange={(e) => setRuns(e.target.value)} 
    />
    <input 
      placeholder="Wickets" 
      type="number" 
      onChange={(e) => setWickets(e.target.value)} 
    />
    <button className="btn-primary" onClick={handleUpdateScore}>
      Update
    </button>
  </div>
</div>
        </div>
      )}

      {isOwner && (
        <div className="management-section">
          <div className="form-group">
            <h4>Match Information</h4>
            <div className="input-group">
              <input placeholder="Match Name" value={matchName} onChange={(e) => setMatchName(e.target.value)} />
              <input placeholder="Match Date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
              <button className="btn-primary" onClick={handleSetMatchInfo}>Set Info</button>
            </div>
          </div>

          <div className="form-group">
            <h4>Assign Scorer</h4>
            <div className="input-group">
              <input placeholder="Scorer Address" onChange={(e) => setScorerAddress(e.target.value)} />
              <button className="btn-primary" onClick={handleAssignScorer}>Assign</button>
            </div>
          </div>

          <div className="danger-zone">
            <button className="btn-danger" onClick={handleReset}>Reset Scores</button>
            <p className="warning-text">This will reset all scores to zero.</p>
          </div>
        </div>
      )}

      <div className="player-stats">
        <h3>Player Statistics</h3>
        {players.length === 0 ? (
          <p className="no-players">No players added yet</p>
        ) : (
          <div className="stats-grid">
            <div className="stats-header">
              <span>Name</span>
              <span>Runs</span>
              <span>Wickets</span>
            </div>
            {players.map((p, i) => (
              <div className="stats-row" key={i}>
                <span className="player-name">{p.name}</span>
                <span className="player-runs">{p.runs.toString()}</span>
                <span className="player-wickets">{p.wickets.toString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>Cricket Scorecard DApp &mdash; Powered by Ethereum</p>
      </footer>
    </div>
  );
}

export default App;
