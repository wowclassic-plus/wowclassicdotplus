import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa"; // install react-icons if not yet: npm i react-icons

function LandingPage() {
  const infoBoxes = [
    {
      title: "About the Survey",
      content:
        "Explore community-driven ideas that could shape the future of Classic Plus. Your voice matters!",
    },
    {
      title: "Watch the Video",
      content: (
        <iframe
          title="WoW Classic Plus Video"
          src="https://www.youtube.com/embed/MVUD2BqPpEc"
          style={{
            width: "100%",
            height: "300px",
            border: "none",
            borderRadius: "8px",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ),
    },
    {
      title: "Join the Community",
      content:
        "Stay updated and share your feedback with other players on Discord and forums!",
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleCard = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/landingImage.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "80px",
        color: "white",
        gap: "15px",
        flexWrap: "wrap",
        paddingBottom: "40px",
      }}
    >
      {infoBoxes.map((box, index) => (
        <motion.div
          key={index}
          onClick={() => toggleCard(index)}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            border: "1.5px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "0px",
            padding: "15px",
            cursor: "pointer",
            boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(3px)",
            width: expandedIndex === index ? "90%" : "300px",
            maxWidth: "400px",
            transition: "width 0.3s ease",
          }}
          whileHover={{ scale: 1.03 }}
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
            <h2 style={{ textAlign: "center", margin: 0 }}>{box.title}</h2>
            <motion.div
              animate={{ rotate: expandedIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronDown />
            </motion.div>
          </div>

          <AnimatePresence>
            {expandedIndex === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ marginTop: "15px" }}
              >
                {typeof box.content === "string" ? (
                  <p style={{ fontSize: "1rem", lineHeight: "1.5" }}>{box.content}</p>
                ) : (
                  box.content
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export default LandingPage;
