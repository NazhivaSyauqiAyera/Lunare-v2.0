import { useEffect, useState } from "react";
import API from "../services/api";
import dayjs from "dayjs";

function usePeriods() {

  const [periods, setPeriods] = useState([]);

  const fetchPeriods = async () => {

    try {

      const response = await API.get("/periods");

      setPeriods(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  const addPeriod = async (data) => {

    try {

      await API.post("/periods", data);

      fetchPeriods();

      return true;

    } catch (error) {

      console.log(error);

      return false;

    }

  };

  useEffect(() => {

    const loadData = async () => {

      await fetchPeriods();

    };

    loadData();

  }, []);

  const latestPeriod = periods[0];

  const nextPeriod = latestPeriod
    ? dayjs(latestPeriod.start_date)
        .add(28, "day")
        .format("DD MMM YYYY")
    : "No Data";

  return {
    periods,
    nextPeriod,
    addPeriod,
  };

}

export default usePeriods;