"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const Timer = () => {
  const [mode] = useState("stopwatch");

  // Today's total study time in seconds
  const [totalStudy, setTotalStudy] = useState(0);

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Stopwatch
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [isRunning, setIsRunning] = useState(false);

  // =========================
  // CURRENT DATE + TIME
  // =========================

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

    return () => clearInterval(interval);
  }, []);

  // =========================
  // LOAD TODAY'S STUDY
  // =========================

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-GB");

    const savedData = localStorage.getItem("totalStudy");

    if (savedData) {
      const parsedData = JSON.parse(savedData);

      if (parsedData.date === today) {
        setTotalStudy(parsedData.seconds);
      } else {
        // New day → reset total study
        localStorage.setItem(
          "totalStudy",
          JSON.stringify({
            date: today,
            seconds: 0,
          }),
        );

        setTotalStudy(0);
      }
    } else {
      localStorage.setItem(
        "totalStudy",
        JSON.stringify({
          date: today,
          seconds: 0,
        }),
      );
    }
  }, []);

  // =========================
  // CHECK FOR NEW DAY
  // =========================

  useEffect(() => {
    const checkNewDay = () => {
      const today = new Date().toLocaleDateString("en-GB");

      const savedData = localStorage.getItem("totalStudy");

      if (!savedData) return;

      const parsedData = JSON.parse(savedData);

      if (parsedData.date !== today) {
        const newData = {
          date: today,
          seconds: 0,
        };

        localStorage.setItem("totalStudy", JSON.stringify(newData));

        setTotalStudy(0);
      }
    };

    const interval = setInterval(checkNewDay, 60000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // STOPWATCH
  // =========================

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds === 59) {
          setMinutes((prevMinutes) => {
            if (prevMinutes === 59) {
              setHours((prevHours) => prevHours + 1);
              return 0;
            }

            return prevMinutes + 1;
          });

          return 0;
        }

        return prevSeconds + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // =========================
  // START
  // =========================

  const handleStart = () => {
    setIsRunning(true);
  };

  // =========================
  // PAUSE
  // =========================

  const handlePause = () => {
    setIsRunning(false);

    const sessionSeconds = hours * 60 * 60 + minutes * 60 + seconds;

    const today = new Date().toLocaleDateString("en-GB");

    const savedData = localStorage.getItem("totalStudy");

    let previousTotal = 0;

    if (savedData) {
      const parsedData = JSON.parse(savedData);

      if (parsedData.date === today) {
        previousTotal = parsedData.seconds;
      }
    }

    const newTotal = previousTotal + sessionSeconds;

    localStorage.setItem(
      "totalStudy",
      JSON.stringify({
        date: today,
        seconds: newTotal,
      }),
    );

    setTotalStudy(newTotal);
  };

  // =========================
  // RESET
  // =========================

  const handleReset = () => {
    setIsRunning(false);

    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  // =========================
  // FORMAT TOTAL STUDY
  // =========================

  const formatTotalStudy = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  };

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

          {/* LCD DISPLAY */}

          <div className="border-4 mt-3 h-45 rounded-xl bg-[linear-gradient(135deg,#d0d5ce_0%,#b3bbb3_48%,#99a19a_100%)] relative">
            {/* Mode + Today's Study */}

            <div className="flex justify-between p-3">
              <p className="lcd-clock uppercase">{mode}</p>

              {/* <p className="text-[12px]">
                Today's Total Study: {formatTotalStudy(totalStudy)}
              </p> */}
            </div>

            {/* Stopwatch */}

            <div className="lcd-digits" aria-live="polite">
              {String(hours).padStart(2, "0")}:
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
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

          {/* CONTROLS */}

          <div className="flex justify-center gap-5 mt-6">
            {/* START */}

            <button
              type="button"
              className="buttons"
              onClick={handleStart}
              disabled={isRunning}
            >
              Start
            </button>

            {/* PAUSE */}

            <button
              type="button"
              className="buttons"
              onClick={handlePause}
              disabled={!isRunning}
            >
              Pause
            </button>

            {/* RESET */}

            <button type="button" className="buttons" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Timer;
