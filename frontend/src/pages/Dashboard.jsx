import {
  FaMoon,
  FaCalendarAlt,
  FaHeart,
  FaSmile,
  FaTrash,
  FaPen,
  FaTimes,
  FaCheck,
  FaSignOutAlt,
  FaSeedling,
  FaStar,
  FaFilePdf,
  FaDownload,
} from "react-icons/fa";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import usePeriods from "../hooks/usePeriods";
import useMoods from "../hooks/useMoods";
import StatsCard from "../components/StatsCard";
import AlertModal from "../components/AlertModal";
import API from "../services/api";
import jsPDF from "jspdf";

function Dashboard() {
  const navigate = useNavigate();

  const {
    periods,
    prediction,
    loading,
    currentCycleDay,
    currentPhase,
    phaseInfo,
    avgCycleLength,
    avgDuration,
    nextPeriodDate,
    addPeriod,
    deletePeriod,
    updatePeriod,
    isPeriodDay,
    isFertileDay,
    isOvulationDay,
    isPredictedDay,
    futurePredictions,
  } = usePeriods();

  const { moods, todayMood, addMood, getMoodEmoji, MOOD_TYPES } = useMoods();

  const [date, setDate] = useState(new Date());

  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formMood, setFormMood] = useState("");
  const [formError, setFormError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editMood, setEditMood] = useState("");

  // Active sidebar section
  const [activeSection, setActiveSection] = useState("dashboard");

  // Mood note state
  const [moodNote, setMoodNote] = useState("");

  // Profile and PDF State
  const [profile, setProfile] = useState(null);

  // Custom Alert/Confirm Modal State
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: "info", // "info", "confirm", "error"
    title: "",
    message: "",
    onConfirm: null,
  });

  const showAlert = (title, message, type = "info") => {
    setAlertModal({ isOpen: true, type, title, message, onConfirm: null });
  };

  const showConfirm = (title, message, onConfirm) => {
    setAlertModal({ isOpen: true, type: "confirm", title, message, onConfirm });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, type: "info", title: "", message: "", onConfirm: null });
  };
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSave = async () => {
    setFormError("");

    if (!startDate || !endDate) {
      setFormError("Please fill in both start and end dates");
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate))) {
      setFormError("End date must be after start date");
      return;
    }

    const success = await addPeriod({
      start_date: startDate,
      end_date: endDate,
      mood: formMood || null,
    });

    if (success) {
      setStartDate("");
      setEndDate("");
      setFormMood("");
      setFormError("");
    } else {
      setFormError("Failed to save period. Please try again.");
    }
  };

  const handleDelete = (id) => {
    showConfirm(
      "Hapus Data Periode",
      "Apakah Anda yakin ingin menghapus data periode ini? Tindakan ini tidak dapat dibatalkan.",
      async () => {
        await deletePeriod(id);
        closeAlert();
      }
    );
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditStart(item.start_date);
    setEditEnd(item.end_date);
    setEditMood(item.mood || "");
  };

  const handleEditSave = async () => {
    if (dayjs(editEnd).isBefore(dayjs(editStart))) {
      return;
    }

    const success = await updatePeriod(editingId, {
      start_date: editStart,
      end_date: editEnd,
      mood: editMood || null,
    });

    if (success) {
      setEditingId(null);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleMoodSelect = async (moodType) => {
    const today = new Date().toISOString().split("T")[0];
    await addMood({
      date: today,
      mood_type: moodType,
      note: moodNote || null,
    });
    setMoodNote("");
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (needed) => {
        if (y + needed > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      // Helper: draw a small colored circle as a bullet/icon
      const drawIcon = (x, cy, r, g, b, radius = 2.5) => {
        pdf.setFillColor(r, g, b);
        pdf.circle(x, cy, radius, "F");
      };

      // ── HEADER ──
      pdf.setFillColor(253, 242, 248);
      pdf.roundedRect(margin, y, contentWidth, 30, 4, 4, "F");

      // Decorative moon circle
      drawIcon(margin + 14, y + 12, 181, 126, 220, 5);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.text("L", margin + 12, y + 14);

      pdf.setFontSize(20);
      pdf.setTextColor(59, 47, 74);
      pdf.text("Lunare", margin + 24, y + 13);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(120, 100, 140);
      pdf.text("Wellness & Cycle Companion", margin + 24, y + 20);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(107, 33, 168);
      pdf.text("Laporan Siklus Kesehatan", pageWidth - margin - 8, y + 12, { align: "right" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(140, 130, 150);
      pdf.text(`Dicetak: ${dayjs().format("DD MMMM YYYY, HH:mm")}`, pageWidth - margin - 8, y + 19, { align: "right" });
      y += 38;

      // ── USER INFO ──
      if (profile) {
        checkPageBreak(22);
        pdf.setFillColor(252, 231, 243);
        pdf.roundedRect(margin, y, contentWidth, 18, 3, 3, "F");
        pdf.setFontSize(8);
        pdf.setTextColor(140, 130, 150);
        pdf.setFont("helvetica", "bold");
        pdf.text("NAMA PENGGUNA", margin + 6, y + 7);
        pdf.text("EMAIL", margin + contentWidth / 2 + 6, y + 7);
        pdf.setFontSize(11);
        pdf.setTextColor(59, 47, 74);
        pdf.setFont("helvetica", "normal");
        pdf.text(profile.username || "-", margin + 6, y + 14);
        pdf.text(profile.email || "-", margin + contentWidth / 2 + 6, y + 14);
        y += 26;
      }

      // ── SECTION: RINGKASAN SIKLUS ──
      checkPageBreak(40);
      pdf.setDrawColor(243, 232, 255);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;
      drawIcon(margin + 3, y + 2, 244, 114, 182);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 47, 74);
      pdf.text("Ringkasan Siklus", margin + 9, y + 4);
      y += 14;

      const statBoxWidth = (contentWidth - 10) / 3;
      const stats = [
        { label: "Rata-rata Siklus", value: `${avgCycleLength} Hari` },
        { label: "Rata-rata Menstruasi", value: `${prediction?.has_data ? prediction.avg_period_duration : avgDuration} Hari` },
        { label: "Prediksi Berikutnya", value: nextPeriodDate },
      ];

      stats.forEach((stat, i) => {
        const x = margin + i * (statBoxWidth + 5);
        pdf.setFillColor(250, 248, 246);
        pdf.roundedRect(x, y, statBoxWidth, 22, 3, 3, "F");
        pdf.setDrawColor(243, 232, 255);
        pdf.roundedRect(x, y, statBoxWidth, 22, 3, 3, "S");
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(140, 130, 150);
        pdf.text(stat.label.toUpperCase(), x + 5, y + 8);
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(59, 47, 74);
        pdf.text(stat.value, x + 5, y + 17);
      });
      y += 32;

      // ── SECTION: RIWAYAT SIKLUS ──
      checkPageBreak(30);
      pdf.setDrawColor(243, 232, 255);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;
      drawIcon(margin + 3, y + 2, 167, 139, 250);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 47, 74);
      pdf.text("Riwayat Siklus", margin + 9, y + 4);
      y += 12;

      if (periods.length === 0) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(160, 160, 160);
        pdf.text("Belum ada riwayat menstruasi yang tercatat.", margin, y + 5);
        y += 14;
      } else {
        // Table header
        const colWidths = [12, contentWidth * 0.25, contentWidth * 0.25, contentWidth * 0.18, contentWidth * 0.32 - 12];
        const headers = ["No.", "Tanggal Mulai", "Tanggal Selesai", "Durasi", "Suasana Hati"];

        checkPageBreak(12);
        pdf.setFillColor(253, 242, 248);
        pdf.rect(margin, y, contentWidth, 10, "F");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(181, 126, 220);

        let colX = margin;
        headers.forEach((h, i) => {
          pdf.text(h, colX + 3, y + 7);
          colX += colWidths[i];
        });
        y += 10;

        // Table rows
        const displayPeriods = periods.slice(0, 10);
        displayPeriods.forEach((p, idx) => {
          checkPageBreak(10);
          if (idx % 2 === 1) {
            pdf.setFillColor(250, 248, 246);
            pdf.rect(margin, y, contentWidth, 9, "F");
          }
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(80, 75, 90);

          colX = margin;
          const duration = dayjs(p.end_date).diff(dayjs(p.start_date), "day") + 1;
          const rowData = [
            `${idx + 1}`,
            dayjs(p.start_date).format("DD MMM YYYY"),
            dayjs(p.end_date).format("DD MMM YYYY"),
            `${duration} hari`,
            p.mood ? p.mood : "-",
          ];

          rowData.forEach((val, i) => {
            pdf.text(val, colX + 3, y + 6);
            colX += colWidths[i];
          });
          y += 9;
        });
        y += 8;
      }

      // ── SECTION: MOOD ANALYSIS ──
      checkPageBreak(30);
      pdf.setDrawColor(243, 232, 255);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;
      drawIcon(margin + 3, y + 2, 139, 92, 246);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 47, 74);
      pdf.text("Analisis Suasana Hati", margin + 9, y + 4);
      y += 14;

      const moodCounts = {};
      let totalMoodsCount = 0;
      moods.forEach((m) => {
        moodCounts[m.mood_type] = (moodCounts[m.mood_type] || 0) + 1;
        totalMoodsCount++;
      });

      if (totalMoodsCount === 0) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(160, 160, 160);
        pdf.text("Belum ada jurnal suasana hati.", margin, y + 5);
        y += 14;
      } else {
        // Mood bars
        Object.entries(moodCounts).forEach(([type, count]) => {
          checkPageBreak(12);
          const percentage = Math.round((count / totalMoodsCount) * 100);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(80, 75, 90);
          pdf.text(type, margin + 4, y + 5);

          // Bar background
          const barX = margin + 40;
          const barWidth = contentWidth - 65;
          pdf.setFillColor(243, 232, 255);
          pdf.roundedRect(barX, y + 1, barWidth, 5, 2, 2, "F");

          // Bar fill (gradient effect with pink)
          const fillWidth = Math.max(barWidth * (percentage / 100), 1);
          pdf.setFillColor(244, 114, 182);
          pdf.roundedRect(barX, y + 1, fillWidth, 5, 2, 2, "F");

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${percentage}%`, pageWidth - margin - 3, y + 5, { align: "right" });
          y += 10;
        });
        y += 6;
      }

      // ── SECTION: RECENT NOTES ──
      const recentNotes = moods.filter(m => m.note).slice(0, 3);
      if (recentNotes.length > 0) {
        checkPageBreak(25);
        drawIcon(margin + 3, y + 2, 196, 181, 253);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(107, 33, 168);
        pdf.text("Catatan Jurnal Terbaru", margin + 9, y + 4);
        y += 12;

        recentNotes.forEach((m) => {
          checkPageBreak(16);
          pdf.setFillColor(250, 248, 246);
          pdf.roundedRect(margin, y, contentWidth, 14, 3, 3, "F");
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(140, 130, 150);
          pdf.text(`${m.mood_type}  --  ${dayjs(m.date).format("DD MMM YYYY")}`, margin + 5, y + 5);
          pdf.setFont("helvetica", "italic");
          pdf.setTextColor(100, 90, 110);
          const noteText = pdf.splitTextToSize(`"${m.note}"`, contentWidth - 12);
          pdf.text(noteText[0], margin + 5, y + 11);
          y += 16;
        });
        y += 4;
      }

      // ── SECTION: PREDIKSI 1 TAHUN KEDEPAN ──
      if (futurePredictions && futurePredictions.length > 0) {
        checkPageBreak(40);
        pdf.setDrawColor(243, 232, 255);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 8;
        drawIcon(margin + 3, y + 2, 52, 211, 153);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(59, 47, 74);
        pdf.text("Prediksi 1 Tahun (12 Siklus)", margin + 9, y + 4);
        y += 12;

        pdf.setFillColor(253, 242, 248);
        pdf.rect(margin, y, contentWidth, 10, "F");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(181, 126, 220);
        
        // 3 columns for 12 months
        const colW = contentWidth / 3;
        pdf.text("Siklus 1 - 4", margin + 5, y + 7);
        pdf.text("Siklus 5 - 8", margin + colW + 5, y + 7);
        pdf.text("Siklus 9 - 12", margin + colW * 2 + 5, y + 7);
        y += 10;

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(80, 75, 90);

        for (let i = 0; i < 4; i++) {
          checkPageBreak(8);
          if (i % 2 === 1) {
            pdf.setFillColor(250, 248, 246);
            pdf.rect(margin, y, contentWidth, 8, "F");
          }
          for (let j = 0; j < 3; j++) {
            const idx = j * 4 + i;
            if (idx < futurePredictions.length) {
              const d = dayjs(futurePredictions[idx]).format("DD MMM YYYY");
              pdf.setFont("helvetica", "bold");
              pdf.text(`${idx + 1}.`, margin + j * colW + 5, y + 5.5);
              pdf.setFont("helvetica", "normal");
              pdf.text(d, margin + j * colW + 15, y + 5.5);
            }
          }
          y += 8;
        }
        y += 8;
      }

      // ── SECTION: TIPS ──
      checkPageBreak(30);
      pdf.setDrawColor(243, 232, 255);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;
      pdf.setFillColor(253, 242, 248);
      pdf.roundedRect(margin, y, contentWidth, 24, 4, 4, "F");
      drawIcon(margin + 9, y + 6, 251, 191, 36, 3);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 47, 74);
      pdf.text("Tips Kesehatan Lunare", margin + 15, y + 8);

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 90, 110);
      let tipText;
      if (prediction?.has_data) {
        tipText = prediction.avg_cycle_length < 21 || prediction.avg_cycle_length > 35
          ? "Siklus menstruasi Anda terdeteksi di luar rentang rata-rata umum (21-35 hari). Konsultasikan dengan penyedia layanan kesehatan."
          : "Siklus menstruasi Anda terpantau berada di rentang normal (21-35 hari). Pertahankan gaya hidup sehat Anda.";
      } else {
        tipText = "Catat terus data menstruasi Anda untuk mendapatkan analisis siklus dan prediksi yang akurat dari Lunare.";
      }
      const tipLines = pdf.splitTextToSize(tipText, contentWidth - 14);
      pdf.text(tipLines, margin + 6, y + 16);

      // ── FOOTER ──
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(180, 175, 190);
        pdf.text(
          `Lunare  --  Halaman ${i} dari ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      pdf.save(`Laporan_Kesehatan_Lunare_${dayjs().format("YYYY-MM-DD")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showAlert("Gagal Mengunduh PDF", "Terjadi kesalahan saat mengunduh PDF. Silakan coba lagi.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Calendar tile class for highlighting
  const tileClassName = ({ date: tileDate, view }) => {
    if (view !== "month") return null;

    const dateStr = dayjs(tileDate).format("YYYY-MM-DD");
    const classes = [];

    if (isPeriodDay(dateStr)) {
      classes.push("period-day");
    }
    if (isPredictedDay(dateStr)) {
      classes.push("predicted-day");
    }
    if (isFertileDay(dateStr)) {
      classes.push("fertile-day");
    }
    if (isOvulationDay(dateStr)) {
      classes.push("ovulation-day");
    }

    return classes.length > 0 ? classes.join(" ") : null;
  };

  // Phase badge colors
  const phaseColors = {
    Menstrual: "bg-red-100 text-red-600",
    Follicular: "bg-pink-100 text-pink-600",
    Ovulation: "bg-purple-100 text-purple-600",
    Luteal: "bg-indigo-100 text-indigo-600",
  };

  const phaseRiskLabel = {
    Menstrual: "Period",
    Follicular: "Low Fertility",
    Ovulation: "High Fertility",
    Luteal: "Low Fertility",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-pink-300 border-t-purple-400 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading your cycle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#FAF8F6] flex overflow-hidden">

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

            <div className="space-y-3">

              <button
                onClick={() => setActiveSection("dashboard")}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 font-semibold transition-all duration-200 ${
                  activeSection === "dashboard"
                    ? "bg-white/40 backdrop-blur-md text-white shadow-sm"
                    : "text-white/80 hover:bg-white/20"
                }`}
              >
                <FaCalendarAlt />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveSection("tracker")}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 font-semibold transition-all duration-200 ${
                  activeSection === "tracker"
                    ? "bg-white/40 backdrop-blur-md text-white shadow-sm"
                    : "text-white/80 hover:bg-white/20"
                }`}
              >
                <FaHeart />
                <span>Cycle Tracker</span>
              </button>

               <button
                onClick={() => setActiveSection("mood")}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 font-semibold transition-all duration-200 ${
                  activeSection === "mood"
                    ? "bg-white/40 backdrop-blur-md text-white shadow-sm"
                    : "text-white/80 hover:bg-white/20"
                }`}
              >
                <FaSmile />
                <span>Mood Journal</span>
              </button>

              <button
                onClick={() => setActiveSection("report")}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 font-semibold transition-all duration-200 ${
                  activeSection === "report"
                    ? "bg-white/40 backdrop-blur-md text-white shadow-sm"
                    : "text-white/80 hover:bg-white/20"
                }`}
              >
                <FaFilePdf />
                <span>Laporan Kesehatan</span>
              </button>

            </div>

          </div>

          <button
            onClick={handleLogout}
            className="bg-white text-pink-400 font-semibold py-4 rounded-2xl hover:scale-105 transition flex items-center justify-center gap-2"
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>

        {/* MAIN CONTENT */}

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto w-full">

          {/* MOBILE NAV */}
          <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { key: "dashboard", icon: <FaCalendarAlt />, label: "Dashboard" },
              { key: "tracker", icon: <FaHeart />, label: "Tracker" },
              { key: "mood", icon: <FaSmile />, label: "Mood" },
              { key: "report", icon: <FaFilePdf />, label: "Laporan" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  activeSection === item.key
                    ? "bg-gradient-to-r from-pink-300 to-purple-300 text-white"
                    : "bg-pink-50 text-pink-500"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap bg-red-50 text-red-400 transition hover:bg-red-100 ml-auto"
            >
              <FaSignOutAlt />
            </button>
          </div>

          {/* ===================== DASHBOARD SECTION ===================== */}

          {activeSection === "dashboard" && (
            <>
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

                {currentCycleDay && (
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 px-6 py-3 rounded-2xl font-bold text-lg w-fit shadow-sm">
                    Day {currentCycleDay}
                  </div>
                )}

              </div>

              {/* PHASE CARD */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-[32px] shadow-md mb-8">

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

                  <div>
                    <p className="text-gray-500 mb-1">
                      Current Phase
                    </p>

                    <h2 className="text-3xl font-bold">
                      {currentPhase || "Unknown"} {phaseInfo.emoji}
                    </h2>

                    <p className="text-gray-400 mt-1 text-sm">
                      {phaseInfo.description}
                    </p>
                  </div>

                  {currentPhase && (
                    <div className={`px-5 py-2.5 rounded-2xl font-semibold w-fit ${phaseColors[currentPhase] || "bg-gray-100 text-gray-600"}`}>
                      {phaseRiskLabel[currentPhase] || "—"}
                    </div>
                  )}

                </div>

                {/* CALENDAR */}
                <Calendar
                  onChange={setDate}
                  value={date}
                  className="border-none w-full"
                  tileClassName={tileClassName}
                />

                {/* LEGEND */}
                <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-pink-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-3 h-3 rounded-full bg-pink-400 inline-block"></span>
                    Period
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-3 h-3 rounded-full bg-green-300 inline-block"></span>
                    Fertile Window
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-3 h-3 rounded-full bg-blue-300 inline-block"></span>
                    Ovulation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-3 h-3 rounded-full border-2 border-dashed border-purple-400 inline-block"></span>
                    Predicted
                  </div>
                </div>

              </div>

              {/* STATS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

                <StatsCard
                  title="Next Period"
                  value={nextPeriodDate}
                  color="bg-pink-50"
                  icon={<FaCalendarAlt className="text-pink-400" />}
                />

                <StatsCard
                  title="Cycle Length"
                  value={`${avgCycleLength} days`}
                  color="bg-purple-50"
                  icon={<FaHeart className="text-purple-400" />}
                />

                <StatsCard
                  title="Today's Mood"
                  value={todayMood ? `${getMoodEmoji(todayMood.mood_type)} ${todayMood.mood_type}` : "Not logged"}
                  color="bg-rose-50"
                  icon={<FaSmile className="text-rose-400" />}
                />

              </div>

              {/* ARTICLES */}
              <div className="mb-8">

                <h2 className="text-2xl font-bold mb-5">
                  Insights For You 💡
                </h2>

                <div className="grid md:grid-cols-2 gap-5">

                  <div className="bg-gradient-to-r from-pink-200 to-rose-200 p-6 rounded-3xl text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-6xl opacity-20">🌷</div>
                    <h3 className="text-2xl font-bold mb-3">
                      PMS Self Care
                    </h3>
                    <p className="text-white/90">
                      Learn how to reduce cramps and improve your mood naturally.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-200 to-pink-200 p-6 rounded-3xl text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-6xl opacity-20">🌙</div>
                    <h3 className="text-2xl font-bold mb-3">
                      Hormonal Health
                    </h3>
                    <p className="text-white/90">
                      Discover healthy habits to balance hormones and sleep better.
                    </p>
                  </div>

                </div>

              </div>
            </>
          )}

          {/* ===================== CYCLE TRACKER SECTION ===================== */}

          {activeSection === "tracker" && (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Cycle Tracker</h1>
                <p className="text-gray-500">Log and manage your period data</p>
              </div>

              {/* ADD PERIOD FORM */}
              <div className="bg-white border border-pink-100 p-8 rounded-[32px] shadow-sm mb-8">

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FaSeedling className="text-pink-400" />
                  Add New Period
                </h2>

                {formError && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-5 text-sm font-medium">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-pink-100 outline-none focus:border-pink-300 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-pink-100 outline-none focus:border-pink-300 transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Mood (optional)</label>
                    <select
                      value={formMood}
                      onChange={(e) => setFormMood(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-pink-100 outline-none focus:border-pink-300 bg-white transition"
                    >
                      <option value="">Select mood...</option>
                      <option value="happy">😊 Happy</option>
                      <option value="sad">😢 Sad</option>
                      <option value="angry">😤 Angry</option>
                      <option value="anxious">😰 Anxious</option>
                      <option value="tired">😴 Tired</option>
                      <option value="neutral">😐 Neutral</option>
                    </select>
                  </div>

                </div>

                <button
                  onClick={handleSave}
                  className="mt-6 bg-gradient-to-r from-pink-300 to-purple-300 hover:from-pink-400 hover:to-purple-400 hover:scale-[1.02] transition-all text-white px-8 py-4 rounded-2xl font-semibold shadow-md"
                >
                  Save Period
                </button>

              </div>

              {/* PERIOD HISTORY */}
              <div className="bg-white border border-pink-100 p-8 rounded-[32px] shadow-sm">

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FaStar className="text-purple-400" />
                  Period History
                </h2>

                {periods.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FaCalendarAlt className="text-5xl mx-auto mb-4 text-pink-200" />
                    <p className="text-lg font-medium">No periods logged yet</p>
                    <p className="text-sm mt-1">Start tracking by adding your first period above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {periods.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 flex justify-between items-center transition hover:shadow-sm"
                      >
                        {editingId === item.id ? (
                          /* EDIT MODE */
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input
                                type="date"
                                value={editStart}
                                onChange={(e) => setEditStart(e.target.value)}
                                className="p-3 rounded-xl border border-pink-200 outline-none focus:border-pink-400 text-sm"
                              />
                              <input
                                type="date"
                                value={editEnd}
                                onChange={(e) => setEditEnd(e.target.value)}
                                className="p-3 rounded-xl border border-pink-200 outline-none focus:border-pink-400 text-sm"
                              />
                              <select
                                value={editMood}
                                onChange={(e) => setEditMood(e.target.value)}
                                className="p-3 rounded-xl border border-pink-200 outline-none focus:border-pink-400 bg-white text-sm"
                              >
                                <option value="">No mood</option>
                                <option value="happy">😊 Happy</option>
                                <option value="sad">😢 Sad</option>
                                <option value="angry">😤 Angry</option>
                                <option value="anxious">😰 Anxious</option>
                                <option value="tired">😴 Tired</option>
                                <option value="neutral">😐 Neutral</option>
                              </select>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={handleEditSave}
                                className="bg-green-100 text-green-600 p-2 rounded-xl hover:bg-green-200 transition"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-gray-200 transition"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* VIEW MODE */
                          <>
                            <div>
                              <p className="font-semibold text-gray-700">
                                {dayjs(item.start_date).format("DD MMM YYYY")} →{" "}
                                {dayjs(item.end_date).format("DD MMM YYYY")}
                              </p>
                              <p className="text-gray-400 text-sm mt-1">
                                {(dayjs(item.end_date).diff(dayjs(item.start_date), "day") + 1)} days
                                {item.mood && ` · Mood: ${item.mood}`}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditStart(item)}
                                className="bg-white text-purple-400 p-2.5 rounded-xl hover:bg-purple-50 transition shadow-sm"
                                title="Edit"
                              >
                                <FaPen className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="bg-white text-red-400 p-2.5 rounded-xl hover:bg-red-50 transition shadow-sm"
                                title="Delete"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </>
          )}

          {/* ===================== MOOD JOURNAL SECTION ===================== */}

          {activeSection === "mood" && (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Mood Journal</h1>
                <p className="text-gray-500">How are you feeling today?</p>
              </div>

              {/* TODAY'S MOOD PICKER */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-[32px] shadow-md mb-8">

                <h2 className="text-xl font-bold mb-6">
                  {todayMood
                    ? `Today you feel ${getMoodEmoji(todayMood.mood_type)} ${todayMood.mood_type}`
                    : "Select your mood for today"
                  }
                </h2>

                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-5">
                  {MOOD_TYPES.map((m) => (
                    <button
                      key={m.type}
                      onClick={() => handleMoodSelect(m.type)}
                      className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ${
                        todayMood?.mood_type === m.type
                          ? "bg-gradient-to-b from-pink-200 to-purple-200 shadow-md scale-105"
                          : "bg-white hover:bg-pink-50 hover:scale-105 shadow-sm"
                      }`}
                    >
                      <span className="text-2xl mb-1">{m.emoji}</span>
                      <span className="text-xs text-gray-500 font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Add a note about how you feel... (optional)"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-pink-100 outline-none focus:border-pink-300 bg-white transition"
                />

              </div>

              {/* CYCLE PHASE INSIGHT */}
              {currentPhase && (
                <div className="bg-white border border-pink-100 p-6 rounded-[32px] shadow-sm mb-8">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <FaHeart className="text-pink-400" />
                    Phase Insight
                  </h3>
                  <div className={`inline-block px-4 py-2 rounded-2xl font-medium text-sm mb-3 ${phaseColors[currentPhase]}`}>
                    {currentPhase} Phase {phaseInfo.emoji}
                  </div>
                  <p className="text-gray-500 text-sm">{phaseInfo.description}</p>

                  {currentPhase === "Menstrual" && (
                    <div className="mt-4 bg-red-50 p-4 rounded-2xl text-sm text-red-600">
                      💡 <strong>Tip:</strong> Warm compresses, gentle stretches, and staying hydrated can help with cramps.
                    </div>
                  )}
                  {currentPhase === "Follicular" && (
                    <div className="mt-4 bg-pink-50 p-4 rounded-2xl text-sm text-pink-600">
                      💡 <strong>Tip:</strong> Your energy is rising! Great time to start new projects and try new workouts.
                    </div>
                  )}
                  {currentPhase === "Ovulation" && (
                    <div className="mt-4 bg-purple-50 p-4 rounded-2xl text-sm text-purple-600">
                      💡 <strong>Tip:</strong> You're at peak energy. Social activities and high-intensity workouts feel great now.
                    </div>
                  )}
                  {currentPhase === "Luteal" && (
                    <div className="mt-4 bg-indigo-50 p-4 rounded-2xl text-sm text-indigo-600">
                      💡 <strong>Tip:</strong> PMS may start. Focus on comfort foods rich in magnesium and gentle movement.
                    </div>
                  )}
                </div>
              )}

            </>
          )}

          {/* ===================== HEALTH REPORT SECTION ===================== */}

          {activeSection === "report" && (
            <>
              <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Laporan Kesehatan</h1>
                  <p className="text-gray-500">Unduh rangkuman siklus dan suasana hati Anda</p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="bg-gradient-to-r from-pink-300 to-purple-300 hover:from-pink-400 hover:to-purple-400 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md self-start md:self-auto cursor-pointer"
                >
                  <FaDownload />
                  {isGeneratingPdf ? "Membuat PDF..." : "Unduh Laporan (PDF)"}
                </button>
              </div>

              {/* REPORT PREVIEW AND CONTAINER FOR PDF */}
              <div className="bg-white border border-pink-100 rounded-[32px] shadow-sm overflow-hidden p-6 md:p-10 mb-8 max-w-4xl mx-auto">
                <div id="pdf-report-content" className="pdf-container p-6 rounded-2xl">
                  {/* Header */}
                  <div className="pdf-header-gradient p-8 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-3 rounded-full shadow-sm">
                        <span className="text-pink-400 text-3xl">🌙</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#3B2F4A]">Lunare</h2>
                        <p className="text-xs text-gray-500">Wellness & Cycle Companion</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <h3 className="text-lg font-bold text-purple-700">Laporan Siklus Kesehatan</h3>
                      <p className="text-xs text-gray-500 mt-1">Dicetak pada: {dayjs().format("DD MMMM YYYY, HH:mm")}</p>
                    </div>
                  </div>

                  {/* Profile info */}
                  {profile && (
                    <div className="mb-8 bg-pink-50/50 p-6 rounded-2xl border border-pink-100 flex flex-col md:flex-row md:justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Nama Pengguna</p>
                        <p className="text-lg font-bold text-gray-700">{profile.username}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email</p>
                        <p className="text-lg font-medium text-gray-700">{profile.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Summary / Stats Grid */}
                  <h3 className="text-xl font-bold mb-4 text-[#3B2F4A] flex items-center gap-2 border-b border-pink-100 pb-2">
                    <span>📊</span> Ringkasan Siklus
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <div className="pdf-stat-card">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Rata-rata Siklus</p>
                      <p className="text-2xl font-bold text-[#3B2F4A]">{avgCycleLength} Hari</p>
                    </div>
                    <div className="pdf-stat-card">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Rata-rata Menstruasi</p>
                      <p className="text-2xl font-bold text-[#3B2F4A]">{prediction?.has_data ? prediction.avg_period_duration : 5} Hari</p>
                    </div>
                    <div className="pdf-stat-card">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Prediksi Berikutnya</p>
                      <p className="text-2xl font-bold text-[#3B2F4A]">{nextPeriodDate}</p>
                    </div>
                  </div>

                  {/* Period History */}
                  <h3 className="text-xl font-bold mb-4 text-[#3B2F4A] flex items-center gap-2 border-b border-pink-100 pb-2">
                    <span>📅</span> Riwayat Siklus
                  </h3>
                  {periods.length === 0 ? (
                    <p className="text-gray-400 text-sm italic mb-8">Belum ada riwayat menstruasi yang tercatat.</p>
                  ) : (
                    <div className="overflow-x-auto mb-8 rounded-xl border border-pink-100">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-pink-50/50">
                            <th className="pdf-table-header">No.</th>
                            <th className="pdf-table-header">Tanggal Mulai</th>
                            <th className="pdf-table-header">Tanggal Selesai</th>
                            <th className="pdf-table-header">Durasi</th>
                            <th className="pdf-table-header">Suasana Hati</th>
                          </tr>
                        </thead>
                        <tbody>
                          {periods.slice(0, 10).map((p, idx) => (
                            <tr key={p.id} className="pdf-table-row">
                              <td className="p-3 text-gray-600 font-semibold">{idx + 1}</td>
                              <td className="p-3 text-gray-700">{dayjs(p.start_date).format("DD MMM YYYY")}</td>
                              <td className="p-3 text-gray-700">{dayjs(p.end_date).format("DD MMM YYYY")}</td>
                              <td className="p-3 text-gray-700">
                                {dayjs(p.end_date).diff(dayjs(p.start_date), "day") + 1} hari
                              </td>
                              <td className="p-3 text-gray-700 capitalize">{p.mood ? p.mood : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Moods Section */}
                  <h3 className="text-xl font-bold mb-4 text-[#3B2F4A] flex items-center gap-2 border-b border-pink-100 pb-2">
                    <span>🧠</span> Analisis Jurnal Suasana Hati
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Mood count */}
                    <div className="pdf-stat-card">
                      <h4 className="font-bold text-sm text-purple-700 mb-3">Distribusi Suasana Hati</h4>
                      {(() => {
                        const moodCounts = {};
                        let totalMoodsCount = 0;
                        
                        moods.forEach((m) => {
                          moodCounts[m.mood_type] = (moodCounts[m.mood_type] || 0) + 1;
                          totalMoodsCount++;
                        });

                        if (totalMoodsCount === 0) {
                          return <p className="text-gray-400 text-xs italic">Belum ada jurnal suasana hati.</p>;
                        }

                        return (
                          <div className="space-y-2">
                            {Object.entries(moodCounts).map(([type, count]) => {
                              const percentage = Math.round((count / totalMoodsCount) * 100);
                              return (
                                <div key={type} className="flex items-center justify-between text-xs">
                                  <span className="capitalize flex items-center gap-1.5 font-medium">
                                    <span>{getMoodEmoji(type)}</span>
                                    <span>{type}</span>
                                  </span>
                                  <div className="flex items-center gap-2 w-1/2">
                                    <div className="bg-pink-100 h-2.5 rounded-full flex-1 overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-pink-300 to-purple-300 h-2.5 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="font-bold text-gray-500 w-8 text-right">{percentage}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Mood notes */}
                    <div className="pdf-stat-card">
                      <h4 className="font-bold text-sm text-purple-700 mb-3">Catatan Jurnal Terbaru</h4>
                      {(() => {
                        const recentNotes = moods.filter(m => m.note).slice(0, 3);
                        
                        if (recentNotes.length === 0) {
                          return <p className="text-gray-400 text-xs italic">Tidak ada catatan suasana hati terbaru.</p>;
                        }

                        return (
                          <div className="space-y-2.5">
                            {recentNotes.map((m) => (
                              <div key={m.id} className="text-xs bg-white p-2.5 rounded-xl border border-pink-50 shadow-sm">
                                <div className="flex justify-between text-gray-400 mb-1">
                                  <span className="font-bold flex items-center gap-1">
                                    <span>{getMoodEmoji(m.mood_type)}</span>
                                    <span className="capitalize">{m.mood_type}</span>
                                  </span>
                                  <span>{dayjs(m.date).format("DD MMM YYYY")}</span>
                                </div>
                                <p className="text-gray-600 italic">"{m.note}"</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Health Insights */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-100/50">
                    <h4 className="font-bold text-[#3B2F4A] mb-2 flex items-center gap-1.5">
                      <span>💡</span> Tips Kesehatan Lunare
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {prediction?.has_data ? (
                        prediction.avg_cycle_length < 21 || prediction.avg_cycle_length > 35 ? (
                          "Siklus menstruasi Anda terdeteksi di luar rentang rata-rata umum (21-35 hari). Hal ini normal bagi beberapa individu, namun kami menyarankan untuk tetap berkonsultasi dengan penyedia layanan kesehatan jika pola ini terus berlanjut."
                        ) : (
                          "Siklus menstruasi Anda terpantau berada di rentang normal (21-35 hari). Pertahankan gaya hidup sehat, konsumsi air putih yang cukup, dan kelola stres dengan baik untuk menjaga kestabilan hormon Anda."
                        )
                      ) : (
                        "Catat terus data menstruasi Anda untuk mendapatkan analisis siklus dan prediksi masa subur yang akurat dari Lunare."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          </div>
        </div>

      {/* CUSTOM ALERT/CONFIRM MODAL */}
      <AlertModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={alertModal.onConfirm}
        onClose={closeAlert}
      />

    </div>
  );
}

export default Dashboard;