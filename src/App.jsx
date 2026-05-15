import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SHOT_CONFIG = {
  layup: {
    id: "layup",
    label: "Layup",
    points: 1,
    baseOdds: 60,
    maxOdds: 95,
    upgradeStep: 5,
    costs: [3, 5, 8, 12, 18, 27, 40, 60, 90],
    x: 70,
    y: 18,
  },
  freeThrow: {
    id: "freeThrow",
    label: "Free Throw",
    points: 2,
    baseOdds: 30,
    maxOdds: 85,
    upgradeStep: 5,
    costs: [4, 7, 11, 17, 26, 39, 58, 87, 130, 195, 290, 430],
    x: 50,
    y: 39,
  },
  three: {
    id: "three",
    label: "Three Pointer",
    points: 3,
    baseOdds: 10,
    maxOdds: 75,
    upgradeStep: 5,
    costs: [5, 9, 16, 29, 52, 94, 170, 305, 550, 990, 1780, 3200, 5750, 10000],
    x: 34,
    y: 58,
  },
  halfCourt: {
    id: "halfCourt",
    label: "Half Court",
    points: 5,
    baseOdds: 5,
    maxOdds: 50,
    upgradeStep: 5,
    unlockCost: 25,
    costs: [40, 80, 160, 320, 650, 1300, 2700, 5500, 11000],
    x: 58,
    y: 90,
  },
};

const EXTRA_SHOT_COSTS = [3, 6, 12, 25, 50, 100, 175, 275, 425];
const GOLDEN_BALL_COSTS = [50, 175, 500, 1500, 4500];
const HOT_HAND_COSTS = [35, 125, 500, 2500];
const DOUBLE_RIM_COSTS = [60, 180, 500, 1400, 4000];
const SPECIALIST_COSTS = [10, 25, 75, 250, 900];
const PLAYOFF_TICKET_COST = 10000;
const TROPHY_COST = 100000;
const RIM = { x: 50, y: 15 };

