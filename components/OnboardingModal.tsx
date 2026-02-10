
import React, { useState, useRef } from 'react';
import { Camera, User, AtSign, ArrowRight, Feather, Upload, RotateCcw, Mail, Lock } from 'lucide-react';
import { UserSettings } from '../types';

interface OnboardingModalProps {
  onComplete: (data: Partial<UserSettings>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    email: '',
    password: '',
    avatarUrl: `https://picsum.photos/seed/${Math.random()}/200/200`
  });

  // 采用更严谨的邮箱正则，确保域名结构完整且顶级域名合法
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  const isFormValid = 
    formData.userName.trim().length > 0 && 
    formData.userId.trim().length > 0 &&
    emailRegex.test(formData.email) &&
    formData.password.length >= 6;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小请控制在 10MB 以内');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onComplete({
        ...formData,
        isInitialized: true
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#FCFAF7] overflow-y-auto py-10">
      <div className="w-full max-w-md p-8 md:p-12">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-sm mb-6">
            <Feather size={24} />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tighter italic">Ethereal</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mt-2">Initial Setup</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div 
                  className="w-20 h-20 border border-black p-1 rounded-sm overflow-hidden bg-white cursor-pointer group-hover:opacity-80 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={16} className="text-white" />
                  </div>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden" 
                  accept="image/*"
                />

                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, avatarUrl: `https://picsum.photos/seed/${Math.random()}/200/200`})}
                    className="bg-white border border-black text-black p-1.5 rounded-sm hover:bg-black hover:text-white transition-colors"
                  >
                    <RotateCcw size={10} />
                  </button>
                </div>
              </div>
              <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest text-center">点击更换头像 (Max 10MB)</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  <User size={10} /> 笔名 / Name
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  className="w-full bg-white border border-black/10 rounded-sm py-3 px-4 text-xs font-serif focus:ring-0 focus:border-black outline-none"
                  placeholder="你在思绪海中的称呼..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  <AtSign size={10} /> 账号 / ID
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                  className="w-full bg-white border border-black/10 rounded-sm py-3 px-4 text-xs mono focus:ring-0 focus:border-black outline-none"
                  placeholder="unique_identifier"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  <Mail size={10} /> 邮箱 / Email
                </label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-black/10 rounded-sm py-3 px-4 text-xs font-serif focus:ring-0 focus:border-black outline-none"
                  placeholder="your@email.com"
                />
                {!emailRegex.test(formData.email) && formData.email.length > 0 && (
                   <p className="text-[8px] text-rose-400 font-serif italic">请输入合法的邮箱格式（如 example@domain.com）</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  <Lock size={10} /> 密码 / Password
                </label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white border border-black/10 rounded-sm py-3 px-4 text-xs mono focus:ring-0 focus:border-black outline-none"
                />
                <p className="text-[8px] text-zinc-300 font-serif italic">密码至少包含 6 位字符。</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full py-4 bg-black text-white flex items-center justify-center gap-3 hover:bg-zinc-800 disabled:opacity-20 active:scale-95 transition-all mt-4"
          >
            <span className="font-bold text-xs uppercase tracking-[0.3em]">开启旅程</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-8 text-center text-[9px] text-zinc-300 font-serif italic max-w-[200px] mx-auto leading-relaxed">
          所有的记录都将仅保存在您的本地浏览器中，我们尊重并保护您的绝对隐私。
        </p>
      </div>
    </div>
  );
};
