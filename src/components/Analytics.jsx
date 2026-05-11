import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Terminal, Shield, Zap, TrendingUp, History, Globe, Cpu } from 'lucide-react';

const Analytics = ({ logs }) => {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar pb-32">
        {/* Header */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase text-white">System <span className="text-blue-500">Analytics</span></h2>
            <p className="text-xs text-gray-500 font-medium mt-1 tracking-widest uppercase">Live Network Intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Kernel: Online</span>
            </div>
          </div>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Stat Card */}
          <div className="lg:col-span-2 glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-48 h-48 text-blue-500" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">Network Throughput</p>
              <div className="flex items-end gap-6 mb-12">
                <h3 className="text-7xl font-black tracking-tighter text-white">99.8%</h3>
                <p className="text-emerald-500 font-bold mb-3 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> +1.2% this session
                </p>
              </div>
              
              {/* Visual Graph Placeholder */}
              <div className="flex items-end gap-2 h-24">
                {[40, 70, 45, 90, 65, 80, 50, 100, 85, 95].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className="flex-1 bg-blue-500/20 border-t-2 border-blue-500/50 rounded-t-lg"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 glass p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><Cpu className="w-5 h-5" /></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nodes Active</span>
              </div>
              <div>
                <h4 className="text-3xl font-black text-white mb-1">Cores Linked</h4>
                <p className="text-xs text-purple-400 font-bold uppercase tracking-widest">Hardware Verified</p>
              </div>
            </div>
            <div className="flex-1 glass p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Globe className="w-5 h-5" /></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Reach</span>
              </div>
              <div>
                <h4 className="text-3xl font-black text-white mb-1">Latency Low</h4>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Multi-Region Sync</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Logs Table */}
        <div className="glass rounded-[3rem] border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-gray-400"><History className="w-5 h-5" /></div>
              <div>
                <h3 className="text-lg font-black tracking-tighter text-white uppercase">Live Security Stream</h3>
                <p className="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase">Chronological Event Matrix</p>
              </div>
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] text-gray-600 uppercase font-black tracking-widest border-b border-white/5">
                  <th className="py-5 px-10">Timestamp</th>
                  <th className="py-5 px-10">Event Signature</th>
                  <th className="py-5 px-10">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {logs.slice().reverse().map((log, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-all group">
                    <td className="py-5 px-10">
                      <span className="text-xs font-mono text-gray-500">{log.time.toLocaleTimeString()}</span>
                    </td>
                    <td className="py-5 px-10">
                      <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{log.msg}</span>
                    </td>
                    <td className="py-5 px-10">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        log.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        log.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
