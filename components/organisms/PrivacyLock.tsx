import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { storage } from '../../services/storage';

interface PrivacyLockProps {
  passwordHash: string;
  onUnlock: (password: string) => void;
}

export const PrivacyLock: React.FC<PrivacyLockProps> = ({ passwordHash, onUnlock }) => {
  const [pinInput, setPinInput] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const triggerError = () => {
    setError(true);
    setTimeout(() => {
      setPinInput('');
      setManualInput('');
      setError(false);
    }, 600);
  };

  const tryUnlock = (value: string) => {
    if (!storage.verifyPassword(value, passwordHash)) {
      triggerError();
      return;
    }
    onUnlock(value);
  };

  const handleNumberClick = (num: string) => {
    if (manualMode || pinInput.length >= 4) return;

    const next = pinInput + num;
    setPinInput(next);
    if (next.length === 4) tryUnlock(next);
  };

  const handleBackspace = () => {
    setPinInput(pinInput.slice(0, -1));
  };

  const handleResetApp = () => {
    if (!confirm('重置应用将清空所有本地数据，且无法恢复。是否继续？')) return;
    storage.resetAllData();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#FCFAF7] flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 flex items-center justify-center text-black mb-2">
            <Lock size={28} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-bold italic tracking-tighter">Ethereal Secured</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">请输入访问密码</p>
          <p className="text-[10px] text-rose-500 font-bold">忘记密码将无法恢复本地加密数据。</p>
        </div>

        {!manualMode ? (
          <>
            <div className={`flex gap-6 ${error ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border border-black transition-all duration-300 ${pinInput.length > i ? 'bg-black scale-110' : 'bg-transparent'}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  className="w-16 h-16 flex items-center justify-center text-xl font-serif hover:bg-black/5 rounded-full transition-colors"
                >
                  {num}
                </button>
              ))}
              <div className="w-16 h-16" />
              <button
                onClick={() => handleNumberClick('0')}
                className="w-16 h-16 flex items-center justify-center text-xl font-serif hover:bg-black/5 rounded-full transition-colors"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                aria-label="删除一位"
                title="删除一位"
                className="w-16 h-16 flex items-center justify-center text-zinc-300 hover:text-black transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className={`w-[320px] max-w-[88vw] space-y-4 ${error ? 'animate-shake' : ''}`}>
            <input
              autoFocus
              type="password"
              id="privacy-lock-password"
              name="privacy_lock_password"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryUnlock(manualInput)}
              className="w-full bg-white border border-black/10 rounded-sm py-3 px-4 text-sm mono outline-none focus:border-black"
              placeholder="输入完整密码"
            />
            <button
              onClick={() => tryUnlock(manualInput)}
              className="w-full py-3 bg-black text-white hover:bg-zinc-800 transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              解锁
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setManualMode((v) => !v)}
            className="text-[10px] text-zinc-400 underline underline-offset-2"
          >
            {manualMode ? '返回 PIN 键盘' : '使用完整密码输入'}
          </button>
          <button
            onClick={handleResetApp}
            className="text-[10px] text-rose-500 underline underline-offset-2 font-bold"
          >
            忘记密码？重置应用（清空本地数据）
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};
