import React from "react";
import SurveyForm from "./SurveyForm";

function SurveyPage({ backendUrl }) {
  
  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h1 style={{color:"white"}}>Survey</h1>
      <p style={{color:"white"}}>We value your feedback! Please fill out the survey below.</p>
      <SurveyForm backendUrl={backendUrl} />
    </div>
  );
}

export default SurveyPage;
