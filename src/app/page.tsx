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
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");


  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/championships");
      const data = await res.json();
      if (!cancelled) setList(data);
    })();
    return () => { cancelled = true; };
  }, []);

  async function create() {
    if (!name.trim()) return;
    const res = await fetch("/api/championships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), notes: notes.trim() || null }),
    });
    if (res.ok) {
      setShowModal(false);
      setName("");
      setNotes("");
      const refresh = await fetch("/api/championships");
      setList(await refresh.json());
    }
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
        <button onClick={() => setShowModal(true)} className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm">
          + Novo Campeonato
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Nenhum campeonato ainda.</p>
          <p className="mt-2">Crie o primeiro para começar!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <Link key={c.id} href={`/championships/${c.id}`} className="block bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-5 transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{c.name}</h2>
                  {c.notes && <p className="text-sm text-gray-500 mt-1">{c.notes}</p>}
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[c.status] || "bg-gray-100 text-gray-700"}`}>
                  {c.status === "draft" ? "Rascunho" : c.status === "groups" ? "Grupos" : c.status === "knockout" ? "Mata-mata" : "Finalizado"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Novo Campeonato</h2>
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
    </div>
  );
}
