"use client";
import React, { useEffect, useState } from "react";

type Mode = "timer" | "stopwatch";

const Trail = () => {
  const [mode, setMode] = useState<Mode>("timer");
  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toDateString();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {});
  return (
    <section className="flex items-center justify-center h-screen bg-[radial-gradient(circle_at_12%_15%,rgba(241,185,196,0.35),transparent_25%),radial-gradient(circle_at_90%_22%,rgba(192,215,172,0.35),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(220,188,153,0.28),transparent_40%),linear-gradient(135deg,#fffaf7_0%,#f6eee7_55%,#eee4db_100%)]">
      <div className="border p-5 rounded-2xl w-85 bg-purple-100">
        <div className="border-4 h-45 rounded-xl bg-[linear-gradient(135deg,#d0d5ce_0%,#b3bbb3_48%,#99a19a_100%)] relative">
          <p className="lcd-clock p-3 uppercase">{mode}</p>

          {/* timer */}
          <div className="lcd-digits" aria-live="polite">
            00:00:00
          </div>
          <div className="lcd-status">
            <span className="mr-4"> {currentDate}</span>
            {currentTime}
          </div>
          <div className="lcd-markers">
            <span>H</span>
            <span>M</span>
            <span>S</span>
          </div>
        </div>

        {/* modes */}
        <div className="flex justify-center gap-5 mt-5">
          <button
            className={`channel ${mode === "timer" ? "selected" : ""}`}
            onClick={() => setMode("timer")}
          >
            TIMER
          </button>

          <button
            className={`channel ${mode === "stopwatch" ? "selected" : ""}`}
            onClick={() => setMode("stopwatch")}
          >
            STOPWATCH
          </button>
        </div>

        <div className="flex justify-center gap-8 mt-5">
          <div className="text-center">
            <span className="control-label">HOUR</span>
            <button
              className={`small-button cursor-pointer mt-1`}
              onClick={() => setMode("stopwatch")}
            ></button>
          </div>

          <div className="text-center">
            <span className="control-label">MIN</span>
            <button
              className={`small-button cursor-pointer mt-1`}
              onClick={() => setMode("stopwatch")}
            ></button>
          </div>
          <div className="text-center">
            <span className="control-label">SEC</span>
            <button
              className={`small-button cursor-pointer mt-1`}
              onClick={() => setMode("stopwatch")}
            ></button>
          </div>
        </div>

        {/* buttons */}
        <div className="flex justify-center gap-5 mt-6">
          <button className={`buttons`} onClick={() => setMode("timer")}>
            Start
          </button>

          <button className={`buttons`} onClick={() => setMode("stopwatch")}>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
};

export default Trail;
