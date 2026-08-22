import React, { useState, useEffect, useRef } from 'react';
import { FavoritePlayer, UserProfile } from '../types';
import {
  fetchAllCloudSavedLists,
  CloudSavedListEntry,
  exportFavoritesToJSON,
  parseFavoritesFromJSON,
  saveUserFavorites,
  fetchUserFavoritesFromCloud,
} from '../utils/userStorage';
import {
  Cloud,
  CloudDownload,
  CloudUpload,
  FileDown,
  FileUp,
  Copy,
  Check,
  RefreshCw,
  X,
  ShieldCheck,
  Users,
  AlertCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoritePlayer[];
  activeUser: UserProfile | null;
  onFavoritesUpdated: (newFavorites: FavoritePlayer[]) => void;
  showToast: (msg: string) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  favorites,
  activeUser,
  onFavoritesUpdated,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'export' | 'import'>('cloud');
  const [cloudLists, setCloudLists] = useState<CloudSavedListEntry[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar todas las listas de Firestore al abrir el modal
  const loadCloudLists = async () => {
    setIsLoadingCloud(true);
    try {
      const lists = await fetchAllCloudSavedLists();
      setCloudLists(lists);
    } catch (e) {
      console.error('Error loading cloud lists:', e);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCloudLists();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Restaurar o combinar una lista de la nube
  const handleRestoreCloudList = (entry: CloudSavedListEntry, mode: 'replace' | 'merge') => {
    let finalItems: FavoritePlayer[] = [];
    if (mode === 'replace') {
      finalItems = entry.items;
    } else {
      // Merge unique
      const existingIds = new Set(favorites.map(f => f.id));
      const newItems = entry.items.filter(i => !existingIds.has(i.id));
      finalItems = [...favorites, ...newItems];
    }

    onFavoritesUpdated(finalItems);
    if (activeUser) {
      saveUserFavorites(activeUser.id, finalItems, true, activeUser.username);
    }
    showToast(
      mode === 'replace'
        ? `✓ Lista de ${entry.displayName || entry.username || 'la nube'} restaurada (${finalItems.length} futbolistas)`
        : `✓ Futbolistas combinados con éxito (${finalItems.length} totales)`
    );
  };

  // 2. Forzar subida de la lista actual a la nube
  const handleForceCloudSync = async () => {
    if (!activeUser) return;
    setIsSyncingNow(true);
    try {
      saveUserFavorites(activeUser.id, favorites, true, activeUser.username);
      await loadCloudLists();
      showToast('✓ Tu lista actual fue sincronizada y respaldada en Firestore');
    } catch (e) {
      showToast('Error al sincronizar con la nube');
    } finally {
      setIsSyncingNow(false);
    }
  };

  // 3. Descargar archivo JSON de respaldo
  const handleDownloadJSON = () => {
    const jsonStr = exportFavoritesToJSON(favorites, activeUser);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `gran-dt-favoritos-${activeUser?.username || 'plantel'}-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ Archivo de respaldo descargado');
  };

  // 4. Copiar JSON al portapapeles
  const handleCopyJSON = () => {
    const jsonStr = exportFavoritesToJSON(favorites, activeUser);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      showToast('✓ Código de tu lista copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 5. Importar desde archivo .json
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const parsed = parseFavoritesFromJSON(content);
        if (parsed.length === 0) {
          setImportError('El archivo no contiene futbolistas válidos.');
          return;
        }
        onFavoritesUpdated(parsed);
        if (activeUser) {
          saveUserFavorites(activeUser.id, parsed, true);
        }
        showToast(`✓ Se importaron ${parsed.length} futbolistas desde el archivo`);
        onClose();
      } catch (err: any) {
        setImportError(err.message || 'Error al procesar el archivo JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 6. Importar desde texto pegado
  const handlePasteImport = () => {
    setImportError(null);
    if (!pasteContent.trim()) {
      setImportError('Por favor pega el texto o JSON de tu lista.');
      return;
    }

    try {
      const parsed = parseFavoritesFromJSON(pasteContent);
      if (parsed.length === 0) {
        setImportError('No se encontraron futbolistas en el texto pegado.');
        return;
      }
      onFavoritesUpdated(parsed);
      if (activeUser) {
        saveUserFavorites(activeUser.id, parsed, true);
      }
      showToast(`✓ Se importaron ${parsed.length} futbolistas con éxito`);
      setPasteContent('');
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Error al procesar el texto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#07193b] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <span>Guardado & Sincronización en la Nube</span>
              </h3>
              <p className="text-[11px] text-blue-200/80 font-medium">
                Tus listas nunca se pierden entre versiones, navegadores ni despliegues
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cloud'
                ? 'border-[#1b55e2] text-[#1b55e2] dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Listas en la Nube ({cloudLists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'border-[#1b55e2] text-[#1b55e2] dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Exportar Copia</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import'
                ? 'border-[#1b55e2] text-[#1b55e2] dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Importar Archivo / Texto</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: LISTAS EN LA NUBE */}
          {activeTab === 'cloud' && (
            <div className="space-y-3.5">
              {/* Estado de sincronización activa */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Firestore Cloud Conectado</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                        Persistente
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Lista actual: <strong className="text-slate-800 dark:text-slate-200">{favorites.length} futbolistas</strong>
                      {activeUser ? ` (@${activeUser.username})` : ''}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleForceCloudSync}
                  disabled={isSyncingNow || !activeUser}
                  className="px-3 py-1.5 bg-[#1b55e2] hover:bg-[#1444b8] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Forzar guardado a la base de datos Firestore"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNow ? 'animate-spin' : ''}`} />
                  <span>Guardar a la Nube</span>
                </button>
              </div>

              {/* Lista de planteles guardados en Firestore */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Listas encontradas en el servidor ({cloudLists.length}):
                  </span>
                  <button
                    onClick={loadCloudLists}
                    disabled={isLoadingCloud}
                    className="text-xs text-[#1b55e2] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingCloud ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>

                {isLoadingCloud ? (
                  <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Buscando listas guardadas en Firestore...</span>
                  </div>
                ) : cloudLists.length === 0 ? (
                  <div className="py-6 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                    <Cloud className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Aún no hay listas almacenadas en la nube. ¡Guardá tu lista actual con el botón azul arriba!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {cloudLists.map((entry, idx) => {
                      const isCurrentActiveUser = entry.userId === activeUser?.id;
                      const dateFormatted = new Date(entry.updatedAt).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={entry.userId || idx}
                          className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCurrentActiveUser
                              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-[#1b55e2]/60'
                              : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 shadow-2xs"
                              style={{ backgroundColor: entry.avatarColor || '#1b55e2' }}
                            >
                              {(entry.displayName || entry.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                                  {entry.displayName || entry.username || 'Lista de Usuario'}
                                </span>
                                {entry.username && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    @{entry.username}
                                  </span>
                                )}
                                {isCurrentActiveUser && (
                                  <span className="text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-cyan-300 font-black px-1.5 py-0.2 rounded-full">
                                    Actual
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                                  ⚽ {entry.itemsCount} futbolistas
                                </strong>
                                <span>•</span>
                                <span>Actualizado: {dateFormatted}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              onClick={() => handleRestoreCloudList(entry, 'replace')}
                              className="px-2.5 py-1 rounded-lg bg-[#1b55e2] hover:bg-[#1444b8] text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Reemplazar mi lista activa con este plantel"
                            >
                              <CloudDownload className="w-3 h-3" />
                              <span>Restaurar</span>
                            </button>

                            <button
                              onClick={() => handleRestoreCloudList(entry, 'merge')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition cursor-pointer"
                              title="Agregar los futbolistas de esta lista a mi lista actual"
                            >
                              <span>+ Combinar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EXPORTAR COPIA */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Podés descargar tu lista completa de favoritos (incluyendo notas de scouting, precios y clubes) en un archivo JSON o copiar su código para pegarlo en cualquier otro dispositivo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadJSON}
                  disabled={favorites.length === 0}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition text-left space-y-2 cursor-pointer disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-[#1b55e2] dark:text-cyan-400 flex items-center justify-center">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Descargar Archivo JSON
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Guarda un archivo .json en tu computadora o teléfono.
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleCopyJSON}
                  disabled={favorites.length === 0}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition text-left space-y-2 cursor-pointer disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {copied ? '¡Copiado!' : 'Copiar al Portapapeles'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Copia el código de tu lista para compartirlo o guardarlo.
                    </div>
                  </div>
                </button>
              </div>

              {/* Vista previa del JSON */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Vista previa de los datos a exportar ({favorites.length} futbolistas):
                </label>
                <div className="p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[10px] max-h-36 overflow-y-auto border border-slate-800">
                  {exportFavoritesToJSON(favorites, activeUser)}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORTAR ARCHIVO O TEXTO */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Seleccioná un archivo JSON previamente descargado o pegá el código de tu lista para restaurar todos tus futbolistas al instante.
              </p>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Input de archivo */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
                <FileUp className="w-8 h-8 mx-auto text-slate-400" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Subir archivo .json de favoritos
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="import-json-input"
                />
                <label
                  htmlFor="import-json-input"
                  className="inline-block px-4 py-1.5 bg-[#1b55e2] hover:bg-[#1444b8] text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs"
                >
                  Seleccionar Archivo JSON
                </label>
              </div>

              {/* Pegar texto JSON */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  O pegar código / JSON directamente:
                </label>
                <textarea
                  rows={4}
                  value={pasteContent}
                  onChange={e => setPasteContent(e.target.value)}
                  placeholder='Pegá aquí el contenido JSON o la lista de favoritos...'
                  className="w-full p-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handlePasteImport}
                    className="px-4 py-2 bg-[#1b55e2] hover:bg-[#1444b8] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Cargar y Restaurar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 px-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Sincronización en la nube con Firestore</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
