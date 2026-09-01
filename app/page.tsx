"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

type Mode = "timer" | "stopwatch";

type AddSubButtonsProps = {
  label: string;
  onChange: (amount: number) => void;
};

const AddSubButtons = ({ label, onChange }: AddSubButtonsProps) => {
  return (
    <div className="text-center">
      <span className="control-label">{label}</span>

      <div className="flex gap-2">
        <button
          type="button"
          className="small-button cursor-pointer mt-1"
          onClick={() => onChange(1)}
        >
          +1
        </button>

        <button
          type="button"
          className="small-button cursor-pointer mt-1"
          onClick={() => onChange(-1)}
        >
          -1
        </button>
      </div>
    </div>
  );
};

const Trail = () => {
  const [mode, setMode] = useState<Mode>("timer");

  const [isRunning, setIsRunning] = useState(false);

  // Default timer = 25 minutes
  const [defaultSeconds, setDefaultSeconds] = useState(1500);

  // Timer / Stopwatch displayed seconds
  const [seconds, setSeconds] = useState(1500);

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Today's total study time
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);

  // ==========================================
  // ACCURATE TIME TRACKING
  // ==========================================

  // When current running session started
  const startTimeRef = useRef<number | null>(null);

  // Value of timer/stopwatch when Start was clicked
  const startingSecondsRef = useRef(0);

  // Used for calculating study time accurately
  const studyStartTimeRef = useRef<number | null>(null);

  // Total study time before current running session
  const previousStudySecondsRef = useRef(0);

  // ==========================================
  // GET TODAY'S LOCAL DATE
  // ==========================================

  const getToday = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // CURRENT TIME & DATE
  // ==========================================

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );

      setCurrentDate(now.toLocaleDateString("en-GB"));
    };

    updateDateTime();

    const interval = setInterval(updateDateTime, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // LOAD TODAY'S STUDY DATA
  // ==========================================

  useEffect(() => {
    const today = getToday();

    const savedData = localStorage.getItem("studyData");

    if (savedData) {
      try {
        const data = JSON.parse(savedData);

        if (data.date === today) {
          setTotalStudySeconds(data.totalSeconds);
        } else {
          const newData = {
            date: today,
            totalSeconds: 0,
          };

          localStorage.setItem("studyData", JSON.stringify(newData));

          setTotalStudySeconds(0);
        }
      } catch (error) {
        console.error("Error reading study data:", error);

        setTotalStudySeconds(0);
      }
    } else {
      const newData = {
        date: today,
        totalSeconds: 0,
      };

      localStorage.setItem("studyData", JSON.stringify(newData));

      setTotalStudySeconds(0);
    }
  }, []);

  // ==========================================
  // START / PAUSE
  // ==========================================

  const buttonHandler = () => {
    // Don't start an empty timer
    if (mode === "timer" && seconds === 0) {
      return;
    }

    // ==========================
    // PAUSE
    // ==========================

    if (isRunning) {
      const now = Date.now();

      // Calculate exact elapsed seconds
      if (startTimeRef.current !== null) {
        const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);

        if (mode === "timer") {
          const newSeconds = Math.max(
            0,
            startingSecondsRef.current - elapsedSeconds,
          );

          setSeconds(newSeconds);
        } else {
          const newSeconds = startingSecondsRef.current + elapsedSeconds;

          setSeconds(newSeconds);
        }
      }

      // Update total study accurately
      if (studyStartTimeRef.current !== null) {
        const studyElapsedSeconds = Math.floor(
          (now - studyStartTimeRef.current) / 1000,
        );

        const newTotal = previousStudySecondsRef.current + studyElapsedSeconds;

        setTotalStudySeconds(newTotal);

        localStorage.setItem(
          "studyData",
          JSON.stringify({
            date: getToday(),
            totalSeconds: newTotal,
          }),
        );
      }

      setIsRunning(false);

      startTimeRef.current = null;
      studyStartTimeRef.current = null;

      return;
    }

    // ==========================
    // START
    // ==========================

    const now = Date.now();

    startTimeRef.current = now;

    startingSecondsRef.current = seconds;

    // Save today's study time before starting this session
    const savedData = localStorage.getItem("studyData");

    let previousTotal = totalStudySeconds;

    if (savedData) {
      try {
        const data = JSON.parse(savedData);

        if (data.date === getToday()) {
          previousTotal = data.totalSeconds || 0;
        } else {
          previousTotal = 0;
        }
      } catch {
        previousTotal = totalStudySeconds;
      }
    }

    previousStudySecondsRef.current = previousTotal;
    studyStartTimeRef.current = now;

    setIsRunning(true);
  };

  // ==========================================
  // RESET
  // ==========================================

  const resetHandler = () => {
    setIsRunning(false);

    startTimeRef.current = null;
    studyStartTimeRef.current = null;

    if (mode === "timer") {
      setSeconds(defaultSeconds);
    } else {
      setSeconds(0);
    }
  };

  // ==========================================
  // CHANGE TIMER DURATION
  // ==========================================

  const changeTimer = (amount: number) => {
    // Don't change timer while running
    if (isRunning) {
      return;
    }

    setSeconds((prev) => {
      const newValue = Math.max(0, prev + amount);

      setDefaultSeconds(newValue);

      return newValue;
    });
  };

  // ==========================================
  // ACCURATE TIMER / STOPWATCH
  // ==========================================

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const updateTimer = () => {
      if (startTimeRef.current === null) {
        return;
      }

      const now = Date.now();

      // Exact elapsed seconds since Start
      const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);

      // ==========================================
      // TIMER
      // ==========================================

      if (mode === "timer") {
        const newSeconds = Math.max(
          0,
          startingSecondsRef.current - elapsedSeconds,
        );

        setSeconds(newSeconds);

        // Timer finished
        if (newSeconds === 0) {
          // Calculate final study time
          if (studyStartTimeRef.current !== null) {
            const studyElapsedSeconds = Math.floor(
              (now - studyStartTimeRef.current) / 1000,
            );

            const newTotal =
              previousStudySecondsRef.current + studyElapsedSeconds;

            setTotalStudySeconds(newTotal);

            localStorage.setItem(
              "studyData",
              JSON.stringify({
                date: getToday(),
                totalSeconds: newTotal,
              }),
            );
          }

          setIsRunning(false);

          startTimeRef.current = null;
          studyStartTimeRef.current = null;
        }
      }

      // ==========================================
      // STOPWATCH
      // ==========================================
      else {
        const newSeconds = startingSecondsRef.current + elapsedSeconds;

        setSeconds(newSeconds);
      }

      // ==========================================
      // UPDATE TODAY'S STUDY TIME
      // ==========================================

      if (studyStartTimeRef.current !== null) {
        const studyElapsedSeconds = Math.floor(
          (now - studyStartTimeRef.current) / 1000,
        );

        const newTotal = previousStudySecondsRef.current + studyElapsedSeconds;

        setTotalStudySeconds(newTotal);

        localStorage.setItem(
          "studyData",
          JSON.stringify({
            date: getToday(),
            totalSeconds: newTotal,
          }),
        );
      }
    };

    // UI update every 250ms.
    // Actual time is still calculated using Date.now().
    const interval = setInterval(updateTimer, 250);

    updateTimer();

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, mode]);

  // ==========================================
  // TOTAL STUDY TIME
  // ==========================================

  const totalStudyHours = Math.floor(totalStudySeconds / 3600);

  const totalStudyMinutes = Math.floor((totalStudySeconds % 3600) / 60);

  // ==========================================
  // SWITCH TO TIMER
  // ==========================================

  const handleTimerMode = () => {
    setIsRunning(false);

    startTimeRef.current = null;
    studyStartTimeRef.current = null;

    setMode("timer");
    setSeconds(defaultSeconds);
  };

  // ==========================================
  // SWITCH TO STOPWATCH
  // ==========================================

  const handleStopwatchMode = () => {
    setIsRunning(false);

    startTimeRef.current = null;
    studyStartTimeRef.current = null;

    setMode("stopwatch");
    setSeconds(0);
  };

  // ==========================================
  // CONVERT SECONDS TO HH:MM:SS
  // ==========================================

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const remainingSeconds = seconds % 60;

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <div className="w-50 h-50 absolute top-8 lg:left-10 lg:top-20">
        <Image src="/images/pink.png" fill alt="blue-flower" />
      </div>

      <div className="w-50 h-50 absolute right-5 bottom-8">
        <Image src="/images/pink.png" fill alt="blue-flower" />
      </div>

      <section className="flex items-center justify-center h-screen bg-[radial-gradient(circle_at_12%_15%,rgba(241,185,196,0.35),transparent_25%),radial-gradient(circle_at_90%_22%,rgba(192,215,172,0.35),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(220,188,153,0.28),transparent_40%),linear-gradient(135deg,#fffaf7_0%,#f6eee7_55%,#eee4db_100%)]">
        <div className="border p-5 pb-8 rounded-2xl w-85 bg-purple-100 relative">
          <span className="top-sensor mt-1"></span>

          {/* =========================
              LCD DISPLAY
          ========================= */}

          <div className="border-4 mt-3 h-45 rounded-xl bg-[linear-gradient(135deg,#d0d5ce_0%,#b3bbb3_48%,#99a19a_100%)] relative">
            {/* Mode + Today's Study */}

            <div className="flex justify-between p-3">
              <p className="lcd-clock uppercase">{mode}</p>

              <p className="text-[12px]">
                Today's Total Study: {String(totalStudyHours).padStart(2, "0")}:
                {String(totalStudyMinutes).padStart(2, "0")}
              </p>
            </div>

            {/* Timer / Stopwatch */}

            <div className="lcd-digits" aria-live="polite">
              {String(hours).padStart(2, "0")}:
              {String(minutes).padStart(2, "0")}:
              {String(remainingSeconds).padStart(2, "0")}
            </div>

            {/* Current Date + Time */}

            <div className="lcd-status">
              <span className="mr-4">{currentDate}</span>

              {currentTime}
            </div>

            {/* H M S */}

            <div className="lcd-markers">
              <span>H</span>
              <span>M</span>
              <span>S</span>
            </div>
          </div>

          {/* =========================
              MODES
          ========================= */}

          <div className="flex justify-center gap-5 mt-5">
            <button
              type="button"
              className={`channel ${mode === "timer" ? "selected" : ""}`}
              onClick={handleTimerMode}
            >
              TIMER
            </button>

            <button
              type="button"
              className={`channel ${mode === "stopwatch" ? "selected" : ""}`}
              onClick={handleStopwatchMode}
            >
              STOPWATCH
            </button>
          </div>

          {/* =========================
              TIMER CONTROLS
          ========================= */}

          {mode === "timer" && (
            <div className="flex justify-center gap-8 mt-5">
              <AddSubButtons
                label="HOUR"
                onChange={(amount) => changeTimer(amount * 3600)}
              />

              <AddSubButtons
                label="MIN"
                onChange={(amount) => changeTimer(amount * 60)}
              />

              <AddSubButtons label="SEC" onChange={changeTimer} />
            </div>
          )}

          {/* =========================
              START / RESET
          ========================= */}

          <div className="flex justify-center gap-5 mt-6">
            <button type="button" className="buttons" onClick={buttonHandler}>
              {isRunning ? "Pause" : "Start"}
            </button>

            <button type="button" className="buttons" onClick={resetHandler}>
              Reset
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Trail;
