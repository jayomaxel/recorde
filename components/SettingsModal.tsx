
import React, { useState, useRef } from 'react';
import { X, User, Cpu, ShieldCheck, Loader2, Database, ToggleLeft, ToggleRight, Box, Camera, Download, Trash2, Mail, Lock, FileText, Key, Link, Eye, EyeOff, Edit3, Check, AlertCircle } from 'lucide-react';
import { UserSettings } from '../types';
import { testApiConnection } from '../services/gemini';
import { storage } from '../services/storage';
import { jsPDF } from 'jspdf';

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'engine' | 'data'>('profile');
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleTest = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    const result = await testApiConnection({
      apiKey: formData.apiKey,
      customModel: formData.customModel,
      apiBaseUrl: formData.apiBaseUrl
    });
    
    if (result.success) setTestStatus('success');
    else {
      setTestStatus('failed');
      setErrorMessage(result.message || '测试失败');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小请控制在 10MB 以内');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatarUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = () => {
    if (passwordData.old !== formData.password) {
      setPasswordError('原密码输入错误');
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordError('新密码至少需要 6 位');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setFormData({ ...formData, password: passwordData.new });
    setShowPasswordModal(false);
    setPasswordData({ old: '', new: '', confirm: '' });
    setPasswordError('');
    alert('密码修改成功，点击“保存配置”生效');
  };

  const handleExportData = () => {
    const thoughts = storage.getThoughts();
    const dataStr = JSON.stringify(thoughts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ethereal-backup-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const thoughts = storage.getThoughts();
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(22);
    doc.text("Ethereal Thoughts Journal", 105, y, { align: "center" });
    y += 20;

    doc.setFontSize(10);
    thoughts.forEach((thought, index) => {
      const dateStr = new Date(thought.createdAt).toLocaleString();
      const contentLines = doc.splitTextToSize(`${index + 1}. [${dateStr}] [Mood: ${thought.mood || 'N/A'}]\n${thought.content}`, 180);
      
      if (y + (contentLines.length * 7) > 280) {
        doc.addPage();
        y = 20;
      }

      doc.text(contentLines, 15, y);
      y += (contentLines.length * 7) + 10;
    });

    doc.save(`ethereal-journal-${new Date().getTime()}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#FCFAF7] shadow-2xl border border-black/10 flex flex-col h-[650px] max-h-[90vh] relative">
        
        {/* Header */}
        <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white shrink-0">
          <div className="flex flex-col">
            <span className="mono text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Thought / Preference</span>
            <h2 className="text-xl font-serif font-bold italic tracking-tight">偏好设置</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-16 md:w-48 border-r border-black/5 bg-white py-6 flex flex-col items-center md:items-start">
            {[
              { id: 'profile', icon: User, label: '账户资料' },
              { id: 'engine', icon: Cpu, label: 'AI 配置' },
              { id: 'data', icon: Database, label: '数据管理' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-black bg-zinc-50 border-r-2 border-black' : 'text-zinc-300 hover:text-zinc-500'}`}
              >
                <tab.icon size={16} /> 
                <span className="hidden md:block">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white/30">
            {activeTab === 'profile' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-4 pb-8 border-b border-black/5">
                  <div className="relative group">
                    <div className="w-24 h-24 border border-black p-1 rounded-sm overflow-hidden bg-white">
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-1.5 bg-black text-white rounded-sm hover:scale-110 transition-transform"><Camera size={12}/></button>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{formData.userName}</p>
                    <p className="text-[9px] text-zinc-400 mono tracking-tighter">@{formData.userId}</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><User size={10} /> 笔名</label>
                    <div className="flex items-center justify-between group h-10 px-4 border border-black/5 rounded-sm bg-white/50">
                      {isEditingName ? (
                        <div className="flex items-center w-full gap-2">
                          <input 
                            autoFocus
                            type="text" 
                            value={formData.userName} 
                            onChange={(e) => setFormData({...formData, userName: e.target.value})}
                            onBlur={() => setIsEditingName(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                            className="flex-1 bg-transparent text-sm font-serif outline-none"
                          />
                          <button onClick={() => setIsEditingName(false)} className="text-emerald-500"><Check size={14} /></button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-serif text-zinc-800">{formData.userName}</span>
                          <button onClick={() => setIsEditingName(true)} className="text-zinc-300 hover:text-black transition-colors">
                             <Edit3 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Mail size={10} /> 邮箱</label>
                    <div className="h-10 px-4 flex items-center border border-black/5 rounded-sm bg-zinc-50/50">
                       <span className="text-sm font-serif text-zinc-400 opacity-70">{formData.email}</span>
                       <span className="ml-auto text-[8px] font-bold uppercase text-zinc-300 tracking-tighter bg-zinc-100 px-2 py-1 rounded-sm">已绑定</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Lock size={10} /> 安全验证</label>
                    <button 
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full flex items-center justify-center gap-3 py-3 border border-black/10 hover:border-black rounded-sm transition-all group bg-white"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] group-hover:scale-105 transition-transform">修改访问密码</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'engine' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between p-5 border border-black/10 rounded-sm bg-white shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest">开启 AI 情绪分析</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-serif italic">仅用于生成心境趋势图谱。</p>
                  </div>
                  <button onClick={() => setFormData({...formData, isAiEnabled: !formData.isAiEnabled})} className={`transition-all ${formData.isAiEnabled ? 'text-black' : 'text-zinc-200'}`}>
                    {formData.isAiEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>

                {formData.isAiEnabled && (
                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Key size={12} /> API 密钥
                      </label>
                      <div className="relative">
                        <input 
                          type={showKey ? "text" : "password"} 
                          value={formData.apiKey || ''} 
                          onChange={(e) => setFormData({...formData, apiKey: e.target.value})} 
                          className="w-full bg-white border border-black/10 rounded-sm py-3 px-4 pr-12 text-sm mono outline-none focus:border-black" 
                          placeholder="输入您的 Gemini API Key" 
                        />
                        <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black transition-colors">
                          {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Link size={12} /> API 代理地址 (Base URL)
                      </label>
                      <input 
                        type="text" 
                        value={formData.apiBaseUrl || ''} 
                        onChange={(e) => setFormData({...formData, apiBaseUrl: e.target.value})} 
                        className="w-full bg-white border border-black/10 rounded-sm py-3 px-4 text-sm mono outline-none focus:border-black" 
                        placeholder="https://api.your-proxy.com (可选)" 
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Box size={12} /> 模型 ID
                      </label>
                      <input 
                        type="text" 
                        value={formData.customModel} 
                        onChange={(e) => setFormData({...formData, customModel: e.target.value})} 
                        className="w-full bg-white border border-black/10 rounded-sm py-3 px-4 text-sm mono outline-none focus:border-black" 
                        placeholder="例如: gemini-3-flash-preview" 
                      />
                    </div>

                    <div className="pt-2">
                      <button onClick={handleTest} disabled={testStatus === 'testing'} className="w-full flex items-center justify-between p-4 border border-black/10 rounded-sm hover:border-black transition-all bg-white group">
                        <span className="text-[10px] font-bold uppercase tracking-widest">测试连通性</span>
                        {testStatus === 'testing' ? (
                          <Loader2 size={16} className="animate-spin text-zinc-400" />
                        ) : testStatus === 'success' ? (
                          <ShieldCheck size={16} className="text-emerald-500" />
                        ) : (
                          <Box size={16} className="text-zinc-200" />
                        )}
                      </button>
                      {errorMessage && (
                        <p className="mt-2 text-[10px] text-rose-500 font-medium">{errorMessage}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-5 border border-black/5 bg-white rounded-sm space-y-4 shadow-sm">
                   <div className="flex items-center gap-3">
                      <Database size={14} className="text-zinc-400" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">备份与迁移</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <button onClick={handleExportData} className="flex flex-col items-center justify-center gap-2 p-4 border border-zinc-100 hover:border-black transition-all rounded-sm group">
                        <Download size={18} className="text-zinc-300 group-hover:text-black" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">JSON 导出</span>
                     </button>
                     <button onClick={handleExportPDF} className="flex flex-col items-center justify-center gap-2 p-4 border border-zinc-100 hover:border-black transition-all rounded-sm group">
                        <FileText size={18} className="text-zinc-300 group-hover:text-black" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">PDF 导出</span>
                     </button>
                   </div>
                </div>

                <div className="p-5 border border-rose-100 bg-rose-50/30 rounded-sm space-y-4">
                  <div className="flex items-center gap-3">
                      <Trash2 size={14} className="text-rose-500" />
                      <h4 className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">危险区域</h4>
                  </div>
                  <button onClick={() => { if(confirm('确定要清空所有记录吗？')) { storage.saveThoughts([]); window.location.reload(); } }} className="w-full py-3 bg-rose-500 text-white hover:bg-rose-600 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-sm">
                    清空所有本地思绪
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/5 bg-white flex justify-end shrink-0">
          <button onClick={handleSave} className="px-12 py-4 bg-black text-white font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-800 active:scale-95 transition-all shadow-lg">
            保存配置
          </button>
        </div>

        {/* Password Change Modal Overly */}
        {showPasswordModal && (
          <div className="absolute inset-0 z-[110] bg-white flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-200">
             <div className="w-full max-w-xs space-y-8">
                <div className="text-center space-y-2">
                   <Lock size={32} className="mx-auto text-black" />
                   <h3 className="font-serif text-xl font-bold italic">修改安全密码</h3>
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">请输入凭据以继续</p>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">原密码</label>
                      <input 
                        type="password" 
                        value={passwordData.old}
                        onChange={(e) => setPasswordData({...passwordData, old: e.target.value})}
                        className="w-full border-b border-black/10 py-2 text-sm mono outline-none focus:border-black bg-transparent"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">新密码</label>
                      <input 
                        type="password" 
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                        className="w-full border-b border-black/10 py-2 text-sm mono outline-none focus:border-black bg-transparent"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">确认新密码</label>
                      <input 
                        type="password" 
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                        className="w-full border-b border-black/10 py-2 text-sm mono outline-none focus:border-black bg-transparent"
                      />
                   </div>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 text-rose-500">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-medium">{passwordError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-4">
                   <button 
                     onClick={handleChangePassword}
                     className="w-full py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800"
                   >
                     确认修改
                   </button>
                   <button 
                     onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordData({ old: '', new: '', confirm: '' }); }}
                     className="w-full py-3 border border-black/5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:text-black hover:border-black"
                   >
                     取消操作
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
