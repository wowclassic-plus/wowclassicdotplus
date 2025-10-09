import React from "react";
import SurveyForm from "./SurveyForm";

function SurveyPage({ backendUrl }) {
  
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Survey</h1>
      <p>We value your feedback! Please fill out the survey below.</p>
      <SurveyForm backendUrl={backendUrl} />
    </div>
  );
}

export default SurveyPage;
