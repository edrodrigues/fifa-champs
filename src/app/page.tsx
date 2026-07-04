"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Championship {
  id: number;
  name: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [list, setList] = useState<Championship[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Championship | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Championship | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/championships");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) setList(data);
      } catch (e) {
        if (!cancelled) setError("Erro ao carregar campeonatos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function refreshList() {
    const res = await fetch("/api/championships");
    if (res.ok) setList(await res.json());
  }

  async function create() {
    if (!name.trim()) return;
    setError("");
    const res = await fetch("/api/championships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), notes: notes.trim() || null }),
    });
    if (!res.ok) {
      const err = await res.text();
      setError(err || "Erro ao criar campeonato");
      return;
    }
    setShowModal(false);
    setName("");
    setNotes("");
    setError("");
    refreshList();
  }

  async function update() {
    if (!editTarget || !name.trim()) return;
    setError("");
    const res = await fetch("/api/championships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editTarget.id, name: name.trim(), notes: notes.trim() || null }),
    });
    if (!res.ok) {
      const err = await res.text();
      setError(err || "Erro ao editar campeonato");
      return;
    }
    setEditTarget(null);
    setError("");
    refreshList();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setError("");
    const res = await fetch(`/api/championships?id=${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Erro ao deletar campeonato");
      return;
    }
    setDeleteTarget(null);
    setError("");
    refreshList();
  }

  function openEdit(c: Championship, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditTarget(c);
    setName(c.name);
    setNotes(c.notes || "");
    setError("");
  }

  function openDelete(c: Championship, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget(c);
    setError("");
  }

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800",
    groups: "bg-blue-100 text-blue-800",
    knockout: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FIFA Champs</h1>
          <p className="text-gray-500 text-sm mt-1">Gerenciamento de campeonatos</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(""); }} className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm">
          + Novo Campeonato
        </button>
      </div>

      {error && !showModal && !editTarget && !deleteTarget && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Carregando...</p>
        </div>
      ) : list.length === 0 && !error ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Nenhum campeonato ainda.</p>
          <p className="mt-2">Crie o primeiro para começar!</p>
        </div>
      ) : list.length > 0 ? (
        <div className="space-y-3">
          {list.map((c) => (
            <div key={c.id} className="group relative">
              <Link href={`/championships/${c.id}`} className="block bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-5 transition-colors shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">{c.name}</h2>
                    {c.notes && <p className="text-sm text-gray-500 mt-1 truncate">{c.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[c.status] || "bg-gray-100 text-gray-700"}`}>
                      {c.status === "draft" ? "Rascunho" : c.status === "groups" ? "Grupos" : c.status === "knockout" ? "Mata-mata" : "Finalizado"}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEdit(c, e)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11.5 1.5l3 3L5 14H2v-3l9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => openDelete(c, e)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Deletar"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 4h12M5 4V2h6v2M3 4l1 10h8l1-10" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
              </Link>
            </div>
          ))}
        </div>
      ) : null}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Novo Campeonato</h2>
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
            )}
            <input
              autoFocus
              placeholder="Nome do campeonato"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:border-gray-500 text-gray-900 placeholder-gray-400"
            />
            <textarea
              placeholder="Observações (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-gray-500 resize-none text-gray-900 placeholder-gray-400"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 transition-colors text-sm">Cancelar</button>
              <button onClick={create} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">Criar</button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditTarget(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Editar Campeonato</h2>
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
            )}
            <input
              autoFocus
              placeholder="Nome do campeonato"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && update()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:border-gray-500 text-gray-900 placeholder-gray-400"
            />
            <textarea
              placeholder="Observações (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-gray-500 resize-none text-gray-900 placeholder-gray-400"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 transition-colors text-sm">Cancelar</button>
              <button onClick={update} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm border border-gray-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Deletar Campeonato</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja deletar <strong>{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 transition-colors text-sm">Cancelar</button>
              <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">Deletar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
