
import React, { type ReactNode } from 'react';
import '../pages/QuestionPage.css'; 

interface DashboardProps {
  children: ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
  return (
    <div className="dashboard-layout">
      <nav className="sidebar">
        <h2 className="brand">PeerPrep</h2>
        <ul className="nav-links">
          <li>Dashboard</li>
          <li>History</li>
          <li className="active">Questions</li>
          <li>Profile</li>
        </ul>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}