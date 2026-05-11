import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Activity, Terminal, Shield, Zap, TrendingUp, History, Globe, Cpu, Server } from 'lucide-react';

const Analytics = () => {
  const [activeSubTab, setActiveSubTab] = useState('analytics');
  const [globalLogs, setGlobalLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('time', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().time?.toDate() || new Date()
      }));
      setGlobalLogs(logs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar pb-32">
        {/* Header */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Neural <span className="text-blue-500">Center</span></h2>
            <p className="text-xs text-gray-500 font-medium mt-1 tracking-widest uppercase">Intelligence & Event Monitoring</p>
          </div>
          
          <div className="flex gap-2 glass p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveSubTab('analytics')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'analytics' ? 'bg-blue-500 text-white shadow-[0_5px_15px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-white'}`}
            >
              Network Stats
            </button>
            <button 
              onClick={() => setActiveSubTab('logs')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'logs' ? 'bg-blue-500 text-white shadow-[0_5px_15px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-white'}`}
            >
              Live Event Feed
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeSubTab === 'analytics' ? (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp className="w-48 h-48 text-blue-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">System Efficiency</p>
                    <div className="flex items-end gap-6 mb-12">
                      <h3 className="text-7xl font-black tracking-tighter text-white">99.9%</h3>
                      <p className="text-emerald-500 font-bold mb-3 flex items-center gap-1">
                        <Zap className="w-4 h-4" /> Stable Cluster
                      </p>
                    </div>
                    <div className="flex items-end gap-2 h-24">
                      {[40, 70, 45, 90, 65, 80, 50, 100, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500/20 border-t-2 border-blue-500/50 rounded-t-lg" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex-1 glass p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between group hover:bg-white/[0.03] transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors duration-500"><Cpu className="w-5 h-5" /></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Links</span>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-white mb-1">HWID Verified</h4>
                      <p className="text-xs text-purple-400 font-bold uppercase tracking-widest">Global Authority</p>
                    </div>
                  </div>
                  <div className="flex-1 glass p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between group hover:bg-white/[0.03] transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500"><Globe className="w-5 h-5" /></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sync Delay</span>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-white mb-1">12ms Response</h4>
                      <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Real-time Bridge</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-[3rem] border-white/5 overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl text-gray-400"><Server className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-lg font-black tracking-tighter text-white uppercase">Network Event Hub</h3>
                    <p className="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase">Persistent Global Log Stream</p>
                  </div>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-20 text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Intercepting Stream...</p>
                  </div>
                ) : globalLogs.length === 0 ? (
                  <div className="p-20 text-center text-gray-600 font-black uppercase tracking-widest text-xs">
                    No global events captured yet.
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[9px] text-gray-600 uppercase font-black tracking-widest border-b border-white/5">
                        <th className="py-5 px-10">Time (UTC)</th>
                        <th className="py-5 px-10">Event Details</th>
                        <th className="py-5 px-10">Origin Key</th>
                        <th className="py-5 px-10">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {globalLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.01] transition-all group">
                          <td className="py-5 px-10">
                            <span className="text-xs font-mono text-gray-500">{log.time.toLocaleTimeString()}</span>
                          </td>
                          <td className="py-5 px-10">
                            <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{log.msg}</span>
                          </td>
                          <td className="py-5 px-10">
                            <span className="text-[10px] font-mono text-gray-500">{log.key?.substring(0, 13)}...</span>
                          </td>
                          <td className="py-5 px-10">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {log.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Analytics;
