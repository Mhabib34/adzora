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
    <div className="space-y-8">
      {/* Top Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-bold font-display text-white tracking-wide">
          Running Text & Event Info
        </h1>
        <p className="text-sm font-sans text-white/60 mt-1">
          Kelola teks pengumuman berjalan dan kartu informasi kajian di layar masjid
        </p>
      </div>

      {/* Event Card (Kajian Rutin) */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[--color-secondary]/20 border border-[--color-secondary]/30 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-[--color-secondary]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                Kartu Info Acara / Kajian
              </h2>
              <p className="text-xs text-white/50">
                Informasi jadwal kajian rutin yang ditampilkan pada layar utama
              </p>
            </div>
          </div>
          <button
            onClick={() => setEventItem({ isActive: !eventItem.isActive })}
            className={`flex items-center gap-2 text-xs rounded-full px-4 py-2 transition-all font-semibold border ${
              eventItem.isActive
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-md shadow-emerald-500/10"
                : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            {eventItem.isActive ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            {eventItem.isActive ? "Status: Tampil" : "Status: Sembunyi"}
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-white/60 mb-2 block">Judul Acara / Kajian</label>
            <input
              type="text"
              value={eventItem.title}
              onChange={(e) => setEventItem({ title: e.target.value })}
              placeholder="Misal: Kajian Rutin Ba'da Maghrib"
              className="w-full rounded-2xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-secondary]/60 focus:bg-white/10 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/60 mb-2 block">Waktu / Penceramah</label>
            <input
              type="text"
              value={eventItem.description}
              onChange={(e) => setEventItem({ description: e.target.value })}
              placeholder="Misal: Ustadz Ahmad — Tematik Aqidah"
              className="w-full rounded-2xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-secondary]/60 focus:bg-white/10 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Add New Running Text */}
      <div className="bg-[--color-surface]/60 backdrop-blur-2xl rounded-3xl p-6 border border-[--color-secondary]/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-white">
            Tambah Teks Pengumuman Baru
          </h2>
          <div className="flex items-center gap-2 bg-[--color-secondary]/10 border border-[--color-secondary]/20 rounded-full px-4 py-1.5">
            <Radio className="w-4 h-4 text-[--color-secondary] animate-pulse" />
            <span className="text-xs font-semibold text-[--color-secondary]">
              {activeCount} Aktif dari {runningTexts.length} Teks
            </span>
          </div>
        </div>

        <textarea
          id={`${uid}-new`}
          rows={3}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd();
          }}
          placeholder="Ketik pesan pengumuman baru untuk ditampilkan di ticker running text masjid..."
          className="w-full rounded-2xl px-4 py-3.5 text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[--color-secondary]/60 focus:bg-white/10 outline-none transition-all resize-none"
        />
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-white/30 font-sans">Tekan <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">Ctrl + Enter</kbd> untuk langsung menyimpan</p>
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-[--color-primary] to-[--color-primary]/80 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg border border-[--color-secondary]/30"
          >
            <Plus className="w-4 h-4" />
            Tambah Teks
          </button>
        </div>
      </div>

      {/* List Running Texts */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-widest uppercase text-white/40">
          Daftar Running Text ({sorted.length})
        </h3>

        {sorted.length === 0 && (
          <div className="text-center py-16 bg-[--color-surface]/30 rounded-3xl border border-white/5 text-white/30">
            <Radio className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-base font-semibold">Belum ada running text</p>
            <p className="text-xs mt-1 text-white/20">Tambahkan teks pengumuman baru di form atas</p>
          </div>
        )}

        {sorted.map((item, index) => (
          <div
            key={item.id}
            className={`bg-[--color-surface]/60 backdrop-blur-2xl rounded-2xl p-5 border transition-all duration-300 shadow-md ${
              item.isActive ? "border-white/10 hover:border-[--color-secondary]/30" : "border-white/5 opacity-50 bg-black/20"
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
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white/10 border border-[--color-secondary]/60 text-white outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCommitEdit}
                    className="flex items-center gap-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl px-4 py-2 font-semibold transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Simpan
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-xl px-4 py-2 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[--color-secondary]/15 border border-[--color-secondary]/30 text-xs font-mono font-bold text-[--color-secondary] shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-sm font-sans text-white/90 leading-relaxed pt-0.5">
                    {item.text}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleToggle(item.id, item.isActive)}
                    className={`flex items-center gap-2 text-xs rounded-full px-3.5 py-1.5 transition-all font-semibold border ${
                      item.isActive
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}
                  >
                    {item.isActive ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    {item.isActive ? "Aktif" : "Nonaktif"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center border border-white/5 transition-all"
                      title="Naikkan Urutan"
                    >
                      <ChevronUp className="w-4 h-4 text-white/70" />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === sorted.length - 1}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center border border-white/5 transition-all"
                      title="Turunkan Urutan"
                    >
                      <ChevronDown className="w-4 h-4 text-white/70" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-all"
                      title="Edit Teks"
                    >
                      <Edit2 className="w-4 h-4 text-white/70" />
                    </button>
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1.5 ml-1">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-xl px-3 py-1.5 font-semibold transition-all"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs bg-white/5 text-white/50 border border-white/10 rounded-xl px-3 py-1.5 transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center border border-white/5 transition-all group"
                        title="Hapus Teks"
                      >
                        <Trash2 className="w-4 h-4 text-white/50 group-hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
