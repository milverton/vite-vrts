// import React from 'react';
//
// import App from './App';
// import {BrowserRouter} from "react-router-dom";
// import {createRoot} from 'react-dom/client';
//
// const rootElement = document.querySelector('#root');
//
// const root = createRoot(rootElement)
// root.render(<BrowserRouter><App /></BrowserRouter>)
//


import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '../public/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
