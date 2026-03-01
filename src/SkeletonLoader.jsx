// SkeletonLoader.jsx
import React from 'react';
import styles from './SkeletonLoader.module.css';

export function GameSkeleton() {
  return (
    <li className={styles['sk-game-item']}>
      <div className={styles['sk-game-link']}>
        <div className={styles['sk-image']} />
        <div className={styles['sk-text-container']}>
          <div className={styles['sk-text']} />
          <div className={styles['sk-text']} style={{ width: '80%' }} />
        </div>
      </div>
    </li>
  );
}

export function SkeletonGamesList() {
  return (
    <ul className={styles['sk-games-list']}>
      {[...Array(6)].map((_, i) => (
        <GameSkeleton key={i} />
      ))}
    </ul>
  );
}