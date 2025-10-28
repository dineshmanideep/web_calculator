/*
  main

  Purpose:
  Application entry point. Renders the root App component with React StrictMode
  and initializes global styles.

  Parameters/Return:
  None. Mounts the React application to the DOM element with id="root".
*/

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
