import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { RefreshCw, Key, ShieldCheck, Lock, Activity, Search, Trash2, Cpu, Globe, Clock, X, ChevronUp, Copy, Terminal, Plus, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ logToConsole, logs }) => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  
  // UX States
  const [showForgeModal, setShowForgeModal] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Forge States
  const [isForging, setIsForging] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [packageType, setPackageType] = useState('7');
  const [customDays, setCustomDays] = useState('');


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
  }, [logs, showTerminal]);

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.isActive).length,
    revoked: licenses.filter(l => !l.isActive).length,
  };

  const getDaysRemaining = (expiryTimestamp) => {
    if (!expiryTimestamp) return 0;
    const now = new Date();
    const expiry = expiryTimestamp.toDate();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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

    let daysToAdd = packageType === 'custom' ? parseInt(customDays) || 1 : parseInt(packageType);
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + daysToAdd);
    
    const typeLabel = packageType === "7" ? "Standard Entry" : 
                    packageType === "30" ? "Premium Access" : 
                    packageType === "3650" ? "Aegis Prime" : `Custom (${daysToAdd}D)`;


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
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar pb-32">
        {/* Header */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase text-white">System <span className="text-blue-500">Registry</span></h2>
            <p className="text-xs text-gray-500 font-medium mt-1 tracking-widest uppercase">Command & Control Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowForgeModal(true)}
              className="px-6 py-4 btn-primary rounded-2xl font-black text-xs tracking-widest uppercase flex items-center gap-2 text-white"
            >
              <Plus className="w-4 h-4" /> Forge Key
            </button>
            <button onClick={fetchLicenses} className="p-4 glass rounded-2xl hover:bg-white/5 transition-all group">
              <RefreshCw className={`w-5 h-5 text-gray-400 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Top Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<Key />} label="Total Licenses" value={stats.total} color="blue" />
          <StatCard icon={<ShieldCheck />} label="Active Nodes" value={stats.active} color="emerald" />
          <StatCard icon={<Lock />} label="Revoked Access" value={stats.revoked} color="red" />
          <StatCard icon={<Activity />} label="Uptime Meta" value="99.9%" color="blue" />
        </section>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 glass px-2 py-2 rounded-2xl">
            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-4">
            <select 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none bg-white/5 border border-white/10 cursor-pointer text-white"
            >
              <option value="">All Tiers</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="Prime">Aegis Prime</option>
            </select>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search identifiers..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-6 py-3 rounded-2xl text-xs font-bold outline-none bg-white/5 border border-white/10 w-64 focus:w-80 transition-all text-white placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Registry Content */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-6" />
            <p className="text-gray-500 font-black tracking-[0.2em] uppercase text-xs">Syncing Registry...</p>
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-white/10 rounded-[3rem]">
            <p className="text-gray-600 font-black tracking-widest uppercase text-xs">No cryptographic nodes found.</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredLicenses.map((l, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={l.id}
                    onClick={() => setSelectedNode(l)}
                    className="glass p-6 rounded-[2rem] hover:bg-white/[0.04] hover:-translate-y-1 transition-all cursor-pointer group border-white/5 hover:border-blue-500/30"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500">
                        <Key className="w-5 h-5" />
                      </div>
                      <span className={`${l.isActive ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'} px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-2`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${l.isActive ? 'animate-pulse' : ''}`}></div>
                        {l.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-mono text-white text-lg font-bold mb-1 tracking-wider">{l.key}</h3>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{l.type}</p>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {getDaysRemaining(l.expiryDate)} Days Left
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <Cpu className="w-3 h-3 text-purple-500" />
                        {l.hwid ? 'Bound' : 'Pending'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="glass rounded-[3rem] overflow-hidden border-white/5">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase font-black tracking-widest text-left border-b border-white/5 bg-black/20">
                    <th className="py-6 px-8">Core Identity</th>
                    <th className="py-6 px-4">Status</th>
                    <th className="py-6 px-4">Telemetry</th>
                    <th className="py-6 px-4">Expiration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  <AnimatePresence>
                    {filteredLicenses.map((l) => (
                      <motion.tr 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        key={l.id} 
                        onClick={() => setSelectedNode(l)}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                               <Key className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-mono text-white group-hover:text-blue-400 transition-colors text-sm font-bold mb-1">{l.key}</div>
                              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{l.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <span className={`${l.isActive ? 'text-emerald-500' : 'text-red-500'} text-[9px] font-black tracking-widest uppercase flex items-center gap-2`}>
                            <div className={`w-1.5 h-1.5 rounded-full bg-current ${l.isActive ? 'animate-pulse' : ''}`}></div>
                            {l.isActive ? 'Active' : 'Revoked'}
                          </span>
                        </td>
                        <td className="py-6 px-4">
                          <div className="space-y-1">
                            <div className="text-[9px] font-bold text-gray-400 flex items-center gap-2">
                              <Cpu className="w-3 h-3 text-purple-500/50" />
                              {l.hwid ? l.hwid.substring(0, 8) + '...' : 'PENDING'}
                            </div>
                            <div className="text-[8px] font-medium text-gray-600 flex items-center gap-2">
                              <Globe className="w-3 h-3 text-blue-500/50" />
                              {l.ip || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter mb-1">
                            {l.expiryDate?.toDate().toLocaleDateString()}
                          </div>
                          <div className={`text-[9px] font-black ${getDaysRemaining(l.expiryDate) > 3 ? 'text-blue-500' : 'text-red-500 animate-pulse'}`}>
                            {getDaysRemaining(l.expiryDate)} Days Left
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Floating Action / Terminal Drawer */}
      <AnimatePresence>
        {!showTerminal ? (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <button 
              onClick={() => setShowTerminal(true)}
              className="glass px-8 py-4 rounded-full flex items-center gap-4 hover:bg-white/10 transition-all border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Open Terminal</span>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full h-80 glass border-t border-white/10 z-50 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0 bg-black/20">
              <div className="flex items-center gap-4 px-4">
                <Terminal className="w-5 h-5 text-blue-500" />
                <h3 className="text-xs font-black tracking-widest uppercase text-white">System Logs</h3>
              </div>
              <button onClick={() => setShowTerminal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div id="systemConsole" className="flex-1 p-8 overflow-y-auto console-text space-y-3 custom-scrollbar bg-black/40">
              {logs.map((log, i) => (
                <div key={i} className={`flex items-start gap-4 ${
                  log.type === 'success' ? 'text-emerald-500' :
                  log.type === 'error' ? 'text-red-500' :
                  log.type === 'warning' ? 'text-amber-500' :
                  log.type === 'system' ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  <span className="opacity-40 text-[10px] shrink-0 mt-0.5">
                    [{log.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>
                  <span className="tracking-wide leading-relaxed">{log.msg}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forge Modal */}
      <AnimatePresence>
        {showForgeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForgeModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[500px] glass border border-white/10 rounded-[3rem] p-12 shadow-2xl flex flex-col"
            >
              <button onClick={() => setShowForgeModal(false)} className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-xl transition-all text-gray-500">
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Forge Key</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Generate new access token</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Select Authorization Tier</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: '7', label: 'Standard', days: '7D' },
                      { val: '30', label: 'Premium', days: '30D' },
                      { val: '3650', label: 'Prime', days: 'Life' },
                      { val: 'custom', label: 'Custom', days: 'Variable' }
                    ].map(tier => (
                      <button 
                        key={tier.val}
                        onClick={() => setPackageType(tier.val)}
                        className={`p-4 rounded-2xl border transition-all text-center ${packageType === tier.val ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}
                      >
                        <div className="font-black text-xs uppercase tracking-widest">{tier.label}</div>
                        <div className="text-[9px] font-bold mt-1 opacity-60">{tier.days}</div>
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {packageType === 'custom' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Duration (Days)</label>
                        <input 
                          type="number" 
                          min="1"
                          placeholder="Enter number of days..." 
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl outline-none text-white font-bold tracking-widest text-sm bg-black/40 border border-white/5 focus:border-blue-500/50 transition-all"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>


                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Generated Output</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      readOnly 
                      placeholder="AWAITING COMMAND..." 
                      value={generatedKey}
                      className="flex-1 px-6 py-5 rounded-2xl outline-none text-blue-400 font-mono tracking-[0.2em] text-center text-sm bg-black/40 border border-white/5 focus:border-blue-500/50 transition-all"
                    />
                    <button 
                      onClick={() => {
                        if (!generatedKey) return;
                        navigator.clipboard.writeText(generatedKey);
                        logToConsole('Key copied to clipboard', 'info');
                      }}
                      className="px-6 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-300"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={forgeKey}
                  disabled={isForging}
                  className="w-full py-6 btn-primary rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 text-white mt-4"
                >
                  {isForging ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {isForging ? 'FORGING...' : 'Execute Generation'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Node Details Modal */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[500px] glass border border-white/10 rounded-[3rem] shadow-2xl p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter uppercase">Node <span className="text-blue-500">Intel</span></h2>
                <button onClick={() => setSelectedNode(null)} className="p-3 hover:bg-white/5 rounded-xl transition-all text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-8 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 text-center">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Core Identity</p>
                  <h3 className="text-3xl font-mono font-black text-white break-all mb-4">{selectedNode.key}</h3>
                  <div className="flex justify-center items-center gap-3">
                    <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-gray-300 uppercase tracking-widest">{selectedNode.type}</span>
                    <span className={`px-4 py-1.5 ${selectedNode.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} rounded-full text-[10px] font-black uppercase tracking-widest`}>
                      {selectedNode.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailBox label="Hardware SIG" value={selectedNode.hwid || 'NOT LINKED'} mono />
                  <DetailBox label="Registry End" value={`${selectedNode.expiryDate?.toDate().toLocaleDateString()} (${getDaysRemaining(selectedNode.expiryDate)} Days Left)`} />
                  <DetailBox label="Platform" value={selectedNode.platform || 'UNKNOWN'} color="text-blue-400" />
                  <DetailBox label="Global IP" value={selectedNode.ip || 'N/A'} color="text-blue-400" />
                </div>

                <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 mt-6">
                  <p className="text-[9px] text-amber-500/80 leading-relaxed font-bold uppercase tracking-widest text-center">
                    <span className="text-amber-500 block mb-1">CAUTION</span> Revoking access terminates all live sessions.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex gap-4 shrink-0">
                <button 
                  onClick={() => toggleKey(selectedNode.id, selectedNode.isActive)}
                  className={`flex-1 py-5 ${selectedNode.isActive ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'} rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase border transition-all`}
                >
                  {selectedNode.isActive ? 'Revoke Access' : 'Restore Access'}
                </button>
                <button 
                  onClick={() => deleteKey(selectedNode.id)}
                  className="px-6 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center"
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
  <div className="stat-card p-8 rounded-[2.5rem] relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className={`absolute -right-6 -bottom-6 opacity-5 text-${color}-500 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700`}>
      {React.cloneElement(icon, { size: 120 })}
    </div>
    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 relative z-10">{label}</p>
    <h3 className="text-5xl font-black tracking-tighter text-white relative z-10">{value}</h3>
  </div>
);

const DetailBox = ({ label, value, mono, color = "text-gray-300" }) => (
  <div className="p-6 glass rounded-3xl border-white/5">
    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-3">{label}</p>
    <p className={`text-xs ${mono ? 'font-mono' : 'font-bold'} ${color} truncate tracking-wide`}>{value}</p>
  </div>
);

export default Dashboard;
