
import React, { useState, useEffect } from 'react';
/* Fix: Removed non-existent BackspaceIcon and other unused icons from the lucide-react import list */
import { Lock, ArrowLeft } from 'lucide-react';

interface PrivacyLockProps {
  correctPin: string;
  onUnlocked: () => void;
}

export const PrivacyLock: React.FC<PrivacyLockProps> = ({ correctPin, onUnlocked }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (input.length < 4) {
      const newInput = input + num;
      setInput(newInput);
      if (newInput.length === 4) {
        if (newInput === correctPin) {
          onUnlocked();
        } else {
          setError(true);
          setTimeout(() => {
            setInput('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setInput(input.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#FCFAF7] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 flex items-center justify-center text-black mb-2">
            <Lock size={28} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-bold italic tracking-tighter">Ethereal Secured</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">请输入访问密码</p>
        </div>

        {/* Pin Display */}
        <div className={`flex gap-6 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full border border-black transition-all duration-300 ${input.length > i ? 'bg-black scale-110' : 'bg-transparent'}`} 
            />
          ))}
        </div>

        {/* Keypad */}
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
            className="w-16 h-16 flex items-center justify-center text-zinc-300 hover:text-black transition-colors"
          >
            <ArrowLeft size={20} />
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
