import React from 'react';
import logoUrl from './logo.png';

export default function Header() {

  // TEST:
  fetch('/authors', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  return (
    <>
      <header>
        <h1>Header</h1>
      </header>
      <img src={logoUrl} />
    </>
  )
}