"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BracketView } from "@/components/bracket-view";

interface Participant {
  id: number;
  name: string;
  group_letter: string | null;
  status: string;
}

interface Match {
  id: number;
  phase: string;
  group_letter: string | null;
  round: number | null;
  bracket_position: number | null;
  player_home_id: number | null;
  player_away_id: number | null;
  score_home: number | null;
  score_away: number | null;
  score_home_penalty: number | null;
  score_away_penalty: number | null;
  status: string;
  winner_id: number | null;
  loser_id: number | null;
  display_order: number;
  scheduled_date: string | null;
}

interface Championship {
  id: number;
  name: string;
  status: string;
  notes: string | null;
}

function getFlag(name: string): string {
  const map: Record<string, string> = {
    "Brazil": "🇧🇷", "Argentina": "🇦🇷", "Germany": "🇩🇪", "France": "🇫🇷",
    "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Spain": "🇪🇸", "Portugal": "🇵🇹", "Netherlands": "🇳🇱",
    "Italy": "🇮🇹", "Uruguay": "🇺🇾", "Belgium": "🇧🇪", "Croatia": "🇭🇷",
    "Sweden": "🇸🇪", "Switzerland": "🇨🇭", "Denmark": "🇩🇰", "Poland": "🇵🇱",
    "Morocco": "🇲🇦", "Senegal": "🇸🇳", "Nigeria": "🇳🇬", "Cameroon": "🇨🇲",
    "Ghana": "🇬🇭", "Tunisia": "🇹🇳", "Algeria": "🇩🇿", "Egypt": "🇪🇬",
    "South Africa": "🇿🇦", "Canada": "🇨🇦", "USA": "🇺🇸", "Mexico": "🇲🇽",
    "Japan": "🇯🇵", "South Korea": "🇰🇷", "Australia": "🇦🇺", "Saudi Arabia": "🇸🇦",
    "Paraguay": "🇵🇾", "Colombia": "🇨🇴", "Chile": "🇨🇱", "Ecuador": "🇪🇨",
  };
  return map[name] || "";
}

function ParticipantAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const flag = getFlag(name);
  if (flag) {
    return <span className={`${size === "sm" ? "text-lg" : "text-xl"} leading-none`}>{flag}</span>;
  }
  const initial = name.charAt(0).toUpperCase();
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
  const colorIdx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return (
    <span className={`${colors[colorIdx]} ${size === "sm" ? "w-5 h-5 text-[10px]" : "w-7 h-7 text-xs"} rounded-full flex items-center justify-center text-white font-semibold`}>
      {initial}
    </span>
  );
}

