import React, { useState, useEffect } from "react";
import SurveySummary from "./SurveySummary"; // the chart component we'll define

export default function SurveyResultsPage({ backendUrl }) {
  const [surveyData, setSurveyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${backendUrl}/survey/results/`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSurveyData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [backendUrl]);

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", marginTop: 50, color: "red" }}>Error: {error}</p>;

  return <SurveySummary surveyData={surveyData} />;
}
