"use client";

import { useMemo, useState } from "react";

interface Match {
  id: number;
  phase: string;
  round: number | null;
  bracket_position: number | null;
  player_home_id: number | null;
  player_away_id: number | null;
  score_home: number | null;
  score_away: number | null;
  score_home_penalty: number | null;
  score_away_penalty: number | null;
  scheduled_date: string | null;
  status: string;
  winner_id: number | null;
}

const CARD_H = 118;
const CARD_GAP = 24;

function getFlag(name: string): string {
  const map: Record<string, string> = {
    Brazil: "\u{1F1E7}\u{1F1F7}", Argentina: "\u{1F1E6}\u{1F1F7}", Germany: "\u{1F1E9}\u{1F1EA}", France: "\u{1F1EB}\u{1F1F7}",
    England: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", Spain: "\u{1F1EA}\u{1F1F8}", Portugal: "\u{1F1F5}\u{1F1F9}", Netherlands: "\u{1F1F3}\u{1F1F1}",
    Italy: "\u{1F1EE}\u{1F1F9}", Uruguay: "\u{1F1FA}\u{1F1FE}", Belgium: "\u{1F1E7}\u{1F1EA}", Croatia: "\u{1F1ED}\u{1F1F7}",
    Sweden: "\u{1F1F8}\u{1F1EA}", Switzerland: "\u{1F1E8}\u{1F1ED}", Denmark: "\u{1F1E9}\u{1F1F0}", Poland: "\u{1F1F5}\u{1F1F1}",
    Morocco: "\u{1F1F2}\u{1F1E6}", Senegal: "\u{1F1F8}\u{1F1F3}", Nigeria: "\u{1F1F3}\u{1F1EC}", Cameroon: "\u{1F1E8}\u{1F1F2}",
    Ghana: "\u{1F1EC}\u{1F1ED}", Tunisia: "\u{1F1F9}\u{1F1F3}", Algeria: "\u{1F1E9}\u{1F1FF}", Egypt: "\u{1F1EA}\u{1F1EC}",
    "South Africa": "\u{1F1FF}\u{1F1E6}", Canada: "\u{1F1E8}\u{1F1E6}", USA: "\u{1F1FA}\u{1F1F8}", Mexico: "\u{1F1F2}\u{1F1FD}",
    Japan: "\u{1F1EF}\u{1F1F5}", "South Korea": "\u{1F1F0}\u{1F1F7}", Australia: "\u{1F1E6}\u{1F1FA}", "Saudi Arabia": "\u{1F1F8}\u{1F1E6}",
    Paraguay: "\u{1F1F5}\u{1F1FE}", Colombia: "\u{1F1E8}\u{1F1F4}", Chile: "\u{1F1E8}\u{1F1F1}", Ecuador: "\u{1F1EA}\u{1F1E8}",
  };
  return map[name] || "";
}

