import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
          title="Установить как приложение на телефон"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>НА ТЕЛЕФОН</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-600 transition-all flex items-center gap-1.5"
          title="Установить на iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>ПРИЛОЖЕНИЕ</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm p-5 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>Установка на iPhone / iPad</span>
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <span>
                  В Safari нажмите значок <strong className="inline-flex items-center gap-1 text-white">«Поделиться» <Share className="w-3.5 h-3.5 inline text-blue-400" /></strong> в нижней панели.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <span>
                  Прокрутите вниз и выберите <strong className="text-white">«На экран „Домой“»</strong>.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <span>
                  Нажмите <strong className="text-white">«Добавить»</strong>. Приложение установится на телефон и будет работать локально даже без интернета!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-md shadow-emerald-500/20"
            >
              ПОНЯТНО
            </button>
          </div>
        </div>
      )}
    </>
  );
};
