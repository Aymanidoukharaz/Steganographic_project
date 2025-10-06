import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { AppLayout } from './components/Layout/AppLayout';
import './styles/globals.css';
import './styles/camera.css';

function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;