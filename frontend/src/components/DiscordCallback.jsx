import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "./UserContext";

const BACKEND_URL = "https://classic-plus-site.onrender.com/auth/callback"

export default function DiscordCallback() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

    useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
        axios
        .get(`${BACKEND_URL}/auth/discord/callback?code=${code}`)
        .then((res) => {
            login(res.data); 
            navigate("/home");
        })
        .catch((err) => {
            console.error("Discord login failed:", err);
            navigate("/home");
        });
    } else {
        navigate("/home");
    }
    }, [login, navigate]); // ✅ remove 'code' from dependencies


  return <div>Logging in...</div>;
}
