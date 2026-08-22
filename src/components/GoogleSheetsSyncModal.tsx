import React, { useState } from 'react';
import {
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Compass,
  Sparkles,
} from 'lucide-react';
import {
  getActiveGoogleSheetUrl,
  setActiveGoogleSheetUrl,
  getActiveRoundLabel,
  fetchLiveSheetPlayers,
  formatGoogleSheetCsvUrl,
  discoverLatestPlanetaGranDTSheet,
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
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleAutoDiscoverAndSync = async () => {
    setIsDiscovering(true);
    setStatusMessage({ type: 'info', text: 'Escaneando blog de Planeta Gran DT en busca de la última fecha publicada...' });

    try {
      const discovered = await discoverLatestPlanetaGranDTSheet();
      if (discovered && discovered.sheetUrl) {
        setInputUrl(discovered.sheetUrl);
        setRoundLabel(discovered.roundTitle);
        setStatusMessage({
          type: 'info',
          text: `Se detectó: "${discovered.roundTitle}". Descargando y sincronizando estadísticas...`,
        });
        await handleSync(discovered.sheetUrl, discovered.roundTitle);
      } else {
        // Ejecutar sync con auto-detección interna
        await handleSync();
      }
    } catch (e: any) {
      console.warn('Error en auto-descubrimiento:', e);
      await handleSync();
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSync = async (targetUrlToSync?: string, newRoundLabel?: string) => {
    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Sincronizando y procesando futbolistas de Planeta Gran DT...' });

    const sheetUrl = targetUrlToSync || inputUrl;
    const finalUrl = sheetUrl ? formatGoogleSheetCsvUrl(sheetUrl) : '';

    try {
      const result = await fetchLiveSheetPlayers(finalUrl);

      if (result.players && result.players.length >= 200) {
        const detected = result.detectedRound || newRoundLabel || roundLabel;
        if (finalUrl) {
          setActiveGoogleSheetUrl(finalUrl, detected);
          setActiveUrl(finalUrl);
        }
        setRoundLabel(detected);
        setStatusMessage({
          type: 'success',
          text: `✓ ¡Sincronización completada! Se actualizaron ${result.players.length} futbolistas con la ${detected}.`,
        });
        onSyncSuccess?.(result.players.length);
      } else if (result.players && result.players.length > 0) {
        setStatusMessage({
          type: 'success',
          text: `✓ Datos sincronizados correctamente (${result.players.length} futbolistas procesados).`,
        });
        onSyncSuccess?.(result.players.length);
      } else {
        throw new Error(result.error || 'No se pudieron extraer los futbolistas del archivo');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error al sincronizar: ${err.message || 'Verifica la conexión con Planeta Gran DT'}.`,
      });
    } finally {
      setIsSyncing(false);
    }
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
                Sincronización Automática Planeta Gran DT
              </h3>
              <p className="text-[11px] text-blue-200">
                Detección inteligente de la última fecha oficial publicada
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
          {/* Action Auto-Detect Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white border border-blue-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-1.5 text-cyan-300 font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Búsqueda de Última Fecha</span>
              </div>
              <p className="text-blue-100 text-xs mt-0.5">
                Escanea automáticamente Planeta Gran DT y carga la planilla más reciente.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoDiscoverAndSync}
              disabled={isDiscovering || isSyncing}
              className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shrink-0 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Compass className={`w-4 h-4 ${isDiscovering ? 'animate-spin' : ''}`} />
              <span>{isDiscovering ? 'Buscando...' : 'Buscar Última Fecha'}</span>
            </button>
          </div>

          {/* Current Active Sheet Info */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-slate-500">Estado de Sincronización</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                {roundLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              La sincronización en vivo se ejecuta automáticamente cada 45 segundos y actualiza Favoritos, Base de Jugadores, Clubes y Estadísticas.
            </p>
          </div>

          {/* Optional Manual URL Input */}
          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <label className="block font-bold text-xs text-slate-700 dark:text-slate-300">
              Enlace de Hoja Google Sheet (Opcional / Manual)
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/... (o déjalo vacío para auto-detectar)"
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-[#1b55e2]"
            />
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
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <a
              href="https://www.planetagrandt.com.ar/search/label/Estad%C3%ADsticas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ver Blog Planeta Gran DT</span>
              <ExternalLink className="w-3 h-3" />
            </a>

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
                disabled={isSyncing || isDiscovering}
                className="px-4 py-1.5 rounded-lg bg-[#1b55e2] hover:bg-blue-700 text-white font-black transition flex items-center gap-1.5 text-xs shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

