import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full brutalist-card p-8 relative">
        <div className="absolute top-0 left-0 w-full h-3 bg-zinc-900 dark:bg-zinc-100"></div>
        
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign In
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-600 text-sm font-bold uppercase border-2 border-red-600 p-2 text-center bg-red-50 dark:bg-red-900/20">{error}</div>}
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 mb-1">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="brutalist-input"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="brutalist-input"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="brutalist-button w-full"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="text-center mt-6 text-sm font-bold uppercase">
          <span className="text-zinc-600 dark:text-zinc-400">New here? </span>
          <Link to="/register" className="text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
