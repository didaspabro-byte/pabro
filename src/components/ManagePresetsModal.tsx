import React, { useState, useEffect } from 'react';
import { FilterPreset } from '../types';
import { X, Trash2, Edit2, Check, ArrowUp, ArrowDown, Sparkles, SlidersHorizontal, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ManagePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: FilterPreset[];
  setPresets: (presets: FilterPreset[]) => void;
}

export default function ManagePresetsModal({
  isOpen,
  onClose,
  presets,
  setPresets,
}: ManagePresetsModalProps) {
  // Temporary state to allow canceling changes
  const [tempPresets, setTempPresets] = useState<FilterPreset[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempPresets([...presets]);
      setSelectedIds([]);
      setEditingId(null);
      setEditName('');
      setIsConfirmingDeleteAll(false);
    }
  }, [isOpen, presets]);

  if (!isOpen) return null;

  const handleSave = () => {
    setPresets(tempPresets);
    onClose();
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tempPresets.length) return;
    
    const updated = [...tempPresets];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    setTempPresets(updated);
  };

  const startEditing = (preset: FilterPreset) => {
    setEditingId(preset.id);
    setEditName(preset.name);
  };

  const saveInlineRename = (id: string) => {
    const trimmed = editName.trim();
    if (trimmed) {
      setTempPresets(prev => prev.map(p => p.id === id ? { ...p, name: trimmed } : p));
    }
    setEditingId(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === tempPresets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tempPresets.map(p => p.id));
    }
  };

  const handleDeleteSelected = () => {
    setTempPresets(prev => prev.filter(p => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const handleDeleteAll = () => {
    setTempPresets([]);
    setSelectedIds([]);
    setIsConfirmingDeleteAll(false);
  };

  const handleDeleteSingle = (id: string) => {
    setTempPresets(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  return (
    <AnimatePresence>
      <div 
        id="manage-presets-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop overlay */}
        <motion.div
          id="manage-presets-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Content container */}
        <motion.div
          id="manage-presets-content"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Manage Filter Presets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Organize, rename, or delete your quick-access filter configurations
                </p>
              </div>
            </div>
            <button
              id="close-manage-presets-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Bulk Action Toolbar (only show if there are items) */}
          {tempPresets.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  id="select-all-presets-checkbox"
                  type="checkbox"
                  checked={selectedIds.length === tempPresets.length && tempPresets.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded-sm border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800"
                />
                <span>Select All ({selectedIds.length} of {tempPresets.length})</span>
              </label>

              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <button
                    id="bulk-delete-presets-btn"
                    type="button"
                    onClick={handleDeleteSelected}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer border border-rose-100/30 dark:border-rose-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Selected ({selectedIds.length})</span>
                  </button>
                )}
                {isConfirmingDeleteAll ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2 py-1 rounded-lg">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">Delete all presets?</span>
                    <button
                      type="button"
                      onClick={handleDeleteAll}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-black cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDeleteAll(false)}
                      className="px-1.5 py-0.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    id="bulk-delete-all-presets-btn"
                    type="button"
                    onClick={() => setIsConfirmingDeleteAll(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete All</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {tempPresets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 mb-3 border border-slate-100 dark:border-slate-800/80">
                  <Sparkles className="h-6 w-6 text-indigo-400/80" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Presets Saved</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                  Adjust filters and click &ldquo;Save Preset&rdquo; in the catalog control section to create your first fast-loading preset configuration.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tempPresets.map((preset, index) => {
                  const isEditing = editingId === preset.id;
                  const isSelected = selectedIds.includes(preset.id);

                  return (
                    <div
                      key={preset.id}
                      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-200/60 dark:border-indigo-900/40'
                          : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800/60 hover:bg-slate-100/30 dark:hover:bg-slate-850/20'
                      }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(preset.id)}
                        className="rounded-sm border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 cursor-pointer shrink-0"
                      />

                      {/* Reordering Controls */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className={`p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
                            index === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer text-slate-500 dark:text-slate-400'
                          }`}
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === tempPresets.length - 1}
                          className={`p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
                            index === tempPresets.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer text-slate-500 dark:text-slate-400'
                          }`}
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Preset Details (Rename Input or View Text) */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineRename(preset.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="flex-1 min-w-0 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-indigo-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveInlineRename(preset.id)}
                              className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                              title="Save Name"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate">
                                {preset.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => startEditing(preset)}
                                className="p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
                                title="Rename preset"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider select-none">
                              <span>Category: <strong className="text-slate-650 dark:text-slate-300 lowercase font-medium">{preset.category}</strong></span>
                              {preset.search && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
                                  <span>Search: <strong className="text-slate-650 dark:text-slate-300 lowercase font-medium">&ldquo;{preset.search}&rdquo;</strong></span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Individual Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(preset.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete preset"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-950/25">
            <button
              id="cancel-manage-presets-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-manage-presets-btn"
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
