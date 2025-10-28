import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const dashboardItems = [
    {
      id: 1,
      title: "World Map",
      description: "Explore the interactive world map",
      size: "large",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "🗺️",
      path: "/map2",
      preview: "map"
    },
    {
      id: 2,
      title: "Player",
      description: "Character specific suggestions and ",
      size: "medium",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "👤",
      path: "/player",
      preview: "player"
    },
    {
      id: 3,
      title: "System",
      description: "Game settings and configuration",
      size: "medium",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      icon: "⚙️",
      path: "/system",
      preview: "system"
    },
    {
      id: 4,
      title: "Quests",
      description: "Active and completed quests",
      size: "small",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      icon: "📜",
      path: "/quests",
      preview: "quests"
    },
    {
      id: 5,
      title: "Inventory",
      description: "Items and equipment",
      size: "small",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      icon: "🎒",
      path: "/inventory",
      preview: "inventory"
    },
    {
      id: 6,
      title: "Skills",
      description: "Abilities and progression",
      size: "small",
      color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      icon: "🔮",
      path: "/skills",
      preview: "skills"
    },
    {
      id: 7,
      title: "Guild",
      description: "Guild management and members",
      size: "small",
      color: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      icon: "🏰",
      path: "/guild",
      preview: "guild"
    },
    {
      id: 8,
      title: "Market",
      description: "Trading and marketplace",
      size: "medium",
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      icon: "💰",
      path: "/market",
      preview: "market"
    },
    {
      id: 9,
      title: "Bestiary",
      description: "Creatures and monsters",
      size: "small",
      color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      icon: "🐲",
      path: "/bestiary",
      preview: "bestiary"
    }
  ];

  // Preview components for each tab type
  const renderPreview = (previewType) => {
    switch (previewType) {
    case 'map':
        return (
            <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('/map.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "16px",
            opacity: 0.6,
            filter: "blur(1px) brightness(0.8)"
            }} />
        );
      
      case 'player':
        return (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #2a1a3a 0%, #4a2d5c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "16px",
            opacity: 0.7
          }}>
            <div style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.9)"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>👤</div>
              <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Player</div>
            </div>
          </div>
        );
      
      case 'system':
        return (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #1a3a2a 0%, #2d5c4a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "16px",
            opacity: 0.7
          }}>
            <div style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.9)"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>⚙️</div>
              <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>System</div>
            </div>
          </div>
        );
      
      case 'inventory':
        return (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #3a2a1a 0%, #5c4a2d 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "16px",
            opacity: 0.7
          }}>
            <div style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.9)"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🎒</div>
              <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Inventory</div>
            </div>
          </div>
        );
      
      case 'skills':
        return (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #1a2a3a 0%, #2d3a5c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "16px",
            opacity: 0.7
          }}>
            <div style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.9)"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🔮</div>
              <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Skills</div>
            </div>
          </div>
        );
      
      default:
        return (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #333 0%, #555 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "16px",
            opacity: 0.7
          }}>
            <div style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.9)"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🔍</div>
              <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Preview</div>
            </div>
          </div>
        );
    }
  };

  const getItemSize = (size) => {
    switch (size) {
      case 'large': return { gridColumn: 'span 2', gridRow: 'span 2' };
      case 'medium': return { gridColumn: 'span 1', gridRow: 'span 1' };
      case 'small': return { gridColumn: 'span 1', gridRow: 'span 1' };
      default: return { gridColumn: 'span 1', gridRow: 'span 1' };
    }
  };

  return (
    <div style={{ 
      paddingTop: "75px",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px"
      }}>
        <h1 style={{
          color: "white",
          fontSize: "2.5rem",
          marginBottom: "10px",
          textAlign: "center",
          fontWeight: "300",
          textShadow: "0 2px 10px rgba(0,0,0,0.3)"
        }}>
          Dashboard
        </h1>
        
        <p style={{
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          marginBottom: "40px",
          fontSize: "1.1rem"
        }}>
          Hover over items to see previews
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gridAutoRows: "200px",
          gap: "20px",
          padding: "20px"
        }}>
          {dashboardItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                ...getItemSize(item.size),
                background: item.color,
                borderRadius: "16px",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                // boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                transform: hoveredItem === item.id ? "translateY(-8px) scale(1.02)" : "none",
                boxShadow: hoveredItem === item.id ? "0 16px 48px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.3)"
              }}
            >
              {/* Preview Background - Only shows on hover */}
              {hoveredItem === item.id && renderPreview(item.preview)}
              
              {/* Content Layer */}
              <div style={{ 
                position: "relative", 
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between"
              }}>
                <div style={{
                  fontSize: "3rem",
                  marginBottom: "12px",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                }}>
                  {item.icon}
                </div>
                
                <div>
                  <h3 style={{
                    color: "white",
                    fontSize: item.size === 'large' ? "1.8rem" : "1.4rem",
                    margin: "0 0 8px 0",
                    fontWeight: "600",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                  }}>
                    {item.title}
                  </h3>
                  
                  <p style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "0.9rem",
                    margin: 0,
                    lineHeight: "1.4",
                    opacity: 0.9
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Gradient Overlay to make text readable over preview */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, transparent 50%)",
                borderRadius: "16px",
                zIndex: 1
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}