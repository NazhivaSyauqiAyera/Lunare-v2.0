import {
  FaMoon,
  FaCalendarAlt,
  FaHeart,
  FaSmile,
} from "react-icons/fa";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import usePeriods from "../hooks/usePeriods";
import StatsCard from "../components/StatsCard";

function Dashboard() {

  const navigate = useNavigate();

  const { periods, nextPeriod, addPeriod } = usePeriods();

  const [date, setDate] = useState(new Date());

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mood, setMood] = useState("");

  const handleLogout = () => {

    localStorage.removeItem("token");

    alert("Logged out successfully 🌙");

    navigate("/");

  };

  const handleSave = async () => {

    const success = await addPeriod({
      start_date: startDate,
      end_date: endDate,
      mood: mood,
    });

    if (success) {

      alert("Period saved successfully 🌙");

      setStartDate("");
      setEndDate("");
      setMood("");

    } else {

      alert("Failed to save period");

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 flex justify-center p-4">

      <div className="w-full max-w-7xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex min-h-[95vh]">

        {/* SIDEBAR */}

        <div className="hidden lg:flex w-72 bg-gradient-to-b from-pink-200 to-purple-200 p-8 flex-col justify-between">

          <div>

            <div className="flex items-center gap-3 mb-12">

              <div className="bg-white p-4 rounded-full shadow-md">
                <FaMoon className="text-pink-400 text-2xl" />
              </div>

              <div>

                <h1 className="text-3xl font-bold text-white">
                  Lunare
                </h1>

                <p className="text-white/80 text-sm">
                  Your wellness companion
                </p>

              </div>

            </div>

            <div className="space-y-5">

              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 text-white font-semibold">

                <FaCalendarAlt />
                <span>Dashboard</span>

              </div>

              <div className="text-white flex items-center gap-3 p-4">

                <FaHeart />
                <span>Cycle Tracker</span>

              </div>

              <div className="text-white flex items-center gap-3 p-4">

                <FaSmile />
                <span>Mood Journal</span>

              </div>

            </div>

          </div>

          <button
            onClick={handleLogout}
            className="bg-white text-pink-400 font-semibold py-4 rounded-2xl hover:scale-105 transition"
          >
            Logout
          </button>

        </div>

        {/* MAIN */}

        <div className="flex-1 overflow-y-auto p-6 md:p-10">

          {/* HEADER */}

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">

            <div>

              <p className="text-gray-500 mb-1">
                Welcome back 🌸
              </p>

              <h1 className="text-4xl font-bold">
                Your Cycle Journey
              </h1>

            </div>

            <div className="bg-pink-100 text-pink-500 px-5 py-3 rounded-2xl font-semibold w-fit">
              Day 12
            </div>

          </div>

          {/* CALENDAR */}

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-[32px] shadow-md mb-8">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

              <div>

                <p className="text-gray-500">
                  Current Phase
                </p>

                <h2 className="text-3xl font-bold">
                  Follicular 🌸
                </h2>

              </div>

              <div className="bg-pink-200 text-pink-700 px-4 py-2 rounded-2xl font-semibold w-fit">
                Low Risk
              </div>

            </div>

            <Calendar
              onChange={setDate}
              value={date}
              className="border-none w-full"
            />

          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            <StatsCard
              title="Next Period"
              value={nextPeriod}
              color="bg-pink-50"
            />

            <StatsCard
              title="Latest Mood"
              value={periods[0]?.mood || "No Mood"}
              color="bg-purple-50"
            />

            <StatsCard
              title="Latest Period"
              value={
                periods[0]?.start_date
                  ? dayjs(periods[0].start_date).format("DD MMM YYYY")
                  : "No Data"
              }
              color="bg-rose-50"
            />

          </div>

          {/* ARTICLES */}

          <div className="mb-8">

            <h2 className="text-2xl font-bold mb-5">
              Articles For You 📖
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <div className="bg-gradient-to-r from-pink-200 to-rose-200 p-6 rounded-3xl text-white">

                <h3 className="text-2xl font-bold mb-3">
                  PMS Self Care 🌷
                </h3>

                <p>
                  Learn how to reduce cramps and improve your mood naturally.
                </p>

              </div>

              <div className="bg-gradient-to-r from-purple-200 to-pink-200 p-6 rounded-3xl text-white">

                <h3 className="text-2xl font-bold mb-3">
                  Hormonal Health 🌙
                </h3>

                <p>
                  Discover healthy habits to balance hormones and sleep better.
                </p>

              </div>

            </div>

          </div>

          {/* FORM */}

          <div className="bg-white border border-pink-100 p-8 rounded-[32px] shadow-sm mb-8">

            <h2 className="text-2xl font-bold mb-6">
              Add New Period 🩸
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-4 rounded-2xl border border-pink-100 outline-none focus:border-pink-300"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-4 rounded-2xl border border-pink-100 outline-none focus:border-pink-300"
              />

              <input
                type="text"
                placeholder="Mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="p-4 rounded-2xl border border-pink-100 outline-none focus:border-pink-300 md:col-span-2"
              />

            </div>

            <button
              onClick={handleSave}
              className="mt-6 bg-gradient-to-r from-pink-300 to-purple-300 hover:scale-105 transition text-white px-8 py-4 rounded-2xl font-semibold"
            >
              Save Period
            </button>

          </div>

          {/* HISTORY */}

          <div className="bg-white border border-pink-100 p-8 rounded-[32px] shadow-sm">

            <h2 className="text-2xl font-bold mb-6">
              Period History 📖
            </h2>

            <div className="space-y-4">

              {periods.map((item) => (

                <div
                  key={item.id}
                  className="bg-pink-50 rounded-2xl p-5 flex justify-between items-center"
                >

                  <div>

                    <p className="font-semibold">
                      {dayjs(item.start_date).format("DD MMM YYYY")} →{" "}
                      {dayjs(item.end_date).format("DD MMM YYYY")}
                    </p>

                    <p className="text-gray-500">
                      Mood: {item.mood}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;