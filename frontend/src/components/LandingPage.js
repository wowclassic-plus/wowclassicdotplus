import React from "react";

function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('https://wow.zamimg.com/uploads/screenshots/normal/1059910.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          padding: "20px",
          borderRadius: "15px",
          maxWidth: "1200px",
          width: "100%",
        }}
      >
        {/* Left column: text */}
        <div style={{ flex: 1, paddingRight: "20px" }}>
          <h1 style={{ fontSize: "3em", textShadow: "2px 2px 8px #000" }}>
            World of Warcraft Classic Plus Survey
          </h1>
          <p style={{ fontSize: "1.2em", lineHeight: "1.5", textShadow: "1px 1px 4px #000" }}>
            Welcome to the ultimate Classic Plus Survey! Explore the ideas that may help shape the Classic Plus we are all looking for!
          </p>
          <p style={{ fontSize: "1em", marginTop: "20px", textShadow: "1px 1px 4px #000" }}>
            Coming soon: an exclusive survey to shape the future of Classic Plus!
          </p>
        </div>

        {/* Right column: video */}
        <div style={{ flex: 1 }}>
            <div style={{
                position: "relative",
                width: "100%",
                paddingBottom: "56.25%", // 16:9 aspect ratio
                borderRadius: "10px",
                overflow: "hidden",
            }}>
                <iframe
                title="WoW Classic Plus Video"
                src="https://www.youtube.com/embed/MVUD2BqPpEc"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                ></iframe>
            </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
