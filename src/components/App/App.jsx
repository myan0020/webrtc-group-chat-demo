import React from "react";
import styles from './App.css'
import logo from './logo.png'

export default function App() {
  return (
    <div>
      <h1 className={styles.appTitle}>
        App
      </h1>
      <img className={styles.appLogo} 
           alt="App Logo" 
           src={logo} />
    </div>
  )
}