function Avatar({ name }: { name: string }) {
  const flag = getFlag(name);
  if (flag) return <span className="text-lg leading-none w-6 text-center">{flag}</span>;
  const initial = name.charAt(0).toUpperCase();
  const colors = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#f43f5e", "#06b6d4"];
  const colorIdx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return (
    <span
      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
      style={{ backgroundColor: colors[colorIdx] }}
    >
      {initial}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `Today, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function getRoundLabel(round: number, totalRounds: number): string {
  const slots = Math.pow(2, totalRounds);
  if (slots >= 32 && round === 0) return "Round of 32";
  if (slots >= 16 && round === (totalRounds >= 4 ? totalRounds - 4 : 0)) return "Round of 16";
  if (slots >= 8 && round === (totalRounds >= 3 ? totalRounds - 3 : Math.max(0, totalRounds - 3))) return "Quarter-finals";
  if (slots >= 4 && round === (totalRounds >= 2 ? totalRounds - 2 : Math.max(0, totalRounds - 2))) return "Semifinals";
  if (round === totalRounds) return "Final";
  const diff = totalRounds - round;
  if (diff === 4) return "Round of 16";
  if (diff === 3) return "Quarter-finals";
  if (diff === 2) return "Semifinals";
  if (diff === 1) return "Final";
  return `Round ${round + 1}`;
}

function WinnerArrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-700">
      <polygon points="3,1 9,5 3,9" fill="currentColor" />
    </svg>
  );
}

function computeLayout(roundMatches: Match[][], cardH: number, gap: number): number[][] {
  const layouts: number[][] = [];
  for (let r = 0; r < roundMatches.length; r++) {
    const rowLayouts: number[] = [];
    for (let p = 0; p < roundMatches[r].length; p++) {
      if (r === 0) {
        rowLayouts.push(p * (cardH + gap));
      } else {
        const c1 = layouts[r - 1][2 * p];
        const c2 = layouts[r - 1][2 * p + 1];
        const midY = (c1 + c2 + cardH) / 2;
        rowLayouts.push(midY - cardH / 2);
      }
    }
    layouts.push(rowLayouts);
  }
  return layouts;
}

function ConnectorSVG({ layouts, roundIdx, cardH }: { layouts: number[][]; roundIdx: number; cardH: number }) {
  const left = layouts[roundIdx];
  const right = layouts[roundIdx + 1];
  if (!left || !right) return null;
  const w = 44;
  const lastLeft = left[left.length - 1];
  const lastRight = right[right.length - 1];
  const totalH = Math.max(lastLeft + cardH, lastRight + cardH);

  const pairs: { y1: number; y2: number; joinY: number }[] = [];
  for (let i = 0; i < right.length; i++) {
    const y1 = left[2 * i] + cardH / 2;
    const y2 = left[2 * i + 1] + cardH / 2;
    const joinY = right[i] + cardH / 2;
    pairs.push({ y1, y2, joinY });
  }

  return (
    <svg width={w} height={totalH} className="flex-shrink-0" style={{ marginTop: 0 }}>
      {pairs.map(({ y1, y2, joinY }, i) => (
        <g key={i}>
          <path d={`M 0 ${y1} L ${w / 2} ${y1} L ${w / 2} ${joinY} L ${w} ${joinY}`} stroke="#d1d5db" fill="none" strokeWidth={1.5} />
          <path d={`M 0 ${y2} L ${w / 2} ${y2} L ${w / 2} ${joinY}`} stroke="#d1d5db" fill="none" strokeWidth={1.5} />
        </g>
      ))}
    </svg>
  );
}

export function BracketView({
  matches,
  getParticipantName,
  onSubmitScore,
}: {
  matches: Match[];
  getParticipantName: (id: number | null) => string;
  onSubmitScore: (id: number, home: number, away: number) => void;
}) {
  const totalRounds = matches.length > 0 ? Math.max(...matches.map((m) => m.round ?? 0)) : 0;

  const { roundMatches, layouts, roundNumbers } = useMemo(() => {
    const rounds = [...new Set(matches.map((m) => m.round ?? 0))].sort((a, b) => a - b);
    const grouped = rounds.map((r) =>
      matches.filter((m) => m.round === r).sort((a, b) => (a.bracket_position ?? 0) - (b.bracket_position ?? 0))
    );
    return {
      roundMatches: grouped,
      layouts: computeLayout(grouped, CARD_H, CARD_GAP),
      roundNumbers: rounds,
    };
  }, [matches]);

  const [visibleRounds, setVisibleRounds] = useState(3);

  const showChevron = roundNumbers.length > visibleRounds;
  const displayedRounds = roundMatches.slice(0, visibleRounds);
  const displayedLayouts = layouts.slice(0, visibleRounds);

  const thirdPlaceMatches = matches.filter((m) => m.phase === "third_place");

  return (
    <div className="select-none">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Knockout</h2>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-0 min-w-max">
          {displayedRounds.map((rMatches, idx) => (
            <div key={roundNumbers[idx]} className="flex items-start gap-0">
              <div className="flex flex-col" style={{ gap: 0 }}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-1">
                  {getRoundLabel(roundNumbers[idx], totalRounds)}
                </h3>
                <div className="relative">
                  {rMatches.map((m, pIdx) => {
                    const top = displayedLayouts[idx]?.[pIdx] ?? pIdx * (CARD_H + CARD_GAP);
                    return (
                      <div
                        key={m.id}
                        style={{ height: CARD_H, paddingTop: 0, marginBottom: 0, position: "absolute", top, left: 0, right: 0 }}
                      >
                        <BracketMatchCard
                          match={m}
                          getParticipantName={getParticipantName}
                          onSubmitScore={onSubmitScore}
                        />
                      </div>
                    );
                  })}
                  {/* Spacer to maintain height */}
                  <div style={{ height: (displayedLayouts[idx]?.[rMatches.length - 1] ?? (rMatches.length - 1) * (CARD_H + CARD_GAP)) + CARD_H }} />
                </div>
              </div>

              {idx < displayedRounds.length - 1 && (
                <ConnectorSVG layouts={displayedLayouts} roundIdx={idx} cardH={CARD_H} />
              )}
            </div>
          ))}

          {showChevron && (
            <div className="flex items-start pt-8 ml-2">
              <button
                onClick={() => setVisibleRounds((v) => Math.min(v + 1, roundNumbers.length))}
                className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center shadow-sm hover:shadow-md hover:border-gray-400 transition-all cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-500">
                  <polyline points="6,4 10,8 6,12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {thirdPlaceMatches.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Third Place Match</h3>
          <div className="flex gap-4">
            {thirdPlaceMatches.map((m) => (
              <div key={m.id} className="w-[240px]">
                <BracketMatchCard
                  match={m}
                  getParticipantName={getParticipantName}
                  onSubmitScore={onSubmitScore}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BracketMatchCard({
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

  const home = getParticipantName(match.player_home_id);
  const away = getParticipantName(match.player_away_id);
  const isHomeWinner = match.winner_id === match.player_home_id;
  const isAwayWinner = match.winner_id === match.player_away_id;
  const hasPenalties = match.score_home_penalty != null || match.score_away_penalty != null;
  const isLive = false;

  return (
    <div className="w-[240px] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-gray-50">
        <span className="text-[11px] text-gray-500">
          {match.status === "completed" ? (
            <span className={`font-semibold ${hasPenalties ? "text-gray-600" : "text-gray-600"}`}>
              {hasPenalties ? "FT (P)" : "FT"}
            </span>
          ) : isLive ? (
            <span className="text-red-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              Live
            </span>
          ) : (
            formatDate(match.scheduled_date) || "TBD"
          )}
        </span>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        {/* Home team */}
        <div className="flex items-center gap-2">
          <Avatar name={home} />
          <span className={`flex-1 text-sm truncate ${isHomeWinner ? "font-semibold text-gray-900" : match.status === "completed" ? "text-gray-400" : "text-gray-700"}`}>
            {home}
          </span>
          <div className="flex items-center gap-1">
            {match.status === "completed" ? (
              <>
                <span className={`text-sm font-bold min-w-[1.5ch] text-right ${isHomeWinner ? "text-gray-900" : "text-gray-400"}`}>
                  {match.score_home}
                </span>
                {hasPenalties && match.score_home_penalty != null && (
                  <span className="text-[10px] text-gray-400">({match.score_home_penalty})</span>
                )}
                {isHomeWinner && <WinnerArrow />}
              </>
            ) : (
              <input
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(Number(e.target.value))}
                className="w-8 text-center text-sm border border-gray-200 rounded py-0.5 text-gray-900 bg-white"
                disabled={!match.player_home_id || !match.player_away_id}
              />
            )}
          </div>
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2">
          <Avatar name={away} />
          <span className={`flex-1 text-sm truncate ${isAwayWinner ? "font-semibold text-gray-900" : match.status === "completed" ? "text-gray-400" : "text-gray-700"}`}>
            {away}
          </span>
          <div className="flex items-center gap-1">
            {match.status === "completed" ? (
              <>
                <span className={`text-sm font-bold min-w-[1.5ch] text-right ${isAwayWinner ? "text-gray-900" : "text-gray-400"}`}>
                  {match.score_away}
                </span>
                {hasPenalties && match.score_away_penalty != null && (
                  <span className="text-[10px] text-gray-400">({match.score_away_penalty})</span>
                )}
                {isAwayWinner && <WinnerArrow />}
              </>
            ) : (
              <input
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(Number(e.target.value))}
                className="w-8 text-center text-sm border border-gray-200 rounded py-0.5 text-gray-900 bg-white"
                disabled={!match.player_home_id || !match.player_away_id}
              />
            )}
          </div>
        </div>
      </div>

      {match.status === "pending" && match.player_home_id && match.player_away_id && (
        <div className="px-3 pb-2">
          <button
            onClick={() => onSubmitScore(match.id, homeScore, awayScore)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-medium py-1.5 rounded transition-colors"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}