const THEME = {
  possessions: {
    header: "bg-sky-950/60 border-sky-500/50 text-sky-300",
    card: "bg-gradient-to-br from-sky-950/55 to-slate-900 border-sky-500/40",
    title: "text-sky-200",
    add: "text-sky-300",
    button: "bg-sky-500 hover:bg-sky-600 text-white",
  },
  lab: {
    header: "bg-orange-950/60 border-orange-500/50 text-orange-300",
    card: "bg-gradient-to-br from-orange-950/45 to-slate-900 border-orange-500/40",
    title: "text-orange-200",
    add: "text-orange-300",
    button: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  heat: {
    header: "bg-red-950/60 border-red-500/50 text-red-300",
    card: "bg-gradient-to-br from-red-950/45 to-slate-900 border-red-500/40",
    title: "text-red-200",
    add: "text-red-300",
    button: "bg-red-500 hover:bg-red-600 text-white",
  },
  luck: {
    header: "bg-emerald-950/60 border-emerald-500/50 text-emerald-300",
    card: "bg-gradient-to-br from-emerald-950/45 to-slate-900 border-emerald-500/40",
    title: "text-emerald-200",
    add: "text-emerald-300",
    button: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
  trophy: {
    header: "bg-yellow-950/60 border-yellow-400/60 text-yellow-300",
    card: "bg-gradient-to-br from-yellow-950/70 via-amber-900/40 to-slate-900 border-yellow-400/70",
    title: "text-yellow-300",
    add: "text-yellow-300",
    button: "bg-yellow-400 hover:bg-yellow-500 text-slate-950",
  },
};

function formatNumber(value) {
  return Math.floor(Number(value) || 0).toLocaleString();
}

function Shell({ children, className = "" }) {
  return (
    <main className={`min-h-screen bg-slate-950 text-white flex items-center justify-center p-3 overflow-hidden ${className}`}>
      {children}
    </main>
  );
}

function Card({ children, className = "" }) {
  return <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${className}`}>{children}</div>;
}

function BasketballIcon({ className = "" }) {
  return (
    <div className={`relative rounded-full bg-orange-500 border-4 border-orange-900 shadow-2xl overflow-hidden ${className}`}>
      <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-orange-900/70" />
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-orange-900/70" />
      <div className="absolute inset-4 rounded-full border-2 border-orange-900/60" />
    </div>
  );
}

function UpgradeCard({
  title,
  currentValue,
  addValue,
  cost,
  disabled,
  maxed,
  onClick,
  buttonLabel = "Buy",
  theme = "lab",
  note = null,
}) {
  const [showNote, setShowNote] = useState(false);
  const isTrophy = title === "Championship Trophy";
  const isMilestone = title === "Playoff Ticket";
  const t = THEME[theme] || THEME.lab;
  const cardClass = maxed
    ? "bg-emerald-950/40 border-emerald-500/50"
    : disabled
    ? "bg-slate-900/75 border-slate-700"
    : t.card;
  const titleClass = maxed ? "text-emerald-200" : disabled ? "text-slate-300" : t.title;
  const addClass = maxed ? "text-emerald-300" : disabled ? "text-slate-400" : t.add;
  const buttonClass = maxed
    ? "bg-emerald-700/40 text-emerald-200"
    : disabled
    ? "bg-slate-800 text-slate-500"
    : isMilestone
    ? "bg-sky-400 hover:bg-sky-500 text-slate-950"
    : t.button;

  return (
    <div className={`rounded-xl border shadow-sm ${isTrophy || isMilestone ? "col-span-2 p-3.5" : "p-2.5"} ${cardClass}`}>
      <div className="min-h-[24px] flex items-center justify-between gap-2">
        <p className={`text-xs font-black leading-snug whitespace-normal break-words ${titleClass}`}>{title}</p>
        {note && (
          <button
            type="button"
            onClick={() => setShowNote((current) => !current)}
            className="shrink-0 w-6 h-6 rounded-full bg-slate-950/80 border border-slate-700 text-[13px] font-black italic flex items-center justify-center text-slate-300 hover:text-white active:scale-95"
            aria-label={`Info about ${title}`}
          >
            i
          </button>
        )}
      </div>

      {note && showNote && (
        <div className="mt-2 rounded-lg bg-slate-950/80 border border-slate-700 px-2 py-1.5 shadow-inner">
          <p className="text-[10px] leading-snug text-slate-200">{note}</p>
        </div>
      )}

      {!isTrophy && !isMilestone && (
        <div className="mt-2 grid grid-cols-1 gap-1.5">
          <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-2 py-1.5">
            <p className="text-[8px] uppercase tracking-wide text-slate-500 leading-none">Current</p>
            <p className="text-xs font-black text-slate-100 mt-1 leading-snug whitespace-normal break-words">{currentValue}</p>
          </div>
          <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-2 py-1.5">
            <p className="text-[8px] uppercase tracking-wide text-slate-500 leading-none">Adds</p>
            <p className={`text-xs font-black mt-1 leading-snug whitespace-normal break-words ${addClass}`}>{maxed ? "Maxed" : addValue}</p>
          </div>
        </div>
      )}

      {isMilestone && !maxed && (
        <div className="mt-2 rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2 text-center">
          <p className="text-[10px] font-black text-sky-200 leading-snug">
            Earned at 10,000 points. Claiming does not deduct your points.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled || maxed}
        className={`${isTrophy ? "mt-3" : "mt-2"} w-full rounded-lg py-2 text-xs font-black transition active:scale-[0.98] ${buttonClass}`}
      >
        {maxed ? "Maxed" : isMilestone ? "Claim Earned Ticket" : `${buttonLabel} ${formatNumber(cost)}`}
      </button>
    </div>
  );
}

function StatBox({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-lg bg-slate-900/90 border border-slate-700 px-2 py-1 text-center">
      <p className="text-[8px] uppercase tracking-wide text-slate-400 leading-none">{label}</p>
      <p className={`text-xs font-black mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

export default function BasketballUpgradeGame() {
  const [screen, setScreen] = useState("title");
  const [currentPoints, setCurrentPoints] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [isShooting, setIsShooting] = useState(false);
  const [activeShot, setActiveShot] = useState(null);
  const [shotAnimKey, setShotAnimKey] = useState(0);
  const [shotCount, setShotCount] = useState(0);
  const [pointsPop, setPointsPop] = useState(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [bigShotMessage, setBigShotMessage] = useState(null);
  const [shotHistory, setShotHistory] = useState([]);
  const [upgrades, setUpgrades] = useState({
    layup: 0,
    freeThrow: 0,
    three: 0,
    halfCourt: 0,
    halfCourtUnlocked: false,
    extraShots: 0,
    goldenBall: 0,
    hotHand: 0,
    doubleRim: 0,
    layupSpecialist: 0,
    freeThrowSpecialist: 0,
    threeSpecialist: 0,
    halfCourtSpecialist: 0,
    playoffTicket: 0,
  });

  const shotsPerTrip = 1 + upgrades.extraShots;
  const goldenChance = upgrades.goldenBall * 3;
  const doubleRimChance = upgrades.doubleRim * 10;
  const shotsRemaining = Math.max(0, shotsPerTrip - attemptsUsed);

  const layupSpecialistMult = 1 + upgrades.layupSpecialist;
  const freeThrowSpecialistMult = 1 + upgrades.freeThrowSpecialist;
  const threeSpecialistMult = 1 + upgrades.threeSpecialist;
  const halfCourtSpecialistMult = 1 + upgrades.halfCourtSpecialist;

  const availableShots = useMemo(() => {
    return Object.values(SHOT_CONFIG)
      .filter((shot) => shot.id !== "halfCourt" || upgrades.halfCourtUnlocked)
      .map((shot) => ({
        ...shot,
        odds: Math.min(shot.maxOdds, shot.baseOdds + upgrades[shot.id] * shot.upgradeStep),
      }));
  }, [upgrades]);

  const hotHandMultiplier = useMemo(() => getHotHandMultiplierFor(upgrades.hotHand, streak), [upgrades.hotHand, streak]);

  function getHotHandMultiplierFor(level, activeStreak) {
    if (level >= 4 && activeStreak >= 5) return 6;
    if (level >= 3 && activeStreak >= 4) return 4;
    if (level >= 2 && activeStreak >= 3) return 3;
    if (level >= 1 && activeStreak >= 2) return 2;
    return 1;
  }

  function buyUpgrade(key, cost, maxLevel) {
    if (!cost || currentPoints < cost || upgrades[key] >= maxLevel) return;
    setCurrentPoints((current) => current - cost);
    setUpgrades((current) => ({ ...current, [key]: current[key] + 1 }));
  }

  function unlockHalfCourt() {
    const cost = SHOT_CONFIG.halfCourt.unlockCost;
    if (currentPoints < cost || upgrades.halfCourtUnlocked) return;
    setCurrentPoints((current) => current - cost);
    setUpgrades((current) => ({ ...current, halfCourtUnlocked: true }));
  }

  function buyPlayoffTicket() {
    if (currentPoints < PLAYOFF_TICKET_COST || upgrades.playoffTicket >= 1) return;
    setUpgrades((current) => ({ ...current, playoffTicket: 1 }));
    setScreen("playoff");
  }

  function buyTrophy() {
    if (currentPoints < TROPHY_COST || hasWon) return;
    setCurrentPoints((current) => current - TROPHY_COST);
    setHasWon(true);
    setScreen("win");
  }

  function getShotSpecialistMultiplier(shotId) {
    if (shotId === "layup") return layupSpecialistMult;
    if (shotId === "freeThrow") return freeThrowSpecialistMult;
    if (shotId === "three") return threeSpecialistMult;
    if (shotId === "halfCourt") return halfCourtSpecialistMult;
    return 1;
  }

  function getShotValue(shot) {
    return shot.points * getShotSpecialistMultiplier(shot.id);
  }

  function clearShotStateForCourt() {
    setLastResult(null);
    setPointsPop(null);
    setBigShotMessage(null);
    setActiveShot(null);
    setIsShooting(false);
  }

  function takeShot(shot) {
    if (isShooting) return;

    const golden = goldenChance > 0 && Math.random() < goldenChance / 100;
    const initialMake = Math.random() < shot.odds / 100;
    const bouncedIn = !initialMake && doubleRimChance > 0 && Math.random() < doubleRimChance / 100;
    const made = initialMake || bouncedIn;
    const startingAttempt = attemptsUsed;

    setIsShooting(true);
    setLastResult(null);
    setPointsPop(null);
    setBigShotMessage(null);
    setActiveShot({ ...shot, made, golden, bouncedIn });
    setShotAnimKey((current) => current + 1);

    setTimeout(() => {
      const nextStreak = made ? streak + 1 : 0;
      const hotHandMult = getHotHandMultiplierFor(upgrades.hotHand, nextStreak);
      const shotValue = getShotValue(shot);
      const earned = made ? Math.floor(shotValue * hotHandMult * (golden ? 5 : 1)) : 0;

      setLastResult({ made, golden, bouncedIn, shot: shot.label, points: earned });
      setShotHistory((current) => [
        { id: `${Date.now()}-${shotCount}`, points: earned },
        ...current,
      ].slice(0, 10));

      if (earned > 0) {
        setCurrentPoints((current) => current + earned);
        setPointsPop(earned);
        setTimeout(() => setPointsPop(null), 900);
        if (earned >= 1000) {
          setBigShotMessage(earned >= 5000 ? "LEGENDARY BUCKET" : "BIG BUCKET");
          setTimeout(() => setBigShotMessage(null), 1500);
        }
      }

      setStreak(nextStreak);
      setBestStreak((current) => Math.max(current, nextStreak));
      setShotCount((current) => current + 1);
      setAttemptsUsed(startingAttempt + 1);
    }, 900);

    setTimeout(() => {
      const nextAttemptsUsed = startingAttempt + 1;
      setActiveShot(null);
      setIsShooting(false);
      if (nextAttemptsUsed >= shotsPerTrip) {
        setAttemptsUsed(0);
        setScreen("lockerRoom");
      } else {
        setLastResult(null);
      }
    }, 2200);
  }

  if (screen === "title") {
    return (
      <Shell className="bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950">
        <Card className="bg-slate-900/95 border border-orange-400/50">
          <div className="relative min-h-[720px] overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-orange-950">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-1/2 top-10 -translate-x-1/2 w-72 h-72 rounded-full bg-orange-500 blur-3xl" />
              <div className="absolute left-8 bottom-16 w-48 h-48 rounded-full bg-yellow-400 blur-3xl" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-64 bg-[#c98542] border-t-4 border-white/40">
              <div className="absolute inset-4 rounded-t-[60px] border-4 border-white/40" />
              <div className="absolute left-1/2 top-10 -translate-x-1/2 w-32 h-20 border-4 border-white/40 rounded-b-[40px]" />
              <div className="absolute left-1/2 top-24 -translate-x-1/2 w-24 h-3 bg-orange-500 rounded-full border border-orange-900 shadow-xl" />
            </div>
            <div className="relative z-10 px-6 pt-10 text-center">
              <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}>
                <BasketballIcon className="mx-auto mb-5 w-28 h-28" />
              </motion.div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-300 font-black">Arcade Hoops</p>
              <h1 className="text-5xl font-black leading-none mt-2 tracking-tight text-white">Shoot Your Shot</h1>
              <p className="text-slate-200 text-base mt-5 leading-relaxed max-w-sm mx-auto font-semibold">
                Shoot. Score. Upgrade. Build a hot streak and chase the Championship Trophy.
              </p>
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    clearShotStateForCourt();
                    setAttemptsUsed(0);
                    setScreen("court");
                  }}
                  className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] px-6 py-4 text-xl font-black text-white shadow-2xl transition"
                >
                  Hit the Court
                </button>
                <button
                  type="button"
                  onClick={() => setScreen("lockerRoom")}
                  className="w-full rounded-2xl bg-slate-950/85 hover:bg-slate-800 active:scale-[0.98] border border-slate-700 px-6 py-3 text-base font-black text-slate-100 shadow-xl transition"
                >
                  Go to Locker Room
                </button>
              </div>
            </div>
          </div>
        </Card>
      </Shell>
    );
  }

  if (screen === "playoff") {
    return (
      <Shell className="bg-gradient-to-b from-sky-300 via-blue-600 to-slate-950">
        <Card className="bg-slate-900 border border-sky-300">
          <div className="p-8 text-center">
            <motion.div initial={{ scale: 0.5, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ duration: 0.45, type: "spring" }} className="text-7xl mb-4">
              🎟️
            </motion.div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300 font-black">Milestone Reached</p>
            <h1 className="text-4xl font-black mt-2">Playoff Bound</h1>
            <p className="text-slate-300 mt-3">You earned the Playoff Ticket. The Championship Trophy is in sight.</p>
            <div className="grid grid-cols-3 gap-3 mt-8">
              <StatBox label="Points" value={formatNumber(currentPoints)} />
              <StatBox label="Streak" value={streak} />
              <StatBox label="Shots" value={shotsPerTrip} />
            </div>
            <button type="button" onClick={() => setScreen("lockerRoom")} className="mt-8 w-full bg-sky-500 hover:bg-sky-600 text-white font-black text-lg px-6 py-3 rounded-2xl shadow-xl transition">
              Back to Locker Room
            </button>
          </div>
        </Card>
      </Shell>
    );
  }

  if (screen === "win") {
    return (
      <Shell className="bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-700">
        <Card className="bg-slate-900 border border-yellow-300">
          <div className="p-8 text-center">
            <div className="text-7xl mb-4">🏆</div>
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Champion</p>
            <h1 className="text-4xl font-black mt-2">You Won</h1>
            <p className="text-slate-300 mt-3">You bought the Championship Trophy and beat Shoot Your Shot.</p>
            <div className="grid grid-cols-3 gap-3 mt-8">
              <StatBox label="Shots" value={formatNumber(shotCount)} />
              <StatBox label="Best Streak" value={bestStreak} />
              <StatBox label="Points Left" value={formatNumber(currentPoints)} />
            </div>
            <button type="button" onClick={() => setScreen("lockerRoom")} className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg px-6 py-3 rounded-2xl shadow-xl transition">
              Back to Locker Room
            </button>
          </div>
        </Card>
      </Shell>
    );
  }

  if (screen === "lockerRoom") {
    const layup = SHOT_CONFIG.layup;
    const freeThrow = SHOT_CONFIG.freeThrow;
    const three = SHOT_CONFIG.three;
    const halfCourt = SHOT_CONFIG.halfCourt;
    const layupOdds = layup.baseOdds + upgrades.layup * layup.upgradeStep;
    const freeThrowOdds = freeThrow.baseOdds + upgrades.freeThrow * freeThrow.upgradeStep;
    const threeOdds = three.baseOdds + upgrades.three * three.upgradeStep;
    const halfCourtOdds = halfCourt.baseOdds + upgrades.halfCourt * halfCourt.upgradeStep;

    const shopItems = [
      { type: "section", title: "Extra Possessions", theme: "possessions" },
      { key: "extraShots", theme: "possessions", title: "Extra Shots", currentValue: `${shotsPerTrip}/trip`, addValue: "+1 shot", cost: EXTRA_SHOT_COSTS[upgrades.extraShots] || 0, max: EXTRA_SHOT_COSTS.length, action: () => buyUpgrade("extraShots", EXTRA_SHOT_COSTS[upgrades.extraShots], EXTRA_SHOT_COSTS.length) },

      { type: "section", title: "Shot Lab", theme: "lab" },
      { key: "layup", theme: "lab", title: "Layup Accuracy", currentValue: `${layupOdds}%`, addValue: "+5% make", cost: layup.costs[upgrades.layup] || 0, max: layup.costs.length, action: () => buyUpgrade("layup", layup.costs[upgrades.layup], layup.costs.length) },
      { key: "layupSpecialist", theme: "lab", title: "Layup Value", currentValue: `${SHOT_CONFIG.layup.points * layupSpecialistMult} pts`, addValue: `+${SHOT_CONFIG.layup.points} point`, cost: SPECIALIST_COSTS[upgrades.layupSpecialist] || 0, max: SPECIALIST_COSTS.length, action: () => buyUpgrade("layupSpecialist", SPECIALIST_COSTS[upgrades.layupSpecialist], SPECIALIST_COSTS.length) },
      { key: "freeThrow", theme: "lab", title: "FT Accuracy", currentValue: `${freeThrowOdds}%`, addValue: "+5% make", cost: freeThrow.costs[upgrades.freeThrow] || 0, max: freeThrow.costs.length, action: () => buyUpgrade("freeThrow", freeThrow.costs[upgrades.freeThrow], freeThrow.costs.length) },
      { key: "freeThrowSpecialist", theme: "lab", title: "Free Throw Value", currentValue: `${SHOT_CONFIG.freeThrow.points * freeThrowSpecialistMult} pts`, addValue: `+${SHOT_CONFIG.freeThrow.points} pts`, cost: SPECIALIST_COSTS[upgrades.freeThrowSpecialist] || 0, max: SPECIALIST_COSTS.length, action: () => buyUpgrade("freeThrowSpecialist", SPECIALIST_COSTS[upgrades.freeThrowSpecialist], SPECIALIST_COSTS.length) },
      { key: "three", theme: "lab", title: "3PT Accuracy", currentValue: `${threeOdds}%`, addValue: "+5% make", cost: three.costs[upgrades.three] || 0, max: three.costs.length, action: () => buyUpgrade("three", three.costs[upgrades.three], three.costs.length) },
      { key: "threeSpecialist", theme: "lab", title: "3PT Value", currentValue: `${SHOT_CONFIG.three.points * threeSpecialistMult} pts`, addValue: `+${SHOT_CONFIG.three.points} pts`, cost: SPECIALIST_COSTS[upgrades.threeSpecialist] || 0, max: SPECIALIST_COSTS.length, action: () => buyUpgrade("threeSpecialist", SPECIALIST_COSTS[upgrades.threeSpecialist], SPECIALIST_COSTS.length) },
      !upgrades.halfCourtUnlocked
        ? { key: "unlockHalfCourt", theme: "lab", title: "Unlock Half Court", currentValue: "Locked", addValue: "5 pt shot", cost: halfCourt.unlockCost, max: 1, isUnlock: true, action: unlockHalfCourt }
        : { key: "halfCourt", theme: "lab", title: "Half Court Acc.", currentValue: `${halfCourtOdds}%`, addValue: "+5% make", cost: halfCourt.costs[upgrades.halfCourt] || 0, max: halfCourt.costs.length, action: () => buyUpgrade("halfCourt", halfCourt.costs[upgrades.halfCourt], halfCourt.costs.length) },
      upgrades.halfCourtUnlocked && { key: "halfCourtSpecialist", theme: "lab", title: "Half Court Value", currentValue: `${SHOT_CONFIG.halfCourt.points * halfCourtSpecialistMult} pts`, addValue: `+${SHOT_CONFIG.halfCourt.points} pts`, cost: SPECIALIST_COSTS[upgrades.halfCourtSpecialist] || 0, max: SPECIALIST_COSTS.length, action: () => buyUpgrade("halfCourtSpecialist", SPECIALIST_COSTS[upgrades.halfCourtSpecialist], SPECIALIST_COSTS.length) },

      { type: "section", title: "Heat Check", theme: "heat" },
      { key: "hotHand", theme: "heat", title: "Hot Hand", currentValue: `Lvl ${upgrades.hotHand}`, addValue: upgrades.hotHand >= HOT_HAND_COSTS.length ? "Maxed" : ["2x at 2", "3x at 3", "4x at 4", "6x at 5"][upgrades.hotHand], note: "Made-shot streaks multiply points.", cost: HOT_HAND_COSTS[upgrades.hotHand] || 0, max: HOT_HAND_COSTS.length, action: () => buyUpgrade("hotHand", HOT_HAND_COSTS[upgrades.hotHand], HOT_HAND_COSTS.length) },

      { type: "section", title: "Luck", theme: "luck" },
      { key: "doubleRim", theme: "luck", title: "Rim In Chance", currentValue: `${doubleRimChance}%`, addValue: "+10% rim-in", note: "Chance a missed shot bounces in.", cost: DOUBLE_RIM_COSTS[upgrades.doubleRim] || 0, max: DOUBLE_RIM_COSTS.length, action: () => buyUpgrade("doubleRim", DOUBLE_RIM_COSTS[upgrades.doubleRim], DOUBLE_RIM_COSTS.length) },
      { key: "goldenBall", theme: "luck", title: "Golden Ball Chance", currentValue: `${goldenChance}%`, addValue: "+3% golden", note: "Chance the ball appears golden. Golden makes pay 5x.", cost: GOLDEN_BALL_COSTS[upgrades.goldenBall] || 0, max: GOLDEN_BALL_COSTS.length, action: () => buyUpgrade("goldenBall", GOLDEN_BALL_COSTS[upgrades.goldenBall], GOLDEN_BALL_COSTS.length) },

      { type: "section", title: "The Trophy Case", theme: "trophy" },
      { key: "playoffTicket", theme: "trophy", title: "Playoff Ticket", currentValue: upgrades.playoffTicket > 0 ? "Claimed" : currentPoints >= PLAYOFF_TICKET_COST ? "Earned" : "Reach 10,000 points", addValue: "Milestone", cost: 0, max: 1, isMilestone: true, action: buyPlayoffTicket },
      { key: "trophy", theme: "trophy", title: "Championship Trophy", currentValue: hasWon ? "Owned" : "Not owned", addValue: "Win game", cost: TROPHY_COST, max: 1, isTrophy: true, action: buyTrophy },
    ].filter(Boolean);

    return (
      <Shell>
        <Card className="bg-slate-900 border border-slate-700">
          <div className="relative h-[760px] bg-gradient-to-b from-slate-500 via-slate-800 to-slate-950 overflow-hidden">
            <div className="absolute inset-0 px-4 pt-4 pb-4">
              <div className="h-full w-full rounded-3xl bg-gradient-to-b from-slate-600 to-slate-900 border border-slate-500/50 p-4 relative overflow-hidden shadow-inner">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

                <button
                  type="button"
                  onClick={() => {
                    clearShotStateForCourt();
                    setAttemptsUsed(0);
                    setScreen("court");
                  }}
                  className="relative z-30 w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black text-xl px-5 py-2.5 rounded-xl shadow-2xl transition"
                >
                  Hit the Court
                </button>

                <div className="relative z-20 rounded-xl bg-slate-950/85 border border-slate-700 px-3 py-2 mt-2 shadow-xl text-center">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Current Points</p>
                  <motion.p key={currentPoints} initial={{ scale: 1 }} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 0.3 }} className="text-3xl font-black text-white leading-none mt-0.5">
                    {formatNumber(currentPoints)}
                  </motion.p>
                </div>

                <div className="relative z-20 grid grid-cols-6 gap-1 mt-1.5">
                  <StatBox label="Shots" value={shotsPerTrip} />
                  <StatBox label="Streak" value={streak} />
                  <StatBox label="Golden" value={`${goldenChance}%`} color="text-yellow-300" />
                  <StatBox label="Hot" value={`x${hotHandMultiplier.toFixed(1)}`} color="text-green-300" />
                  <StatBox label="Rim In" value={`${doubleRimChance}%`} color="text-orange-300" />
                  <StatBox label="Goal" value={upgrades.playoffTicket ? "Trophy" : "Ticket"} color="text-sky-300" />
                </div>

                <div className="relative z-20 mt-2 mb-1"><p className="text-xs font-black text-white">Locker Room</p></div>
                <div className="relative z-20 mt-1 h-[440px] overflow-y-auto pr-1 pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    {shopItems.map((item, index) => {
                      if (item.type === "section") {
                        const t = THEME[item.theme] || THEME.lab;
                        return (
                          <div key={`section-${index}`} className={`col-span-2 mt-2 first:mt-0 rounded-xl border px-2 py-1.5 ${t.header}`}>
                            <p className="text-[9px] uppercase tracking-[0.2em] font-black">{item.title}</p>
                          </div>
                        );
                      }
                      const isMaxed = item.isUnlock ? false : item.isMilestone ? upgrades.playoffTicket >= 1 : item.isTrophy ? hasWon : upgrades[item.key] >= item.max;
                      const disabled = item.key === "playoffTicket" ? currentPoints < PLAYOFF_TICKET_COST : currentPoints < item.cost;
                      return (
                        <UpgradeCard
                          key={item.key}
                          title={item.title}
                          currentValue={item.currentValue}
                          addValue={item.addValue}
                          cost={item.cost}
                          disabled={disabled}
                          maxed={isMaxed}
                          onClick={item.action}
                          buttonLabel={item.isUnlock ? "Unlock" : "Buy"}
                          theme={item.theme}
                          note={item.note}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell className="bg-gradient-to-b from-slate-950 via-slate-900 to-orange-950 p-4">
      <div className="w-full max-w-md space-y-2">
        <Card className="bg-slate-900/95 border border-slate-700">
          <div className="relative h-[510px] bg-[#c98542] overflow-hidden">
            <div className="absolute left-3 top-3 z-30 rounded-2xl bg-slate-950/80 border border-slate-700 px-2 py-3 shadow-xl backdrop-blur-sm">
              <p className="text-[8px] uppercase tracking-wide text-orange-300 font-black text-center mb-2">Shots</p>
              <div className="flex flex-col gap-1.5">
                {[...Array(shotsPerTrip)].map((_, i) => {
                  const available = i < shotsRemaining;
                  return (
                    <div key={i} className={`relative w-8 h-8 rounded-full border-2 shadow-md overflow-hidden transition ${available ? "bg-orange-500 border-orange-800 opacity-100 scale-100" : "bg-slate-700 border-slate-600 opacity-35 scale-90"}`}>
                      <div className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 ${available ? "bg-orange-800/70" : "bg-slate-500/70"}`} />
                      <div className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 ${available ? "bg-orange-800/70" : "bg-slate-500/70"}`} />
                      <div className={`absolute inset-1 rounded-full border ${available ? "border-orange-800/50" : "border-slate-500/50"}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="absolute right-3 top-3 z-30 flex flex-col items-end gap-1.5 pointer-events-none">
              {shotHistory.map((item) => (
                <div key={item.id} className="rounded-full bg-slate-950/80 border border-slate-700 px-2.5 py-1 shadow-xl backdrop-blur-sm">
                  <p className={`text-base font-black leading-none drop-shadow-lg ${item.points > 0 ? "text-green-300" : "text-red-300"}`}>{item.points > 0 ? `+${formatNumber(item.points)}` : "0"}</p>
                </div>
              ))}
            </div>

            <svg className="absolute inset-0 z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <filter id="courtShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0.6" stdDeviation="0.5" floodOpacity="0.25" />
                </filter>
              </defs>
              <g opacity="0.18">
                {[8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88].map((y) => (
                  <line key={y} x1="4" y1={y} x2="96" y2={y} stroke="white" strokeWidth="0.35" />
                ))}
              </g>
              <g fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" filter="url(#courtShadow)">
                <rect x="3" y="3" width="94" height="94" rx="5" />
                <path d="M35 3 V38 H65 V3" />
                <path d="M38 38 C42 46 58 46 62 38" />
                <path d="M38 38 C42 30 58 30 62 38" strokeDasharray="2 2" opacity="0.8" />
                <path d="M14 3 V43" />
                <path d="M86 3 V43" />
                <path d="M14 43 C17 72 83 72 86 43" />
                <line x1="3" y1="89" x2="97" y2="89" />
                <path d="M39 97 C41 88 59 88 61 97" />
              </g>
              <g filter="url(#courtShadow)">
                <rect x="39" y="5" width="22" height="10" rx="1.5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
                <circle cx="50" cy="15" r="4.8" fill="none" stroke="rgb(249,115,22)" strokeWidth="1.8" />
                <path d="M45.6 18.3 C47.8 21.4 52.2 21.4 54.4 18.3" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="1" />
              </g>
            </svg>

            {!isShooting && availableShots.map((shot) => (
              <button
                key={shot.id}
                type="button"
                onClick={() => takeShot(shot)}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black px-4 py-2 shadow-xl border border-orange-300 z-30"
                style={{ left: `${shot.x}%`, top: `${shot.y}%` }}
              >
                <span className="block leading-tight">{shot.label}</span>
                <span className="block text-[11px] opacity-85">+{getShotValue(shot)} • {shot.odds}%</span>
              </button>
            ))}

            <AnimatePresence>
              {activeShot && (
                <motion.div
                  key={`${activeShot.id}-${shotAnimKey}`}
                  initial={{ left: `${activeShot.x}%`, top: `${activeShot.y}%`, scale: 1, opacity: 1 }}
                  animate={
                    activeShot.bouncedIn
                      ? { left: [`${activeShot.x}%`, `${RIM.x}%`, `${RIM.x + 6}%`, `${RIM.x}%`], top: [`${activeShot.y}%`, `${RIM.y}%`, `${RIM.y + 2}%`, `${RIM.y + 6}%`], scale: [1, 0.82, 0.82, 0.58] }
                      : activeShot.made
                      ? { left: [`${activeShot.x}%`, `${RIM.x}%`, `${RIM.x}%`], top: [`${activeShot.y}%`, `${RIM.y}%`, `${RIM.y + 6}%`], scale: [1, 0.8, 0.55] }
                      : { left: [`${activeShot.x}%`, `${RIM.x}%`, `${RIM.x + 7}%`], top: [`${activeShot.y}%`, `${RIM.y}%`, `${RIM.y + 3}%`], scale: [1, 0.82, 0.82] }
                  }
                  transition={{ duration: activeShot.bouncedIn ? 1.25 : 1.05, times: activeShot.bouncedIn ? [0, 0.58, 0.8, 1] : activeShot.made ? [0, 0.7, 1] : [0, 0.72, 1], ease: "easeOut" }}
                  className={`absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 shadow-2xl z-40 overflow-hidden ${activeShot.golden ? "bg-yellow-300 border-yellow-600" : "bg-orange-500 border-orange-800"}`}
                >
                  <div className={`absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 ${activeShot.golden ? "bg-yellow-700/70" : "bg-orange-800/70"}`} />
                  <div className={`absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 ${activeShot.golden ? "bg-yellow-700/70" : "bg-orange-800/70"}`} />
                  <div className={`absolute inset-1 rounded-full border ${activeShot.golden ? "border-yellow-700/50" : "border-orange-800/50"}`} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {lastResult && (
                <motion.div key={`result-${shotAnimKey}`} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`absolute inset-0 flex items-center justify-center pointer-events-none text-6xl font-black z-50 ${lastResult.made ? "text-green-300" : "text-red-300"}`}>
                  {lastResult.made ? (lastResult.bouncedIn ? "RIM IN" : lastResult.golden ? "GOLDEN" : "SWISH") : "CLANK"}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {pointsPop && (
                <motion.div key={`points-${shotAnimKey}-${pointsPop}`} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: -10, scale: 1.15 }} exit={{ opacity: 0, y: -30, scale: 0.95 }} transition={{ duration: 0.8 }} className="absolute inset-x-0 top-32 z-[65] flex justify-center pointer-events-none">
                  <div className="text-4xl font-black text-green-300 drop-shadow-[0_0_12px_rgba(134,239,172,0.9)]">+{formatNumber(pointsPop)}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {bigShotMessage && (
                <motion.div initial={{ opacity: 0, y: 30, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }} className="absolute inset-x-0 top-20 z-[60] flex justify-center pointer-events-none">
                  <div className="rounded-2xl bg-yellow-400 px-5 py-2 text-2xl font-black text-slate-950 shadow-2xl border-2 border-white/70">{bigShotMessage}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        <div className="rounded-xl bg-slate-950/85 border border-slate-700 p-2.5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-orange-300 font-black">Live Stats</p>
              <p className="text-2xl font-black leading-none mt-0.5">{formatNumber(currentPoints)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearShotStateForCourt();
                setAttemptsUsed(0);
                setScreen("lockerRoom");
              }}
              disabled={isShooting}
              className="rounded-lg bg-orange-500 hover:bg-orange-600 px-2.5 py-1 text-xs font-black text-white shadow-lg disabled:opacity-40"
            >
              Locker Room
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            <StatBox label="Attempt" value={`${Math.min(attemptsUsed + 1, shotsPerTrip)} / ${shotsPerTrip}`} />
            <StatBox label="Streak" value={streak} />
            <StatBox label="Hot" value={`x${hotHandMultiplier.toFixed(1)}`} color="text-green-300" />
            <StatBox label="Gold" value={`${goldenChance}%`} color="text-yellow-300" />
            <StatBox label="Rim" value={`${doubleRimChance}%`} color="text-orange-300" />
            <StatBox label="Shots" value={shotsRemaining} />
          </div>
        </div>
      </div>
    </Shell>
  );
}
