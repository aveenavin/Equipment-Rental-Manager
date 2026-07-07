import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
          <input
            type="email"
            disabled
            placeholder="Email auth will be enabled in Phase 2"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 placeholder-slate-600 focus:outline-none cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
          <input
            type="password"
            disabled
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 placeholder-slate-600 focus:outline-none cursor-not-allowed"
          />
        </div>
        <button
          type="button"
          disabled
          className="w-full py-2.5 rounded-lg bg-primary-600/50 text-slate-400 font-semibold cursor-not-allowed"
        >
          Login (Enabled in Phase 2)
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-400 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
