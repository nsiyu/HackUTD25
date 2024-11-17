import { useState } from 'react';
import Login from './components/Login';
import { Dashboard } from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    setIsLoggedIn(true);
  };

  return isLoggedIn ? <Dashboard /> : <Login onLogin={handleLogin} />;
}

export default App;
