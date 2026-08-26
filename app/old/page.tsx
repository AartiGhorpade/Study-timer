/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { useEffect, useRef, useState } from "react";

const MAX_SECONDS = 99 * 60 + 59;
const DEFAULT_SECONDS = 25 * 60;

type Timer = {
  id: number;
  seconds: number;
  initialSeconds: number;
  running: boolean;
  finished: boolean;
  countingUp: boolean;
};

type Mode = "timer" | "clock" | "alarm";

export default function Old() {
  const [timers, setTimers] = useState<Timer[]>([
    {
      id: 1,
      seconds: DEFAULT_SECONDS,
      initialSeconds: DEFAULT_SECONDS,
      running: false,
      finished: false,
      countingUp: false,
    },
    {
      id: 2,
      seconds: 0,
      initialSeconds: 0,
      running: false,
      finished: false,
      countingUp: false,
    },
    {
      id: 3,
      seconds: 0,
      initialSeconds: 0,
      running: false,
      finished: false,
      countingUp: false,
    },
    {
      id: 4,
      seconds: 0,
      initialSeconds: 0,
      running: false,
      finished: false,
      countingUp: false,
    },
  ]);

  const [selectedTimer, setSelectedTimer] = useState(1);

  const [mode, setMode] = useState<Mode>("timer");

  const [volume, setVolume] = useState<"high" | "low" | "silent">("high");

  const [memory, setMemory] = useState(DEFAULT_SECONDS);

  const [alarmHour, setAlarmHour] = useState(7);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [alarmEnabled, setAlarmEnabled] = useState(false);

  const [clock, setClock] = useState(new Date());

  const audioContext = useRef<AudioContext | null>(null);

  const currentTimer =
    timers.find((timer) => timer.id === selectedTimer) ?? timers[0];

  /* =====================================================
     CLOCK
     ===================================================== */

  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => window.clearInterval(clockInterval);
  }, []);

  /* =====================================================
     TIMER ENGINE
     ===================================================== */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimers((previous) =>
        previous.map((timer) => {
          if (!timer.running) {
            return timer;
          }

          /* COUNT UP */

          if (timer.countingUp) {
            if (timer.seconds >= MAX_SECONDS) {
              return {
                ...timer,
                running: false,
              };
            }

            return {
              ...timer,
              seconds: timer.seconds + 1,
            };
          }

          /* COUNT DOWN */

          if (timer.seconds <= 1) {
            playAlarm();

            return {
              ...timer,
              seconds: 0,
              running: false,
              finished: true,
            };
          }

          return {
            ...timer,
            seconds: timer.seconds - 1,
          };
        }),
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  /* =====================================================
     ALARM CLOCK
     ===================================================== */

  useEffect(() => {
    if (!alarmEnabled) return;

    const hours = clock.getHours();
    const minutes = clock.getMinutes();
    const seconds = clock.getSeconds();

    if (hours === alarmHour && minutes === alarmMinute && seconds === 0) {
      playAlarm();
    }
  }, [clock, alarmEnabled, alarmHour, alarmMinute]);

  /* =====================================================
     AUDIO
     ===================================================== */

  const playAlarm = () => {
    if (volume === "silent") return;

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

      const now = ctx.currentTime;

      const volumeLevel = volume === "high" ? 0.35 : 0.12;

      [0, 0.25, 0.5, 0.75].forEach((offset) => {
        const oscillator = ctx.createOscillator();

        const gain = ctx.createGain();

        oscillator.type = "square";

        oscillator.frequency.setValueAtTime(880, now + offset);

        gain.gain.setValueAtTime(0.0001, now + offset);

        gain.gain.exponentialRampToValueAtTime(
          volumeLevel,
          now + offset + 0.02,
        );

        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(now + offset);

        oscillator.stop(now + offset + 0.2);
      });
    } catch {
      // Browser audio may be blocked.
    }
  };

  /* =====================================================
     TIMER HELPERS
     ===================================================== */

  const updateSelectedTimer = (callback: (timer: Timer) => Timer) => {
    setTimers((previous) =>
      previous.map((timer) =>
        timer.id === selectedTimer ? callback(timer) : timer,
      ),
    );
  };

  const changeMinutes = (amount: number) => {
    updateSelectedTimer((timer) => {
      const seconds = Math.max(
        0,
        Math.min(MAX_SECONDS, timer.seconds + amount * 60),
      );

      return {
        ...timer,
        seconds,
        initialSeconds: seconds,
        finished: false,
        countingUp: false,
      };
    });
  };

  const changeSeconds = (amount: number) => {
    updateSelectedTimer((timer) => {
      const seconds = Math.max(
        0,
        Math.min(MAX_SECONDS, timer.seconds + amount),
      );

      return {
        ...timer,
        seconds,
        initialSeconds: seconds,
        finished: false,
        countingUp: false,
      };
    });
  };

  /* =====================================================
     START / STOP
     ===================================================== */

  const toggleTimer = () => {
    updateSelectedTimer((timer) => {
      /* Zero means stopwatch */

      if (timer.seconds === 0) {
        return {
          ...timer,
          running: !timer.running,
          countingUp: true,
          finished: false,
        };
      }

      return {
        ...timer,
        running: !timer.running,
        countingUp: false,
        finished: false,
      };
    });
  };

  /* =====================================================
     COUNT UP
     ===================================================== */

  const startStopwatch = () => {
    updateSelectedTimer((timer) => ({
      ...timer,
      seconds: timer.seconds === 0 ? 0 : timer.seconds,
      running: !timer.running,
      countingUp: true,
      finished: false,
    }));
  };

  /* =====================================================
     CLEAR
     ===================================================== */

  const clearTimer = () => {
    updateSelectedTimer((timer) => ({
      ...timer,
      seconds: 0,
      initialSeconds: 0,
      running: false,
      finished: false,
      countingUp: false,
    }));
  };

  /* =====================================================
     RESET
     ===================================================== */

  const resetTimer = () => {
    updateSelectedTimer((timer) => ({
      ...timer,
      seconds: timer.initialSeconds || DEFAULT_SECONDS,
      running: false,
      finished: false,
      countingUp: false,
    }));
  };

  /* =====================================================
     MEMORY
     ===================================================== */

  const saveMemory = () => {
    setMemory(currentTimer.seconds);
  };

  const recallMemory = () => {
    updateSelectedTimer((timer) => ({
      ...timer,
      seconds: memory || DEFAULT_SECONDS,
      initialSeconds: memory || DEFAULT_SECONDS,
      running: false,
      finished: false,
      countingUp: false,
    }));
  };

  /* =====================================================
     MODE
     ===================================================== */

  const cycleMode = () => {
    setMode((current) => {
      if (current === "timer") return "clock";

      if (current === "clock") return "alarm";

      return "timer";
    });
  };

  /* =====================================================
     TIMER DISPLAY
     ===================================================== */

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return {
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const formatted = formatTime(currentTimer.seconds);

  /* =====================================================
     CLOCK DISPLAY
     ===================================================== */

  const clockHours = String(clock.getHours()).padStart(2, "0");

  const clockMinutes = String(clock.getMinutes()).padStart(2, "0");

  const clockSeconds = String(clock.getSeconds()).padStart(2, "0");

  /* =====================================================
     ALARM DISPLAY
     ===================================================== */

  const alarmHours = String(alarmHour).padStart(2, "0");

  const alarmMinutes = String(alarmMinute).padStart(2, "0");

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <main className="timer-page">
      {/* =================================================
          FLOWERS
      ================================================= */}

      <div className="flower flower-one">
        <span className="stem" />
        <span className="leaf leaf-one" />
        <span className="leaf leaf-two" />

        <span className="petal p1" />
        <span className="petal p2" />
        <span className="petal p3" />
        <span className="petal p4" />
        <span className="petal p5" />

        <span className="flower-center" />
      </div>

      <div className="flower flower-two">
        <span className="stem" />
        <span className="leaf leaf-one" />
        <span className="leaf leaf-two" />

        <span className="petal p1" />
        <span className="petal p2" />
        <span className="petal p3" />
        <span className="petal p4" />
        <span className="petal p5" />

        <span className="flower-center" />
      </div>

      {/* =================================================
          TIMER
      ================================================= */}

      <section
        className={`kitchen-timer ${
          currentTimer.finished ? "timer-finished" : ""
        }`}
      >
        <div className="top-sensor" />

        {/* =================================================
            MODE DISPLAY
        ================================================= */}

        <div className="lcd">
          <div className="lcd-clock">
            {mode === "timer" &&
              (currentTimer.countingUp
                ? "STOPWATCH"
                : `TIMER T${selectedTimer}`)}

            {mode === "clock" && "CLOCK"}

            {mode === "alarm" && "ALARM"}
          </div>

          {mode === "timer" && (
            <>
              <div className="lcd-digits" aria-live="polite">
                <span>{formatted.minutes[0]}</span>

                <span>{formatted.minutes[1]}</span>

                <span className="lcd-colon">:</span>

                <span>{formatted.seconds[0]}</span>

                <span>{formatted.seconds[1]}</span>
              </div>

              <div className="lcd-status">
                {currentTimer.finished
                  ? "TIME UP"
                  : currentTimer.running
                    ? currentTimer.countingUp
                      ? "COUNT UP"
                      : "RUNNING"
                    : currentTimer.countingUp
                      ? "STOPWATCH"
                      : "READY"}
              </div>

              <div className="lcd-markers">
                <span>MIN</span>
                <span>SEC</span>
              </div>
            </>
          )}

          {mode === "clock" && (
            <div className="lcd-digits">
              <span>{clockHours[0]}</span>
              <span>{clockHours[1]}</span>

              <span className="lcd-colon">:</span>

              <span>{clockMinutes[0]}</span>
              <span>{clockMinutes[1]}</span>
            </div>
          )}

          {mode === "alarm" && (
            <div className="lcd-digits">
              <span>{alarmHours[0]}</span>
              <span>{alarmHours[1]}</span>

              <span className="lcd-colon">:</span>

              <span>{alarmMinutes[0]}</span>
              <span>{alarmMinutes[1]}</span>
            </div>
          )}
        </div>

        {/* =================================================
            TIMER CHANNELS
        ================================================= */}

        {mode === "timer" && (
          <div className="timer-channels">
            {[1, 2, 3, 4].map((id) => {
              const timer = timers.find((item) => item.id === id)!;

              return (
                <button
                  key={id}
                  className={`channel ${
                    selectedTimer === id ? "selected" : ""
                  } ${timer.finished ? "alarm-channel" : ""}`}
                  onClick={() => setSelectedTimer(id)}
                >
                  T{id}
                </button>
              );
            })}
          </div>
        )}

        {/* =================================================
            SMALL CONTROLS
        ================================================= */}

        {mode === "timer" && (
          <div className="small-controls">
            <button className="small-control" onClick={() => changeMinutes(60)}>
              <span className="control-label">HOUR</span>

              <span className="small-button" />
            </button>

            <button className="small-control" onClick={() => changeMinutes(1)}>
              <span className="control-label">MIN</span>

              <span className="small-button" />
            </button>

            <button className="small-control" onClick={() => changeSeconds(10)}>
              <span className="control-label">SEC</span>

              <span className="small-button" />
            </button>
          </div>
        )}

        {/* =================================================
            LARGE BUTTONS
        ================================================= */}

        <div className="large-controls">
          <button className="large-control" onClick={cycleMode}>
            <span>MODE</span>
          </button>

          <button
            className="large-control"
            onClick={
              mode === "timer"
                ? clearTimer
                : mode === "alarm"
                  ? () => setAlarmEnabled((value) => !value)
                  : () =>
                      setVolume((current) =>
                        current === "high"
                          ? "low"
                          : current === "low"
                            ? "silent"
                            : "high",
                      )
            }
          >
            <span>
              {mode === "timer"
                ? "CLEAR"
                : mode === "alarm"
                  ? alarmEnabled
                    ? "ALARM ON"
                    : "ALARM OFF"
                  : `VOL ${volume.toUpperCase()}`}
            </span>
          </button>

          <button
            className={`large-control start-stop ${
              currentTimer.running ? "pressed" : ""
            }`}
            onClick={mode === "timer" ? toggleTimer : playAlarm}
          >
            <span>
              {mode === "timer"
                ? currentTimer.running
                  ? "STOP"
                  : "START"
                : "TEST"}
            </span>
          </button>
        </div>

        {/* =================================================
            MEMORY + RESET
        ================================================= */}

        {mode === "timer" && (
          <div className="extra-controls">
            <button onClick={saveMemory}>SAVE MEMORY</button>

            <button onClick={recallMemory}>RECALL</button>

            <button onClick={startStopwatch}>COUNT UP</button>

            <button onClick={resetTimer}>RESET</button>
          </div>
        )}

        {/* =================================================
            ALARM SETTINGS
        ================================================= */}

        {mode === "alarm" && (
          <div className="alarm-settings">
            <button onClick={() => setAlarmHour((value) => (value + 1) % 24)}>
              HOUR +
            </button>

            <button onClick={() => setAlarmMinute((value) => (value + 1) % 60)}>
              MIN +
            </button>
          </div>
        )}

        {/* =================================================
            INFO
        ================================================= */}

        <p className="timer-info">
          {mode === "timer" &&
            (currentTimer.finished
              ? "Time's up!"
              : currentTimer.running
                ? currentTimer.countingUp
                  ? "Counting up..."
                  : `Timer T${selectedTimer} running...`
                : "MIN +1 • SEC +10")}

          {mode === "clock" && `${clockHours}:${clockMinutes}:${clockSeconds}`}

          {mode === "alarm" &&
            (alarmEnabled
              ? `Alarm set for ${alarmHours}:${alarmMinutes}`
              : "Alarm disabled")}
        </p>

        <div className="timer-bottom" />
      </section>
    </main>
  );
}
