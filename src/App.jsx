import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LoginOverlay from './components/LoginOverlay';
import config from './config.json';



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logs, setLogs] = useState([
    { time: new Date(), msg: '[SYSTEM] Initializing secure channel...', type: 'system' },
    { time: new Date(), msg: '[SYSTEM] Neural link established.', type: 'system' },
    { time: new Date(), msg: '[AUTH] Administrator session authorized.', type: 'success' },
  ]);

  const logToConsole = (msg, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date(), msg, type }]);
    
    // Auto-scroll logic (if we were in the component)
    setTimeout(() => {
      const consoleEl = document.getElementById('systemConsole');
      if (consoleEl) consoleEl.scrollTop = consoleEl.scrollHeight;
    }, 100);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('aegis_auth', 'true');
    logToConsole(config.alertMessages.loginSuccess, 'success');
  };


  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('aegis_auth');
    logToConsole('Session terminated by user.', 'warning');
  };

  useEffect(() => {
    const auth = localStorage.getItem('aegis_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="liquid-bg">
        <div className="orb w-[80%] h-[80%] bg-blue-600 top-[-20%] left-[-10%]"></div>
        <div className="orb w-[70%] h-[70%] bg-blue-400 bottom-[-20%] right-[-10%]" style={{ animationDelay: '-5s' }}></div>
      </div>

      {!isAuthenticated ? (
        <LoginOverlay onLogin={handleLogin} />
      ) : (
        <div className="flex min-h-screen">
          <Sidebar onLogout={handleLogout} projectId={import.meta.env.VITE_FIREBASE_PROJECT_ID} appName={config.appName} health={config.systemHealth} />

          <Dashboard logToConsole={logToConsole} logs={logs} />

          
          {/* We port the console render here or use a portal, 
              but for now Dashboard has a div with id 'systemConsole'.
              I will update Dashboard.jsx to render the logs.
          */}
        </div>
      )}
    </div>
  );
}

export default App;
