import React, { useState } from 'react';
import {
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  getActiveGoogleSheetUrl,
  setActiveGoogleSheetUrl,
  getActiveRoundLabel,
  fetchLiveSheetPlayers,
  formatGoogleSheetCsvUrl,
  resetToDefaultSheetUrl,
  DEFAULT_GOOGLE_SHEETS_CSV_URL,
} from '../services/sheetsService';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess?: (count: number) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
}) => {
  const [activeUrl, setActiveUrl] = useState<string>(() => getActiveGoogleSheetUrl());
  const [inputUrl, setInputUrl] = useState<string>(() => getActiveGoogleSheetUrl());
  const [roundLabel, setRoundLabel] = useState<string>(() => getActiveRoundLabel());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSync = async (targetUrlToSync?: string, newRoundLabel?: string) => {
    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Conectando con Google Sheets y descargando datos oficiales...' });

    const sheetUrl = targetUrlToSync || inputUrl;
    const finalUrl = formatGoogleSheetCsvUrl(sheetUrl);

    try {
      const result = await fetchLiveSheetPlayers(finalUrl);

      if (result.isLive && result.players.length >= 200) {
        const round = newRoundLabel || roundLabel;
        setActiveGoogleSheetUrl(finalUrl, round);
        setActiveUrl(finalUrl);
        setStatusMessage({
          type: 'success',
          text: `✓ ¡Sincronización exitosa! Se cargaron ${result.players.length} futbolistas con cotizaciones, puntajes y vallas invictas actualizadas.`,
        });
        onSyncSuccess?.(result.players.length);
      } else if (result.players.length > 0) {
        setStatusMessage({
          type: 'success',
          text: `✓ Datos cargados desde caché local (${result.players.length} futbolistas procesados).`,
        });
        onSyncSuccess?.(result.players.length);
      } else {
        throw new Error(result.error || 'No se pudieron extraer los futbolistas del archivo');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error al sincronizar: ${err.message || 'Verifica que el enlace sea un Google Sheet público de Planeta Gran DT'}.`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApplyPreset = (url: string, label: string) => {
    setInputUrl(url);
    setRoundLabel(label);
    handleSync(url, label);
  };

  const handleResetDefault = () => {
    const defaultUrl = resetToDefaultSheetUrl();
    const defaultLabel = 'Fecha 5 (Oficial Planeta Gran DT)';
    setInputUrl(defaultUrl);
    setRoundLabel(defaultLabel);
    setActiveUrl(defaultUrl);
    handleSync(defaultUrl, defaultLabel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#07245c] via-[#0e3f9a] to-[#082b6c] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                Sincronizador Google Sheet de Planeta Gran DT
              </h3>
              <p className="text-[11px] text-blue-200">
                Puntajes oficiales, cotizaciones y vallas invictas automatizadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Official Source Callout */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="text-[10px] font-black uppercase text-[#1b55e2] dark:text-cyan-400 block tracking-wider">
                Fuente Oficial de Planeta Gran DT
              </span>
              <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold mt-0.5">
                Al finalizar cada fecha, Planeta Gran DT publica el nuevo Google Sheet con las estadísticas cerradas.
              </p>
            </div>
            <a
              href="https://www.planetagrandt.com.ar/search/label/Estad%C3%ADsticas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b55e2] hover:bg-blue-700 text-white font-black text-xs shrink-0 shadow-xs transition"
            >
              <span>Ver Planeta Gran DT</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Current Active Sheet Info */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-slate-500">Hoja Activa en la App</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                {roundLabel}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              {activeUrl}
            </div>
          </div>

          {/* Input for Next Round URL (Fecha 6, 7, etc.) */}
          <div className="space-y-2">
            <label className="block font-black text-xs text-slate-900 dark:text-slate-100">
              Ingresar o Actualizar Enlace de Google Sheet (Ej: Fecha 6)
            </label>
            <p className="text-[11px] text-slate-500">
              Puedes pegar cualquier link de Google Sheet publicado por Planeta Gran DT (link web, pubhtml, o enlace compartido). El sistema lo convertirá y sincronizará automáticamente:
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... o link de Planeta Gran DT"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-[#1b55e2]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roundLabel}
                  onChange={e => setRoundLabel(e.target.value)}
                  placeholder="Etiqueta (ej: Fecha 6 Oficial)"
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-[#1b55e2]"
                />
              </div>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 animate-spin" />
              )}
              <span className="font-semibold leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetDefault}
              disabled={isSyncing}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-semibold"
            >
              Restablecer a Fecha 5 Oficial
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition text-xs"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => handleSync()}
                disabled={isSyncing}
                className="px-4 py-1.5 rounded-lg bg-[#1b55e2] hover:bg-blue-700 text-white font-black transition flex items-center gap-1.5 text-xs shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Datos Ahora'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
