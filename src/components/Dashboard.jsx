import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { RefreshCw, Key, ShieldCheck, Lock, Activity, Search, Trash2, Cpu, Globe, Clock, X, ChevronUp, Copy, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ logToConsole, logs }) => {

  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isForging, setIsForging] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [packageType, setPackageType] = useState('7');

  const fetchLicenses = async () => {
    setLoading(true);
    logToConsole('Accessing Registry...', 'system');
    try {
      const querySnapshot = await getDocs(collection(db, "licenses"));
      const data = [];
      querySnapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setLicenses(data);
      logToConsole(`Registry refresh complete. ${data.length} nodes mapped.`, 'success');
    } catch (e) {
      logToConsole(`Registry sync failed: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    const consoleEl = document.getElementById('systemConsole');
    if (consoleEl) consoleEl.scrollTop = consoleEl.scrollHeight;
  }, [logs]);

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.isActive).length,
    revoked: licenses.filter(l => !l.isActive).length,
  };

  const filteredLicenses = licenses.filter(l => {
    const matchesSearch = l.key.toLowerCase().includes(search.toLowerCase()) || 
                         (l.hwid && l.hwid.toLowerCase().includes(search.toLowerCase()));
    const matchesTier = tierFilter === '' || l.type.includes(tierFilter);
    return matchesSearch && matchesTier;
  });

  const forgeKey = async () => {
    setIsForging(true);
    logToConsole(`Requesting Forge for ${packageType}D tier...`, 'system');
    
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = 'AEGIS-';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) key += '-';
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    let expiry = new Date();
    expiry.setDate(expiry.getDate() + parseInt(packageType));
    
    const typeLabel = packageType === "7" ? "Standard Entry" : 
                    packageType === "30" ? "Premium Access" : "Aegis Prime";

    try {
      await setDoc(doc(db, "licenses", key), {
        key: key,
        type: typeLabel,
        expiryDate: Timestamp.fromDate(expiry),
        isActive: true,
        hwid: null,
        lastSeen: Timestamp.now(),
        platform: 'N/A',
        ip: 'N/A'
      });
      setGeneratedKey(key);
      logToConsole(`Registry entry created: ${key}`, 'success');
      fetchLicenses();
    } catch (e) {
      logToConsole(`Forge failed: ${e.message}`, 'error');
    } finally {
      setIsForging(false);
    }
  };

  const toggleKey = async (id, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'REVOKE' : 'REACTIVATE'} this identifier?`)) return;
    try {
      logToConsole(`Patching registry status for ${id.substring(0, 8)}...`, 'system');
      await updateDoc(doc(db, "licenses", id), { isActive: !currentStatus });
      logToConsole(`Status updated to ${!currentStatus ? 'REVOKED' : 'ACTIVE'}`, 'warning');
      fetchLicenses();
      if (selectedNode?.id === id) setSelectedNode(prev => ({ ...prev, isActive: !currentStatus }));
    } catch (e) {
      logToConsole(`Status patch failed: ${e.message}`, 'error');
    }
  };

  const deleteKey = async (id) => {
    if (!confirm('PERMANENTLY PURGE this identifier from the registry?')) return;
    try {
      logToConsole(`Purging identifier ${id.substring(0, 8)}...`, 'warning');
      await deleteDoc(doc(db, "licenses", id));
      logToConsole('Registry entry purged successfully.', 'success');
      fetchLicenses();
      if (selectedNode?.id === id) setSelectedNode(null);
    } catch (e) {
      logToConsole(`Purge failed: ${e.message}`, 'error');
    }
  };

  return (
    <div className="flex-1 p-12 overflow-y-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Command <span className="text-blue-500">Center</span></h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Monitor and manage your cryptographic infrastructure.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
            <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">System Nominal</span>
          </div>
          <button onClick={fetchLicenses} className="p-4 glass rounded-2xl hover:bg-white/5 transition-all group">
            <RefreshCw className={`w-5 h-5 text-gray-400 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Key />} label="Total Licenses" value={stats.total} color="blue" />
        <StatCard icon={<ShieldCheck />} label="Active Nodes" value={stats.active} color="emerald" />
        <StatCard icon={<Lock />} label="Revoked Access" value={stats.revoked} color="red" />
        <StatCard icon={<Activity />} label="Uptime Meta" value="99.9%" color="amber" />
      </section>

      {/* Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8">
          <div className="glass p-10 rounded-[3rem] border-white/5">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight uppercase text-white">User Registry</h2>
              </div>
              <div className="flex gap-2">
                <select 
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl text-[10px] font-bold outline-none bg-white/5 border-white/10 cursor-pointer text-white"
                >
                  <option value="">All Tiers</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Prime">Aegis Prime</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search identifiers..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-6 py-2 rounded-xl text-xs outline-none bg-white/5 border-white/10 w-48 focus:w-64 transition-all text-white"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase font-black tracking-widest text-left border-b border-white/5">
                    <th className="pb-6 px-4">User Details</th>
                    <th className="pb-6 px-4">Status</th>
                    <th className="pb-6 px-4">Metadata</th>
                    <th className="pb-6 px-4">Termination</th>
                    <th className="pb-6 px-4 text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {loading ? (
                    <tr><td colSpan="5" className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">Accessing Registry...</td></tr>
                  ) : filteredLicenses.length === 0 ? (
                    <tr><td colSpan="5" className="py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">No records found.</td></tr>
                  ) : (
                    filteredLicenses.map(l => (
                      <tr 
                        key={l.id} 
                        onClick={() => setSelectedNode(l)}
                        className="hover:bg-white/[0.02] transition-all group cursor-pointer"
                      >
                        <td className="py-6 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-500">
                               <Key className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-mono text-blue-400 text-sm font-bold">{l.key}</div>
                              <div className="text-[9px] text-gray-500 font-bold uppercase">{l.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <span className={`${l.isActive ? 'text-emerald-500' : 'text-red-500'} text-[8px] font-black tracking-widest uppercase flex items-center gap-2`}>
                            <div className={`w-1.5 h-1.5 rounded-full bg-current ${l.isActive ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`}></div>
                            {l.isActive ? 'Active' : 'Revoked'}
                          </span>
                        </td>
                        <td className="py-6 px-4">
                          <div className="space-y-1">
                            <div className="text-[9px] font-bold text-gray-400 flex items-center gap-2">
                              <Cpu className="w-3 h-3 text-blue-500/30" />
                              {l.hwid ? l.hwid.substring(0, 8) + '...' : 'PENDING'}
                            </div>
                            <div className="text-[8px] font-medium text-gray-600 flex items-center gap-2">
                              <Clock className="w-3 h-3 text-emerald-500/30" />
                              Last seen: {l.lastSeen ? l.lastSeen.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {l.expiryDate?.toDate().toLocaleDateString()}
                        </td>
                        <td className="py-6 px-4 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteKey(l.id); }}
                            className="p-3 hover:bg-red-500/10 rounded-xl text-gray-700 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panels */}
        <div className="xl:col-span-4 space-y-10">
          <div className="glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase text-white">Forge Module</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Tier Configuration</label>
                <select 
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl outline-none text-sm font-bold bg-white/5 border border-white/10 text-white"
                >
                  <option value="7">Standard Entry (7D)</option>
                  <option value="30">Premium Access (30D)</option>
                  <option value="3650">Aegis Prime (Life)</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Generated Identifier</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    placeholder="AWAITING COMMAND" 
                    value={generatedKey}
                    className="flex-1 px-6 py-4 rounded-2xl outline-none text-blue-400 font-mono tracking-widest text-center text-xs bg-black/40 border border-white/5"
                  />
                  <button 
                    onClick={() => {
                      if (!generatedKey) return;
                      navigator.clipboard.writeText(generatedKey);
                      logToConsole('Key copied to clipboard', 'info');
                    }}
                    className="px-5 glass rounded-2xl hover:bg-white/10 transition-all text-gray-400"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button 
                onClick={forgeKey}
                disabled={isForging}
                className="w-full py-5 btn-primary rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 text-white"
              >
                {isForging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronUp className="w-4 h-4" />}
                {isForging ? 'FORGING...' : 'Execute Protocol'}
              </button>
            </div>
          </div>

          <div className="glass p-8 rounded-[3rem] border-white/5 h-[350px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              <h2 className="text-[10px] font-black tracking-widest uppercase text-gray-400">System Terminal</h2>
            </div>
            <div id="systemConsole" className="flex-1 bg-black/40 rounded-2xl p-6 overflow-y-auto console-text text-gray-500 space-y-2 scrollbar-hide">
              {logs.map((log, i) => (
                <div key={i} className={`${
                  log.type === 'success' ? 'text-emerald-500' :
                  log.type === 'error' ? 'text-red-500' :
                  log.type === 'warning' ? 'text-amber-500' :
                  log.type === 'system' ? 'text-blue-500' : 'text-gray-500'
                }/70`}>
                  <span className="opacity-40 text-[9px] mr-2">
                    [{log.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>
                  {log.msg}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[450px] max-h-[90vh] glass border border-white/10 rounded-[3rem] shadow-2xl z-[101] p-8 md:p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <h2 className="text-2xl font-black tracking-tighter uppercase">Node <span className="text-blue-500">Intel</span></h2>
                <button onClick={() => setSelectedNode(null)} className="p-3 hover:bg-white/5 rounded-xl transition-all text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Core Identity</p>
                  <h3 className="text-2xl md:text-3xl font-mono font-black text-white break-all">{selectedNode.key}</h3>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">{selectedNode.type}</span>
                    <span className={`px-3 py-1 ${selectedNode.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} rounded-lg text-[9px] font-black uppercase tracking-widest border border-current/10`}>
                      {selectedNode.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailBox label="Hardware SIG" value={selectedNode.hwid || 'NOT LINKED'} mono />
                  <DetailBox label="Registry End" value={selectedNode.expiryDate?.toDate().toLocaleDateString()} />
                  <DetailBox label="Platform" value={selectedNode.platform || 'UNKNOWN'} color="text-blue-400" />
                  <DetailBox label="Global IP" value={selectedNode.ip || 'N/A'} color="text-blue-400" />
                </div>

                <div className="p-6 glass rounded-[2rem] space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity Intelligence</h4>
                  <ActivityItem label="Last Synchronization" value={selectedNode.lastSeen ? selectedNode.lastSeen.toDate().toLocaleString() : 'Never'} color="bg-blue-500/20" />
                  <ActivityItem label="Neural Handshake" value="Verified AES-256-GCM Tunnel Active" color="bg-emerald-500/20" />
                </div>

                <div className="p-5 bg-amber-500/5 rounded-3xl border border-amber-500/10">
                  <p className="text-[8px] text-amber-500/60 leading-relaxed font-bold uppercase tracking-widest">
                    <span className="text-amber-500">CAUTION:</span> Revoking access terminates all sessions.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex gap-4 shrink-0">
                <button 
                  onClick={() => toggleKey(selectedNode.id, selectedNode.isActive)}
                  className={`flex-1 py-4 ${selectedNode.isActive ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'} rounded-2xl font-black text-[10px] tracking-widest uppercase border transition-all`}
                >
                  {selectedNode.isActive ? 'Revoke Access' : 'Restore Access'}
                </button>
                <button 
                  onClick={() => deleteKey(selectedNode.id)}
                  className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card p-8 rounded-[2.5rem] relative overflow-hidden">
    <div className={`absolute -right-4 -bottom-4 opacity-5 text-${color}-500`}>
      {React.cloneElement(icon, { size: 96 })}
    </div>
    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</p>
    <h3 className="text-4xl font-black tracking-tighter text-white">{value}</h3>
  </div>
);

const DetailBox = ({ label, value, mono, color = "text-gray-300" }) => (
  <div className="p-6 glass rounded-3xl">
    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-xs ${mono ? 'font-mono' : 'font-bold'} ${color} truncate`}>{value}</p>
  </div>
);

const ActivityItem = ({ label, value, color }) => (
  <div className="flex items-start gap-4">
    <div className={`w-1 h-12 ${color} rounded-full`}></div>
    <div>
      <p className="text-[10px] font-bold text-white uppercase">{label}</p>
      <p className="text-[9px] text-gray-500 mt-1">{value}</p>
    </div>
  </div>
);

export default Dashboard;
