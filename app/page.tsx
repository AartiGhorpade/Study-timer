"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const Timer = () => {
  const [mode, setMode] = useState("timer");
  const [totalStudy, setTotalStudy] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

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
  }, []);

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

              <p className="text-[12px]">Today's Total Study: {totalStudy}</p>
            </div>

            {/* Timer / Stopwatch */}
            <div className="lcd-digits" aria-live="polite">
              00:25:00
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
              onClick={() => setMode("timer")}
            >
              TIMER
            </button>

            <button
              type="button"
              className={`channel ${mode === "stopwatch" ? "selected" : ""}`}
              onClick={() => setMode("stopwatch")}
            >
              STOPWATCH
            </button>
          </div>

          {/* =========================
              TIMER CONTROLS
          ========================= */}

          {mode === "timer" && (
            <div className="flex justify-center gap-8 mt-5">
              <AddSubButtons label="HOUR" onChange={() => {}} />
              <AddSubButtons label="MIN" onChange={() => {}} />
              <AddSubButtons label="SEC" onChange={() => {}} />
            </div>
          )}

          {/* =========================
              START / RESET
          ========================= */}

          <div className="flex justify-center gap-5 mt-6">
            <button type="button" className="buttons">
              Start
            </button>

            <button type="button" className="buttons">
              Reset
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Timer;

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
