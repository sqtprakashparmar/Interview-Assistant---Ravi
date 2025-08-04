import React, { useState } from "react";
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";

import "@livekit/components-styles";
import { Track } from "livekit-client";
import "./App.css"; // We'll define custom styles here

const serverUrl = "wss://test-im1lu8qd.livekit.cloud";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const u_code = params.get("u_code");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const getRoomToken = async () => {
    setLoading(true);
    try {
      // const response = await fetch(
      //   "https://avatar-agent.onrender.com/getToken",
      //   body: JSON.stringify({ u_code }),
      //   headers: {
      //     "Content-Type": "application/json",
      //   }
      // );
      const response = await fetch(
        "https://avatar-agent.onrender.com/getToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ u_code }),
        }
      );
      const data = await response.json();
      setToken(data?.data?.room_token);
    } catch (error) {
      console.error("Error fetching token:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-container">
      {!token && (
        <div className="centered-content">
          <h2 className="ai-heading">Welcome to AI Assistant</h2>
          <button
            className={`ai-button ${loading ? "loading" : ""}`}
            onClick={getRoomToken}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Start AI Assistant"}
          </button>
        </div>
      )}

      {token && (
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          data-lk-theme="default"
          style={{ height: "100vh" }}
        >
          <MyVideoConference />
          <RoomAudioRenderer />
          <ControlBar />
        </LiveKitRoom>
      )}
    </div>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // ✅ Filter out 'agent-AJ_' participants unless it's Tavus avatar
  const visibleTracks = tracks.filter((trackRef) => {
    const identity = trackRef.participant.identity ?? "";
    return !identity.startsWith("agent-");
  });

  return (
    <GridLayout
      tracks={visibleTracks}
      style={{
        height: "calc(100vh - var(--lk-control-bar-height))",
        padding: "10px",
        gap: "10px",
      }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}

