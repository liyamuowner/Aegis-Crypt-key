import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';


const LoginOverlay = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const masterPass = import.meta.env.VITE_ADMIN_MASTER_PASSWORD;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === masterPass) {
      onLogin();
    } else {
      alert('Invalid Credentials');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 z-[1000] overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="glass p-12 rounded-[3rem] w-full max-w-md border-white/5 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="flex flex-col items-center gap-8 mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tighter mb-2">AEGIS <span className="text-blue-500">ADMIN</span></h2>
            <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase">Private Security Interface</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••" 
            className="w-full rounded-2xl px-8 py-5 outline-none text-center tracking-[1.2em] text-blue-500 text-xl font-bold bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
          />
          <button type="submit" className="w-full py-5 btn-primary rounded-2xl font-black text-xs tracking-[0.2em] uppercase text-white flex items-center justify-center gap-3">
            Initialize Terminal <Lock className="w-4 h-4 opacity-50" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginOverlay;
