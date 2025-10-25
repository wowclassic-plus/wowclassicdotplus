import React from "react";
import SurveyForm from "./SurveyForm";

function SurveyPage({ backendUrl }) {
  
  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h1 style={{color:"white"}}>Classic Plus Survey</h1>
      <SurveyForm backendUrl={backendUrl} />
    </div>
  );
}

export default SurveyPage;
