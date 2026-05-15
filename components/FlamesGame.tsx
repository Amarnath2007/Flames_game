"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./FlamesGame.module.css";
import { 
  FLAMES_DATA, 
  normalizeName, 
  countRemaining, 
  calculateFlames, 
  getEliminationOrder, 
  playSound,
  FlamesKey 
} from "@/lib/utils";

// Dynamically import html2canvas to reduce initial bundle size
// Dynamic import of html2canvas is handled inside handleSaveImg to reduce initial bundle size

export default function FlamesGame() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultState, setResultState] = useState<any>(null);
  const [litLetters, setLitLetters] = useState<Set<string>>(new Set());
  const [outLetters, setOutLetters] = useState<Set<string>>(new Set());
  const [winLetter, setWinLetter] = useState<string | null>(null);
  const [wheelCaption, setWheelCaption] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const n1Ref = useRef<HTMLInputElement>(null);
  const n2Ref = useRef<HTMLInputElement>(null);
  const scInRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2600);
  };

  const handleGo = async () => {
    const r1 = name1.trim();
    const r2 = name2.trim();

    if (!r1 || !r2) {
      setError(!r1 && !r2 ? "Please enter both names 🔥" : !r1 ? "Enter your name ✨" : "Enter their name 💫");
      return;
    }

    setLoading(true);
    playSound("start");
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

    const a = normalizeName(r1);
    const b = normalizeName(r2);
    const cnt = countRemaining(a, b) || (a.length + b.length);
    const winner = calculateFlames(cnt);
    const order = getEliminationOrder(cnt);

    const newState = { r1, r2, cnt, winner, order, data: FLAMES_DATA[winner] };
    setResultState(newState);

    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
      startWheelSequence(order, winner, cnt);
    }, 1800);
  };

  const startWheelSequence = (order: FlamesKey[], winner: string, cnt: number) => {
    setLitLetters(new Set());
    setOutLetters(new Set());
    setWinLetter(null);
    setWheelCaption("");
    setIsRevealed(false);
    playSound("reveal");
    if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 80]);

    let remaining: FlamesKey[] = ["F", "L", "A", "M", "E", "S"];
    let globalPos = 0;

    const runStep = (stepIdx: number) => {
      if (stepIdx >= order.length) {
        setLitLetters(new Set());
        setWinLetter(winner);
        setWheelCaption(`✨ ${FLAMES_DATA[winner as FlamesKey].label.toUpperCase()} ✨`);
        setTimeout(() => setIsRevealed(true), 600);
        return;
      }

      const target = order[stepIdx];
      const n = cnt % remaining.length || remaining.length;
      let swept = 0;
      let pos = globalPos;

      const sweep = () => {
        const currentLetter = remaining[pos % remaining.length];
        setLitLetters(new Set([currentLetter]));
        setWheelCaption(`Counting… ${swept + 1}`);
        swept++;
        pos = (pos + 1) % remaining.length;

        if (swept < n) {
          const delay = swept <= 2 || swept === n - 1 ? 170 : 85;
          setTimeout(sweep, delay);
        } else {
          setLitLetters(new Set([target]));
          setWheelCaption(`❌ ${target} eliminated`);
          
          setTimeout(() => {
            setOutLetters(prev => new Set([...Array.from(prev), target]));
            setLitLetters(new Set());
            const ri = remaining.indexOf(target);
            remaining.splice(ri, 1);
            globalPos = remaining.length > 0 ? ri % remaining.length : 0;
            setTimeout(() => runStep(stepIdx + 1), 330);
          }, 480);
        }
      };
      sweep();
    };

    setTimeout(() => runStep(0), 1000);
  };

  const handleReset = () => {
    setShowResult(false);
    setName1("");
    setName2("");
    setError("");
    setResultState(null);
    setLitLetters(new Set());
    setOutLetters(new Set());
    setWinLetter(null);
    setWheelCaption("");
    setIsRevealed(false);
  };

  const handleShareWa = () => {
    const { r1, r2, data } = resultState;
    const t = `🔥 FLAMES says: ${r1} & ${r2} = ${data.label.toUpperCase()} ${data.emoji}\n\n"${data.msg}"`;
    window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, "_blank");
  };

  const handleSaveImg = async () => {
    if (!scInRef.current) return;
    showToast("⏳ Preparing image...");
    try {
      const html2canvasLib = (await import("html2canvas")).default;
      const canvas = await html2canvasLib(scInRef.current, { scale: 3, backgroundColor: null, logging: false });
      const a = document.createElement("a");
      a.download = `flames-${resultState.r1}-${resultState.r2}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      showToast("💾 Image saved!");
    } catch (e) {
      showToast("⚠️ Could not save");
    }
  };

  const handleCopy = () => {
    const { r1, r2, data } = resultState;
    navigator.clipboard.writeText(`${r1} & ${r2} = ${data.label.toUpperCase()} ${data.emoji} — "${data.msg}"`)
      .then(() => showToast("📋 Copied!"))
      .catch(() => showToast("⚠️ Failed"));
  };

  return (
    <div className={styles.appContainer}>
      {/* Loading Overlay */}
      <div className={`${styles.loading} ${loading ? styles.on : ""}`}>
        <div className={styles.ring}><span className={styles.ringIcon}>🔥</span></div>
        <div className={styles.loadTxt}>Reading your destiny…</div>
      </div>

      {/* Result Screen */}
      <div className={`${styles.result} ${showResult ? styles.on : ""}`} style={{ "--glow": resultState?.data.glow } as any}>
        <div className={styles.rw}>
          <div className={`${styles.rPair} anim-slide`}>{resultState?.r1} & {resultState?.r2}</div>
          
          <div className={styles.wheelRow}>
            {["F", "L", "A", "M", "E", "S"].map((l) => (
              <div 
                key={l} 
                className={`${styles.wl} ${litLetters.has(l) ? styles.lit : ""} ${outLetters.has(l) ? styles.out : ""} ${winLetter === l ? styles.win : ""}`}
              >
                {l}
              </div>
            ))}
          </div>
          <div className={styles.wCap}>{wheelCaption}</div>

          {isRevealed && (
            <>
              <span className={`${styles.rEmoji} anim-pop`}>{resultState?.data.emoji}</span>
              <div className={`${styles.rWord} anim-slide`}>{resultState?.data.label.toUpperCase()}</div>
              <div className={`${styles.rMsg} anim-fade`}>{resultState?.data.msg}</div>

              <div className={`${styles.sc} anim-slide`}>
                <div className={styles.scIn} ref={scInRef}>
                  <div className={styles.scEmoji}>{resultState?.data.emoji}</div>
                  <div className={styles.scRes}>{resultState?.data.label.toUpperCase()}</div>
                  <div className={styles.scNames}>{resultState?.r1} 🔥 {resultState?.r2}</div>
                  <div className={styles.scTag}>FLAMES · Relationship Destiny</div>
                </div>
              </div>

              <div className={`${styles.actions} anim-fade`}>
                <button className={`${styles.ab} ${styles.wa}`} onClick={handleShareWa}>💬 WhatsApp</button>
                <button className={`${styles.ab} ${styles.dl}`} onClick={handleSaveImg}>📸 Save</button>
                <button className={`${styles.ab} ${styles.cp}`} onClick={handleCopy}>📋 Copy</button>
              </div>
              <button className={`${styles.again} anim-fade`} onClick={handleReset}>↩ Try Again</button>
            </>
          )}
        </div>
      </div>

      {/* Main Card */}
      {!showResult && (
        <div className={styles.card}>
          <div className={styles.cardHeading}>Enter Two Names</div>
          <div className={styles.field}>
            <label>Your Name</label>
            <input 
              type="text" 
              value={name1} 
              onChange={(e) => {setName1(e.target.value); setError("");}}
              placeholder="e.g. Arjun" 
              maxLength={40} 
              autoComplete="off" 
              spellCheck="false"
              onKeyDown={(e) => e.key === "Enter" && handleGo()}
              ref={n1Ref}
            />
          </div>
          <div className={styles.sep}>💞</div>
          <div className={styles.field}>
            <label>Their Name</label>
            <input 
              type="text" 
              value={name2} 
              onChange={(e) => {setName2(e.target.value); setError("");}}
              placeholder="e.g. Priya" 
              maxLength={40} 
              autoComplete="off" 
              spellCheck="false"
              onKeyDown={(e) => e.key === "Enter" && handleGo()}
              ref={n2Ref}
            />
          </div>
          <button className={styles.cta} onClick={handleGo} disabled={loading}>
            {loading ? "⏳ Consulting Stars..." : "🔥 Reveal Your FLAMES 🔥"}
          </button>
          <div className={styles.err}>{error}</div>
          <div className={styles.strip}>
            {["F", "L", "A", "M", "E", "S"].map(l => <div key={l} className={styles.sl}>{l}</div>)}
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`${styles.toast} ${toast.show ? styles.on : ""}`}>{toast.msg}</div>
    </div>
  );
}
