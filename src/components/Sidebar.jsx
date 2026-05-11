import React from 'react';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, Shield } from 'lucide-react';

const Sidebar = ({ onLogout, projectId, appName, health, activeTab, setActiveTab }) => {
  return (
    <aside className="w-80 glass border-r border-white/5 flex flex-col p-8 z-50">
      <div className="flex items-center gap-4 mb-16 px-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-white">{appName.split(' ')[0]} <span className="text-blue-500">{appName.split(' ')[1]}</span></h1>
          <p className="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase">Security Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <button 
          onClick={() => setActiveTab('registry')}
          className={`sidebar-item w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'registry' ? 'active text-blue-500 bg-blue-500/10' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Registry Authority
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`sidebar-item w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'active text-blue-500 bg-blue-500/10' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <BarChart3 className="w-5 h-5" />
          Analytics & Logs
        </button>
        <button onClick={onLogout} className="sidebar-item w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all mt-4">
          <LogOut className="w-5 h-5" />
          Terminate Session
        </button>
      </nav>

      <div className="mt-8 p-6 glass rounded-3xl border-white/5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Network Health</p>
          <span className="text-[9px] font-black text-emerald-500">{health}%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="w-[98%] h-full bg-gradient-to-r from-blue-500 to-emerald-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${health}%` }}></div>
        </div>
      </div>


      <div className="mt-auto glass p-6 rounded-[2rem] border-white/5 relative overflow-hidden">
        <div className="scanline"></div>
        <div className="relative z-10">
          <p className="text-[8px] text-blue-500 font-black tracking-widest uppercase mb-2">Instance Identity</p>
          <p className="text-xs font-bold text-white mb-4">{projectId?.toUpperCase() || 'LOADING...'}</p>
          <div className="w-full py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-400 tracking-widest uppercase text-center">
            Link Status: Active
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
