import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";

const infoBoxes = [
  {
    title: "About the Survey",
    sub: [
      { title: "Purpose", content: "This survey aims to gather community feedback." },
      { title: "Duration", content: "The survey will be open for 2 weeks." },
    ],
  },
  {
    title: "Watch the Video",
    sub: [
      {
        title: "Video: Classic Plus Overview",
        content: (
          <iframe
            title="WoW Classic Plus Video"
            src="https://www.youtube.com/embed/MVUD2BqPpEc"
            style={{ width: "100%", height: 300, border: "none", borderRadius: 8 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ),
      },
      { title: "Video 2: Classic Plus General", content: "Learn how Classic Plus is made!" },
    ],
  },
  {
    title: "Join the Community",
    sub: [
      { title: "Discord", content: "Join our Discord server for discussions." },
      { title: "Forums", content: "Visit the forums to share feedback." },
    ],
  },
];

export default function LandingPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/landingImage.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 10,
        pb: 5,
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {infoBoxes.map((box, index) => (
        <Accordion
          key={index}
          sx={{
            width: { xs: "90%", md: 400 },
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: "1.5px solid rgba(255,255,255,0.3)",
            backdropFilter: "blur(3px)",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
            sx={{ "& .MuiAccordionSummary-content": { alignItems: "center" } }}
          >
            <Typography variant="h6">{box.title}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            {/* Map through sub-accordions */}
            {box.sub.map((subBox, subIndex) => (
              <Accordion
                key={subIndex}
                sx={{
                  bgcolor: theme.palette.background.default,
                  boxShadow: "none",
                  border: "1px solid rgba(255,255,255,0.2)",
                  mb: 1,
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{subBox.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {typeof subBox.content === "string" ? (
                    <Typography>{subBox.content}</Typography>
                  ) : (
                    subBox.content
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
