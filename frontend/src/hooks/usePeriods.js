import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import dayjs from "dayjs";

function usePeriods() {
  const [periods, setPeriods] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPeriods = useCallback(async () => {
    try {
      const response = await API.get("/periods");
      setPeriods(response.data);
    } catch (error) {
      console.log("Error fetching periods:", error);
    }
  }, []);

  const fetchPrediction = useCallback(async () => {
    try {
      const response = await API.get("/periods/prediction");
      setPrediction(response.data);
    } catch (error) {
      console.log("Error fetching prediction:", error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPeriods(), fetchPrediction()]);
    setLoading(false);
  }, [fetchPeriods, fetchPrediction]);

  const addPeriod = async (data) => {
    try {
      await API.post("/periods", data);
      await refreshAll();
      return true;
    } catch (error) {
      console.log("Error adding period:", error);
      return false;
    }
  };

  const deletePeriod = async (id) => {
    try {
      await API.delete(`/periods/${id}`);
      await refreshAll();
      return true;
    } catch (error) {
      console.log("Error deleting period:", error);
      return false;
    }
  };

  const updatePeriod = async (id, data) => {
    try {
      await API.put(`/periods/${id}`, data);
      await refreshAll();
      return true;
    } catch (error) {
      console.log("Error updating period:", error);
      return false;
    }
  };

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Derived data from prediction
  const currentCycleDay = prediction?.has_data ? prediction.cycle_day : null;
  const currentPhase = prediction?.has_data ? prediction.current_phase : null;
  const avgCycleLength = prediction?.has_data ? prediction.avg_cycle_length : 28;
  const avgDuration = prediction?.has_data ? prediction.avg_period_duration : 5;

  const nextPeriodDate = prediction?.has_data
    ? dayjs(prediction.next_period_date).format("DD MMM YYYY")
    : "No Data";

  const ovulationDate = prediction?.has_data
    ? prediction.ovulation_date
    : null;

  const fertileStart = prediction?.has_data
    ? prediction.fertile_window_start
    : null;

  const fertileEnd = prediction?.has_data
    ? prediction.fertile_window_end
    : null;

  const futurePredictions = prediction?.has_data
    ? prediction.future_predictions
    : [];

  // Get phase info with emoji and description
  const getPhaseInfo = (phase) => {
    switch (phase) {
      case "Menstrual":
        return { emoji: "🩸", description: "Take it easy, rest and hydrate", color: "menstrual" };
      case "Follicular":
        return { emoji: "🌸", description: "Energy is rising, great for new projects", color: "follicular" };
      case "Ovulation":
        return { emoji: "✨", description: "Peak energy and fertility", color: "ovulation" };
      case "Luteal":
        return { emoji: "🌙", description: "Wind down, practice self-care", color: "luteal" };
      default:
        return { emoji: "🌸", description: "Track your cycle to see insights", color: "default" };
    }
  };

  const phaseInfo = getPhaseInfo(currentPhase);

  // Helper: check if a date falls within any period
  const isPeriodDay = (dateStr) => {
    return periods.some((p) => {
      const d = dayjs(dateStr);
      return d.isAfter(dayjs(p.start_date).subtract(1, "day")) && d.isBefore(dayjs(p.end_date).add(1, "day"));
    });
  };

  // Helper: check if date is in fertile window
  const isFertileDay = (dateStr) => {
    if (!fertileStart || !fertileEnd) return false;
    const d = dayjs(dateStr);
    return d.isAfter(dayjs(fertileStart).subtract(1, "day")) && d.isBefore(dayjs(fertileEnd).add(1, "day"));
  };

  // Helper: check if date is ovulation day
  const isOvulationDay = (dateStr) => {
    if (!ovulationDate) return false;
    return dayjs(dateStr).isSame(dayjs(ovulationDate), "day");
  };

  // Helper: check if date is predicted period (checks all future predictions for the year)
  const isPredictedDay = (dateStr) => {
    if (!prediction?.has_data || futurePredictions.length === 0) return false;
    const d = dayjs(dateStr);
    
    // Check if the date falls within any of the predicted periods (start date to start date + avgDuration)
    return futurePredictions.some((predStart) => {
      const nextStart = dayjs(predStart);
      const nextEnd = nextStart.add(avgDuration - 1, "day");
      return d.isAfter(nextStart.subtract(1, "day")) && d.isBefore(nextEnd.add(1, "day"));
    });
  };

  return {
    periods,
    prediction,
    loading,
    currentCycleDay,
    currentPhase,
    phaseInfo,
    avgCycleLength,
    avgDuration,
    nextPeriodDate,
    ovulationDate,
    fertileStart,
    fertileEnd,
    addPeriod,
    deletePeriod,
    updatePeriod,
    isPeriodDay,
    isFertileDay,
    isOvulationDay,
    isPredictedDay,
    futurePredictions,
  };
}

export default usePeriods;