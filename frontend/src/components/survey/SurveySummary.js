import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Muted, professional color palette
const COLORS = ["#08305cff", "#b15f0eff", "#E76F51", "#1e812bff", "#C3A995", "#6c1c85ff", "#0d3985ff"];

function QuestionCard({ question, counts }) {
  const entries = Object.entries(counts || {});
  if (!entries.length) {
    return (
      <div style={{
        background: "#415683ff",
        borderRadius: 12,
        padding: 25,
        marginBottom: 25,
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ color: "#000" }}>{question}</h3>
        <p style={{ color: "#000" }}>No responses yet</p>
      </div>
    );
  }

  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const data = entries.map(([name, value]) => ({
    name,
    value,
    percent: ((value / total) * 100).toFixed(1)
  }));

  return (
    <div style={{
      background: "#e7e7e7ff",
      borderRadius: 12,
      padding: 25,
      marginBottom: 25,
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ marginBottom: 20, color: "#000" }}>{question}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine
            label={({ name, percent }) => `${name}: ${percent}%`}
            isAnimationActive={true}
            animationDuration={1000}
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]}
            contentStyle={{ color: "#000" }}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: "#000" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SurveySummary({ surveyData = {} }) {
  const questions = Object.entries(surveyData);

  if (!questions.length) return <p style={{ textAlign: "center", marginTop: 50, color: "#000" }}>No survey data available.</p>;

  return (
    <div style={{ background: "#102a4dff", minHeight: "100vh", padding: "100px 40px 40px 40px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 30,
        maxWidth: 1200,
        margin: "0 auto"
      }}>
        {questions.map(([q, counts]) => (
          <QuestionCard key={q} question={q} counts={counts} />
        ))}
      </div>
    </div>
  );
}
