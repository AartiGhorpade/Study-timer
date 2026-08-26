"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

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

  const [seconds, setSeconds] = useState(1500);

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Today's total study time
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);

  const [alarm, setAlarm] = useState(false);

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

    // Update clock every minute
    const interval = setInterval(updateDateTime, 60000);

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
          // Same day → restore previous study time
          setTotalStudySeconds(data.totalSeconds);
        } else {
          // New day → reset study time
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
      // First time
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

    setIsRunning((prev) => !prev);
  };

  // ==========================================
  // RESET
  // ==========================================

  const resetHandler = () => {
    if (mode === "timer") {
      setSeconds(defaultSeconds);
    } else {
      setSeconds(0);
    }

    setIsRunning(false);
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

      // Save the new timer duration
      setDefaultSeconds(newValue);

      return newValue;
    });
  };

  // ==========================================
  // TIMER / STOPWATCH
  // ==========================================

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      // ------------------------------
      // Update timer / stopwatch
      // ------------------------------

      setSeconds((prev) => {
        if (mode === "timer") {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }

          return prev - 1;
        }

        // Stopwatch
        return prev + 1;
      });

      // ------------------------------
      // Update today's study time
      // ------------------------------

      setTotalStudySeconds((prev) => {
        const newTotal = prev + 1;

        const today = getToday();

        const studyData = {
          date: today,
          totalSeconds: newTotal,
        };

        localStorage.setItem("studyData", JSON.stringify(studyData));

        return newTotal;
      });
    }, 1000);

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
    setMode("timer");
    setSeconds(defaultSeconds);
    setIsRunning(false);
  };

  // ==========================================
  // SWITCH TO STOPWATCH
  // ==========================================

  const handleStopwatchMode = () => {
    setMode("stopwatch");
    setSeconds(0);
    setIsRunning(false);
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
