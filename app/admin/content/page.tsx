"use client";

import { useState, useCallback, useId } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Radio,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
} from "lucide-react";
import { useContentStore } from "../../../stores/useContentStore";
import type { RunningTextItem } from "../../../types/content";

/**
 * Content management page — add, edit, delete, reorder, and toggle
 * active state for running text items displayed on the mosque screen.
 */
export default function ContentPage() {
  const {
    runningTexts,
    addRunningText,
    updateRunningText,
    deleteRunningText,
    reorderRunningTexts,
    eventItem,
    setEventItem,
  } = useContentStore();

  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const uid = useId();

  /** Sort items by order field */
  const sorted = [...runningTexts].sort((a, b) => a.order - b.order);

  /** Add new running text item */
  const handleAdd = useCallback(() => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    const item: RunningTextItem = {
      id: `rt-${Date.now()}`,
      text: trimmed,
      order: runningTexts.length,
      isActive: true,
      createdAt: new Date(),
    };
    addRunningText(item);
    setNewText("");
  }, [newText, runningTexts.length, addRunningText]);

  /** Start editing an item */
  const handleStartEdit = useCallback((item: RunningTextItem) => {
    setEditingId(item.id);
    setEditingText(item.text);
  }, []);

  /** Commit edit */
  const handleCommitEdit = useCallback(() => {
    if (!editingId) return;
    const trimmed = editingText.trim();
    if (trimmed) updateRunningText(editingId, { text: trimmed });
    setEditingId(null);
    setEditingText("");
  }, [editingId, editingText, updateRunningText]);

  /** Cancel edit */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingText("");
  }, []);

  /** Toggle active state */
  const handleToggle = useCallback(
    (id: string, current: boolean) => {
      updateRunningText(id, { isActive: !current });
    },
    [updateRunningText],
  );

  /** Move item up or down in order */
  const handleMove = useCallback(
    (index: number, direction: "up" | "down") => {
      const newSorted = [...sorted];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= newSorted.length) return;
      [newSorted[index], newSorted[swapIndex]] = [
        newSorted[swapIndex],
        newSorted[index],
      ];
      reorderRunningTexts(newSorted.map((t) => t.id));
    },
    [sorted, reorderRunningTexts],
  );

  /** Confirm and execute delete */
  const handleDelete = useCallback(
    (id: string) => {
      deleteRunningText(id);
      setDeleteConfirmId(null);
    },
    [deleteRunningText],
  );

  const activeCount = runningTexts.filter((t) => t.isActive).length;

  return (
    <div className="min-h-screen bg-[--color-background] text-white p-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[--color-primary]">
            Konten Teks & Acara
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Kelola teks berjalan dan kartu info acara (Kajian) di layar masjid.
          </p>
        </div>

        {/* Event Card (Kajian Rutin) */}
        <div className="bg-[--color-surface] rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[--color-secondary]" />
              <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider">
                Kartu Info Acara / Kajian
              </h2>
            </div>
            <button
              onClick={() => setEventItem({ isActive: !eventItem.isActive })}
              className={`flex items-center gap-2 text-xs rounded-lg px-3 py-1.5 transition-colors font-semibold ${
                eventItem.isActive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-white/5 text-white/35"
              }`}
            >
              {eventItem.isActive ? (
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              )}
              {eventItem.isActive ? "Aktif" : "Sembunyikan"}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Judul Acara</label>
              <input
                type="text"
                value={eventItem.title}
                onChange={(e) => setEventItem({ title: e.target.value })}
                placeholder="Misal: Kajian Rutin"
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-primary]/60 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Waktu / Keterangan</label>
              <input
                type="text"
                value={eventItem.description}
                onChange={(e) => setEventItem({ description: e.target.value })}
                placeholder="Misal: Ba'da Maghrib"
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-primary]/60 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 w-full"></div>

        {/* Stats bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[--color-surface] rounded-xl px-4 py-2.5 border border-white/5">
            <Radio className="w-4 h-4 text-[--color-secondary]" />
            <span className="text-sm font-semibold">
              {activeCount}{" "}
              <span className="text-white/40 font-normal">
                aktif dari {runningTexts.length}
              </span>
            </span>
          </div>
        </div>

        {/* Add new text */}
        <div className="bg-[--color-surface] rounded-2xl p-5 border border-white/5 space-y-3">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">
            Tambah Teks Baru
          </h2>
          <textarea
            id={`${uid}-new`}
            rows={3}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd();
            }}
            placeholder="Ketik pesan untuk ditampilkan di layar masjid..."
            className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-primary]/60 outline-none transition-colors resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/25">Ctrl+Enter untuk menyimpan</p>
            <button
              onClick={handleAdd}
              disabled={!newText.trim()}
              className="flex items-center gap-2 bg-[--color-primary] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity rounded-xl px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {sorted.length === 0 && (
            <div className="text-center py-12 text-white/25">
              <Radio className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Belum ada running text.</p>
              <p className="text-xs mt-1">Tambahkan teks di atas.</p>
            </div>
          )}

          {sorted.map((item, index) => (
            <div
              key={item.id}
              className={`bg-[--color-surface] rounded-2xl p-4 border transition-colors ${
                item.isActive ? "border-white/8" : "border-white/3 opacity-50"
              }`}
            >
              {editingId === item.id ? (
                /* Edit mode */
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    autoFocus
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-[--color-primary]/40 text-white outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCommitEdit}
                      className="flex items-center gap-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg px-3 py-1.5 font-semibold transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Simpan
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/50 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                /* Display mode */
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {/* Order number */}
                    <span className="text-xs text-white/25 font-mono pt-0.5 w-5 shrink-0">
                      {index + 1}
                    </span>
                    {/* Text */}
                    <p className="flex-1 text-sm text-white/80 leading-relaxed">
                      {item.text}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggle(item.id, item.isActive)}
                      className={`flex items-center gap-2 text-xs rounded-lg px-3 py-1.5 transition-colors font-semibold ${
                        item.isActive
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/5 text-white/35"
                      }`}
                    >
                      {item.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {/* Move up */}
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-white/50" />
                      </button>
                      {/* Move down */}
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={index === sorted.length - 1}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-white/50" />
                      </button>
                      {/* Delete */}
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg px-2 py-1 font-semibold transition-colors"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-xs bg-white/5 text-white/40 rounded-lg px-2 py-1 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/15 flex items-center justify-center transition-colors group"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white/50 group-hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pb-4" />
      </div>
    </div>
  );
}
