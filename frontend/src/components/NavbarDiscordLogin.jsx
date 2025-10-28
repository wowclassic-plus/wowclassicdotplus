import React, { useContext } from "react";
import {
  Button,
  Box,
  Avatar,
  Typography,
  useTheme,
  // useMediaQuery,
} from "@mui/material";
import { UserContext } from "./UserContext";

const CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
const FRONTEND_REDIRECT = process.env.REACT_APP_FRONTEND_REDIRECT;

export default function NavbarDiscordLogin() {
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useContext(UserContext);

  if (!CLIENT_ID || !FRONTEND_REDIRECT) {
    return null;
  }

  const handleLogin = () => {
    const OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      FRONTEND_REDIRECT
    )}&response_type=code&scope=identify`;
    window.location.href = OAUTH_URL;
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {!user ? (
        <Button
          variant="contained"
          onClick={handleLogin}
          sx={{
            backgroundColor: "#5865F2",
            color: "white",
            padding: { xs: '8px 16px', sm: '10px 20px' },
            borderRadius: 2,
            fontWeight: "bold",
            fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
            textTransform: 'none',
            minWidth: 'auto',
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: '#4752C4',
              transform: 'scale(1.05)',
              boxShadow: '0 0 15px rgba(88, 101, 242, 0.5)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Login with Discord
        </Button>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <Avatar
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
            alt="avatar"
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          />
          <Typography
            variant="body1"
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
              whiteSpace: "nowrap",
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {user.username}#{user.discriminator}
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={logout}
            sx={{
              padding: { xs: '6px 12px', sm: '8px 16px' },
              borderRadius: 1.5,
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              textTransform: 'none',
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: '#d93636',
                transform: 'scale(1.05)',
                boxShadow: '0 0 12px rgba(255, 77, 77, 0.5)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );
}