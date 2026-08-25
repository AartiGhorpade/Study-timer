/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "countdown" | "stopwatch";

const DEFAULT_SECONDS = 25 * 60;
const MAX_SECONDS = 99 * 60 * 60 + 59 * 60 + 59;

export default function Home() {
  /* =========================================================
     TIMER STATE
     ========================================================= */

  const [mode, setMode] = useState<Mode>("countdown");

  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS);

  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  const [running, setRunning] = useState(false);

  const [finished, setFinished] = useState(false);

  const [alarmActive, setAlarmActive] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [lastDuration, setLastDuration] = useState<number | null>(null);

  const audioContext = useRef<AudioContext | null>(null);

  /* =========================================================
     CURRENT CLOCK
     ========================================================= */

  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(clockInterval);
    };
  }, []);

  /* =========================================================
     MEMORY RECALL
     ========================================================= */

  useEffect(() => {
    const saved = window.localStorage.getItem("kitchen-timer-last-duration");

    if (saved) {
      const value = Number(saved);

      if (Number.isFinite(value) && value > 0 && value <= MAX_SECONDS) {
        setLastDuration(value);
      }
    }
  }, []);

  /* =========================================================
     FORMAT TIME
     ========================================================= */

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  /* =========================================================
     DISPLAY TIME
     ========================================================= */

  const countdownDisplay = formatTime(secondsLeft);

  const stopwatchDisplay = formatTime(stopwatchSeconds);

  const clockHours = String(currentTime.getHours()).padStart(2, "0");

  const clockMinutes = String(currentTime.getMinutes()).padStart(2, "0");

  const clockSeconds = String(currentTime.getSeconds()).padStart(2, "0");

  /* =========================================================
     ALARM SOUND
     ========================================================= */

  const playAlarm = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioCtx) return;

      const ctx = audioContext.current ?? new AudioCtx();

      audioContext.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      [0, 0.3, 0.6, 0.9, 1.2].forEach((offset) => {
        const oscillator = ctx.createOscillator();

        const gain = ctx.createGain();

        oscillator.type = "square";

        oscillator.frequency.setValueAtTime(880, now + offset);

        gain.gain.setValueAtTime(0.0001, now + offset);

        gain.gain.exponentialRampToValueAtTime(0.25, now + offset + 0.02);

        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.22);

        oscillator.connect(gain);

        gain.connect(ctx.destination);

        oscillator.start(now + offset);

        oscillator.stop(now + offset + 0.24);
      });
    } catch {
      // Browser may block audio.
    }
  };

  /* =========================================================
     COUNTDOWN
     ========================================================= */

  useEffect(() => {
    if (!running || mode !== "countdown") {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);

          setRunning(false);

          setFinished(true);

          setAlarmActive(true);

          playAlarm();

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [running, mode]);

  /* =========================================================
     STOPWATCH
     ========================================================= */

  useEffect(() => {
    if (!running || mode !== "stopwatch") {
      return;
    }

    const interval = window.setInterval(() => {
      setStopwatchSeconds((current) => {
        if (current >= MAX_SECONDS) {
          window.clearInterval(interval);

          setRunning(false);

          return current;
        }

        return current + 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [running, mode]);

  /* =========================================================
     ADD TIME
     ========================================================= */

  const addTime = (amount: number) => {
    if (mode !== "countdown") return;

    setSecondsLeft((current) => Math.min(MAX_SECONDS, current + amount));

    setFinished(false);
    setAlarmActive(false);
  };

  /* =========================================================
     START
     ========================================================= */

  const startTimer = () => {
    if (alarmActive) {
      return;
    }

    if (mode === "countdown") {
      if (secondsLeft === 0) {
        return;
      }

      setLastDuration(secondsLeft);

      window.localStorage.setItem(
        "kitchen-timer-last-duration",
        String(secondsLeft),
      );
    }

    setRunning(true);
    setFinished(false);
  };

  /* =========================================================
     PAUSE
     ========================================================= */

  const pauseTimer = () => {
    setRunning(false);
  };

  /* =========================================================
     RESET
     ========================================================= */

  const resetTimer = () => {
    setRunning(false);

    setFinished(false);

    setAlarmActive(false);

    if (mode === "countdown") {
      setSecondsLeft(DEFAULT_SECONDS);
    } else {
      setStopwatchSeconds(0);
    }
  };

  /* =========================================================
     STOP ALARM
     ========================================================= */

  const stopAlarm = () => {
    setAlarmActive(false);

    setFinished(false);

    if (audioContext.current) {
      try {
        audioContext.current.close();
      } catch {
        // Ignore close errors.
      }

      audioContext.current = null;
    }
  };

  /* =========================================================
     RECALL MEMORY
     ========================================================= */

  const recallMemory = () => {
    if (!lastDuration) return;

    setMode("countdown");

    setRunning(false);

    setFinished(false);

    setAlarmActive(false);

    setSecondsLeft(lastDuration);
  };

  /* =========================================================
     SWITCH MODE
     ========================================================= */

  const switchMode = (newMode: Mode) => {
    setRunning(false);

    setFinished(false);

    setAlarmActive(false);

    setMode(newMode);
  };

  /* =========================================================
     DISPLAY
     ========================================================= */

  let display;

  if (mode === "stopwatch") {
    display = stopwatchDisplay;
  } else {
    display = countdownDisplay;
  }

  /* =========================================================
     RETURN
     ========================================================= */

  return (
    <main className={`timer-page ${alarmActive ? "alarm-page" : ""}`}>
      {/* =====================================================
          FLOWER BACKGROUND
          ===================================================== */}

      <div className="flower flower-one">
        <div className="stem" />

        <div className="leaf leaf-one" />
        <div className="leaf leaf-two" />

        <div className="petal p1" />
        <div className="petal p2" />
        <div className="petal p3" />
        <div className="petal p4" />
        <div className="petal p5" />

        <div className="flower-center" />
      </div>

      <div className="flower flower-two">
        <div className="stem" />

        <div className="leaf leaf-one" />
        <div className="leaf leaf-two" />

        <div className="petal p1" />
        <div className="petal p2" />
        <div className="petal p3" />
        <div className="petal p4" />
        <div className="petal p5" />

        <div className="flower-center" />
      </div>

      {/* =====================================================
          TIMER BODY
          ===================================================== */}

      <section className={`kitchen-timer ${finished ? "timer-finished" : ""}`}>
        {/* TOP SENSOR */}

        <div className="top-sensor" aria-hidden="true" />

        {/* ===================================================
            LCD
            =================================================== */}

        <div className="lcd">
          <div className="lcd-clock">
            {running
              ? mode === "countdown"
                ? "COUNTDOWN"
                : "STOPWATCH"
              : mode === "countdown"
                ? "CLOCK"
                : "STOPWATCH"}
          </div>

          <div className="lcd-digits" aria-live="polite">
            <span>{display.hours[0]}</span>
            <span>{display.hours[1]}</span>

            <span className="lcd-colon">:</span>

            <span>{display.minutes[0]}</span>
            <span>{display.minutes[1]}</span>

            <span className="lcd-colon">:</span>

            <span>{display.seconds[0]}</span>
            <span>{display.seconds[1]}</span>
          </div>

          {/* IDLE CLOCK */}

          {!running &&
            mode === "countdown" &&
            secondsLeft === DEFAULT_SECONDS &&
            !finished && (
              <div className="lcd-status">
                LOCAL TIME&nbsp;&nbsp;
                {clockHours}:{clockMinutes}:{clockSeconds}
              </div>
            )}

          <div className="lcd-markers">
            <span>H</span>
            <span>M</span>
            <span>S</span>
          </div>
        </div>

        {/* ===================================================
            MODE BUTTONS
            =================================================== */}

        <div className="timer-channels">
          <button
            className={`channel ${mode === "countdown" ? "selected" : ""}`}
            onClick={() => switchMode("countdown")}
          >
            TIMER
          </button>

          <button
            className={`channel ${mode === "stopwatch" ? "selected" : ""}`}
            onClick={() => switchMode("stopwatch")}
          >
            STOPWATCH
          </button>
        </div>

        {/* ===================================================
            QUICK ADD
            =================================================== */}

        <div className="small-controls">
          <button
            className="small-control"
            onClick={() => addTime(60)}
            disabled={mode !== "countdown"}
          >
            <span className="control-label">+1 MIN</span>

            <span className="small-button" />
          </button>

          <button
            className="small-control"
            onClick={() => addTime(5 * 60)}
            disabled={mode !== "countdown"}
          >
            <span className="control-label">+5 MIN</span>

            <span className="small-button" />
          </button>

          <button
            className="small-control"
            onClick={recallMemory}
            disabled={!lastDuration}
          >
            <span className="control-label">RECALL</span>

            <span className="small-button" />
          </button>
        </div>

        {/* ===================================================
            MAIN CONTROLS
            =================================================== */}

        <div className="large-controls">
          <button className="large-control" onClick={resetTimer}>
            RESET
          </button>

          <button
            className="large-control"
            onClick={running ? pauseTimer : startTimer}
          >
            {running ? "PAUSE" : "START"}
          </button>

          <button className="large-control" onClick={resetTimer}>
            CLEAR
          </button>
        </div>

        {/* ===================================================
            STOP ALARM
            =================================================== */}

        {alarmActive && (
          <button className="stop-alarm" onClick={stopAlarm}>
            STOP ALARM
          </button>
        )}

        {/* ===================================================
            EXTRA CONTROLS
            =================================================== */}

        <div className="extra-controls">
          <button onClick={() => addTime(60)} disabled={mode !== "countdown"}>
            +1 MIN
          </button>

          <button
            onClick={() => addTime(5 * 60)}
            disabled={mode !== "countdown"}
          >
            +5 MIN
          </button>

          <button onClick={recallMemory} disabled={!lastDuration}>
            MEMORY
          </button>

          <button onClick={resetTimer}>RESET</button>
        </div>

        {/* ===================================================
            STATUS
            =================================================== */}

        <p className="timer-info">
          {alarmActive
            ? "TIME'S UP! • ALARM ACTIVE"
            : finished
              ? "TIMER FINISHED"
              : running
                ? mode === "countdown"
                  ? "COUNTDOWN RUNNING..."
                  : "STOPWATCH RUNNING..."
                : mode === "countdown"
                  ? "READY • SET YOUR TIME"
                  : "STOPWATCH READY"}
        </p>

        {/* ===================================================
            MEMORY INFO
            =================================================== */}

        {lastDuration && (
          <p className="memory-info">
            Last: {formatTime(lastDuration).hours}:
            {formatTime(lastDuration).minutes}:
            {formatTime(lastDuration).seconds}
          </p>
        )}

        {/* BOTTOM SHADOW */}

        <div className="timer-bottom" aria-hidden="true" />
      </section>
    </main>
  );
}
