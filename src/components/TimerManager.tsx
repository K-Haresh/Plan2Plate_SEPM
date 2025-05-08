'use client';

import { useState } from 'react';
import Timer from './Timer';
import styles from './TimerManager.module.css';

export default function TimerManager() {
  const [teams, setTeams] = useState<string[]>(['Team A', 'Team B']);
  const [newTeamName, setNewTeamName] = useState('');

  const addTeam = () => {
    if (newTeamName.trim() && !teams.includes(newTeamName.trim())) {
      setTeams([...teams, newTeamName.trim()]);
      setNewTeamName('');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Team Cooking Timers</h1>
      
      <div className={styles.teamManagement}>
        <div className={styles.teamInput}>
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Enter team name"
            className={styles.input}
          />
          <button onClick={addTeam} className={styles.addButton}>
            Add Team
          </button>
        </div>
      </div>

      <div className={styles.timersContainer}>
        {teams.map((team) => (
          <Timer key={team} teamName={team} />
        ))}
      </div>
    </div>
  );
} 