export default function ChampionshipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [champ, setChamp] = useState<Championship | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [namesInput, setNamesInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/championships/${id}`);
      if (!res.ok) { if (!cancelled) setLoading(false); return; }
      const data = await res.json();
      if (!cancelled) {
        setChamp(data.championship);
        setParticipants(data.participants);
        setMatches(data.matches);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function fetchData() {
    const res = await fetch(`/api/championships/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setChamp(data.championship);
    setParticipants(data.participants);
    setMatches(data.matches);
  }

  async function addParticipants() {
    const names = namesInput.split(",").map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    const res = await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ championship_id: Number(id), names }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      return;
    }
    setNamesInput("");
    setError("");
    fetchData();
  }

  async function performDraw() {
    setError("");
    const res = await fetch("/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ championship_id: Number(id) }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      return;
    }
    fetchData();
  }

  async function advanceToKnockout() {
    setAdvancing(true);
    setError("");
    const res = await fetch("/api/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ championship_id: Number(id) }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setAdvancing(false);
      return;
    }
    fetchData();
    setAdvancing(false);
  }

  async function submitScore(matchId: number, scoreHome: number, scoreAway: number) {
    const res = await fetch("/api/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: matchId, score_home: Number(scoreHome), score_away: Number(scoreAway) }),
    });
    if (res.ok) fetchData();
  }

  function getParticipantName(pid: number | null): string {
    if (!pid) return "TBD";
    return participants.find((p) => p.id === pid)?.name ?? "TBD";
  }

  if (loading) return <div className="max-w-6xl mx-auto p-6 text-gray-400 text-sm">Carregando...</div>;

  if (!champ) return <div className="max-w-6xl mx-auto p-6 text-gray-400 text-sm">Campeonato não encontrado.</div>;

  const groupMatches = matches.filter((m) => m.phase === "group");
  const knockoutMatches = matches.filter((m) => m.phase !== "group");
  const groupLetters = [...new Set(groupMatches.map((m) => m.group_letter).filter((l): l is string => l !== null))].sort();
  const partsByGroup: Record<string, Participant[]> = {};
  for (const p of participants) {
    if (p.group_letter) {
      (partsByGroup[p.group_letter] ??= []).push(p);
    }
  }

  const allGroupMatchesCompleted = groupMatches.length > 0 && groupMatches.every((m) => m.status === "completed");
  const finalMatch = knockoutMatches.find((m) => m.phase === "final");
  const champion = finalMatch?.winner_id ? getParticipantName(finalMatch.winner_id) : null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-600 mb-4 inline-block text-sm">&larr; Voltar</button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{champ.name}</h1>
          {champ.notes && <p className="text-gray-500 text-sm mt-1">{champ.notes}</p>}
        </div>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
          {champ.status === "draft" ? "Rascunho" : champ.status === "groups" ? "Fase de Grupos" : champ.status === "knockout" ? "Mata-mata" : "Finalizado"}
        </span>
      </div>

      {champion && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
          <p className="text-xs text-yellow-700 uppercase tracking-wider font-semibold">Campeão</p>
          <p className="text-3xl font-bold text-yellow-800 mt-1">{champion}</p>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}

      {champ.status === "draft" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Participantes</h2>
          <div className="flex gap-2 mb-3">
            <input
              placeholder="Nomes separados por vírgula (ex: João, Maria, Pedro)"
              value={namesInput}
              onChange={(e) => setNamesInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addParticipants()}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-gray-500 text-gray-900 placeholder-gray-400 text-sm"
            />
            <button onClick={addParticipants} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">Adicionar</button>
          </div>
          {participants.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {participants.map((p) => (
                <span key={p.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{p.name}</span>
              ))}
            </div>
          )}
          {participants.length >= 2 && (
            <button onClick={performDraw} className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Realizar Sorteio ({participants.length} participantes)
            </button>
          )}
        </div>
      )}

      {groupMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Fase de Grupos</h2>
          <div className="space-y-4">
            {groupLetters.map((letter) => (
              <div key={letter} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Grupo {letter}</h3>
                {partsByGroup[letter] && partsByGroup[letter].length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {partsByGroup[letter].map((p) => (
                      <span key={p.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1.5">
                        <ParticipantAvatar name={p.name} /> {p.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  {groupMatches.filter((m) => m.group_letter === letter).map((m) => (
                    <MatchCard key={m.id} match={m} getParticipantName={getParticipantName} onSubmitScore={submitScore} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {allGroupMatchesCompleted && champ.status === "groups" && (
            <button
              onClick={advanceToKnockout}
              disabled={advancing}
              className="mt-6 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {advancing ? "Avançando..." : "Avançar para Mata-mata"}
            </button>
          )}
        </div>
      )}

      {knockoutMatches.length > 0 && champ.status !== "groups" && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Mata-mata</h2>
          <BracketView
            matches={knockoutMatches}
            getParticipantName={getParticipantName}
            onSubmitScore={submitScore}
          />
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  getParticipantName,
  onSubmitScore,
}: {
  match: Match;
  getParticipantName: (id: number | null) => string;
  onSubmitScore: (id: number, home: number, away: number) => void;
}) {
  const [homeScore, setHomeScore] = useState(match.score_home ?? 0);
  const [awayScore, setAwayScore] = useState(match.score_away ?? 0);

  const isHomeWinner = match.winner_id === match.player_home_id;
  const pHome = getParticipantName(match.player_home_id);
  const pAway = getParticipantName(match.player_away_id);

  const hasPenalties = match.score_home_penalty != null || match.score_away_penalty != null;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${match.status === "completed" ? "bg-gray-50 border-gray-300" : "bg-white border-gray-200"}`}>
      <div className="flex-1 flex items-center gap-2 justify-end">
        <span className={`text-sm font-medium ${isHomeWinner ? "text-gray-900" : match.status === "completed" ? "text-gray-400" : "text-gray-700"}`}>
          {pHome}
        </span>
        <ParticipantAvatar name={pHome} />
      </div>
      {match.status === "completed" ? (
        <div className="text-center min-w-[6ch]">
          <span className="text-base font-bold text-gray-900">
            {match.score_home}{hasPenalties && match.score_home_penalty != null ? ` (${match.score_home_penalty})` : ""}
          </span>
          <span className="text-gray-300 mx-1">-</span>
          <span className="text-base font-bold text-gray-900">
            {match.score_away}{hasPenalties && match.score_away_penalty != null ? ` (${match.score_away_penalty})` : ""}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <input type="number" min={0} value={homeScore} onChange={(e) => setHomeScore(Number(e.target.value))} className="w-10 border border-gray-300 rounded text-center py-1 text-sm text-gray-900" />
          <span className="text-gray-400 text-sm">x</span>
          <input type="number" min={0} value={awayScore} onChange={(e) => setAwayScore(Number(e.target.value))} className="w-10 border border-gray-300 rounded text-center py-1 text-sm text-gray-900" />
        </div>
      )}
      <div className="flex-1 flex items-center gap-2">
        <ParticipantAvatar name={pAway} />
        <span className={`text-sm font-medium ${!isHomeWinner && match.winner_id ? "text-gray-900" : match.status === "completed" ? "text-gray-400" : "text-gray-700"}`}>
          {pAway}
        </span>
      </div>
      {match.status === "pending" && match.player_home_id && match.player_away_id && (
        <button onClick={() => onSubmitScore(match.id, homeScore, awayScore)} className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-3 py-1.5 rounded transition-colors">
          Salvar
        </button>
      )}
    </div>
  );
}


