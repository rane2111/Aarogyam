import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { Button } from "@/components/ui/button";
import { Heart, Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from "lucide-react";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID as string;

export default function VideoCallPage() {
  const { channelName } = useParams<{ channelName: string }>();
  const navigate = useNavigate();

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<ICameraVideoTrack | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "ended">("connecting");
  const [error, setError] = useState<string | null>(null);

  // ── Initialise Agora and join channel ─────────────────────────────────────
  useEffect(() => {
    if (!channelName || !APP_ID || APP_ID === "YOUR_AGORA_APP_ID_HERE") {
      setError("Agora App ID is not configured. Please add VITE_AGORA_APP_ID to your .env file.");
      return;
    }

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;

    // Remote user joined & published tracks
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      setRemoteUsers((prev) => {
        if (prev.find((u) => u.uid === user.uid)) return prev;
        return [...prev, user];
      });

      if (mediaType === "video") {
        // play after state update renders the container
        setTimeout(() => {
          user.videoTrack?.play(`remote-video-${user.uid}`);
        }, 100);
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
      setStatus("connected");
    });

    client.on("user-unpublished", (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    client.on("user-left", (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    const join = async () => {
      try {
        // token = null → Agora "testing mode" (no token required)
        await client.join(APP_ID, channelName, null);

        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack(),
        ]);

        localAudioRef.current = audioTrack;
        localVideoRef.current = videoTrack;

        // Play local video in the local container
        videoTrack.play("local-video");

        await client.publish([audioTrack, videoTrack]);
        setStatus("connected");
      } catch (err: any) {
        console.error("Agora join error:", err);
        setError(err?.message ?? "Failed to join the call.");
      }
    };

    join();

    return () => {
      localAudioRef.current?.close();
      localVideoRef.current?.close();
      client.leave();
    };
  }, [channelName]);

  // ── Mic toggle ─────────────────────────────────────────────────────────────
  const toggleMic = async () => {
    if (!localAudioRef.current) return;
    await localAudioRef.current.setEnabled(!micOn);
    setMicOn((v) => !v);
  };

  // ── Camera toggle ──────────────────────────────────────────────────────────
  const toggleCam = async () => {
    if (!localVideoRef.current) return;
    await localVideoRef.current.setEnabled(!camOn);
    setCamOn((v) => !v);
  };

  // ── End call ───────────────────────────────────────────────────────────────
  const endCall = async () => {
    localAudioRef.current?.close();
    localVideoRef.current?.close();
    await clientRef.current?.leave();
    setStatus("ended");
    navigate("/dashboard");
  };

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <Heart className="h-10 w-10 text-primary" />
        <h2 className="text-white text-xl font-semibold">Configuration Required</h2>
        <p className="text-white/60 max-w-md text-sm">{error}</p>
        <div className="bg-gray-800 rounded-xl p-4 text-left text-sm text-green-400 font-mono max-w-md w-full">
          <p className="text-white/40 mb-1"># .env file</p>
          <p>VITE_AGORA_APP_ID=your_app_id_here</p>
        </div>
        <p className="text-white/40 text-xs">
          Get your free App ID at{" "}
          <a href="https://console.agora.io" target="_blank" rel="noreferrer" className="text-primary underline">
            console.agora.io
          </a>
        </p>
        <Button onClick={() => navigate("/dashboard")} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 gap-6">

      {/* Branding */}
      <div className="flex items-center gap-2 text-white/80">
        <Heart className="h-5 w-5 text-primary" />
        <span className="font-semibold text-lg">Aarogyam · Video Consultation</span>
      </div>

      {/* Status pill */}
      <div className={`flex items-center gap-2 text-xs px-4 py-1.5 rounded-full font-medium ${
        status === "connecting" ? "bg-yellow-500/20 text-yellow-300" :
        status === "connected"  ? "bg-emerald-500/20 text-emerald-300" :
                                  "bg-red-500/20 text-red-300"
      }`}>
        {status === "connecting" && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === "connecting" ? "Connecting…" :
         status === "connected"  ? "🟢 Connected" : "🔴 Call Ended"}
      </div>

      {/* ── Video Grid ──────────────────────────────────────── */}
      <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">

        {/* Remote video(s) — full canvas */}
        {remoteUsers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40">
            <Video className="h-12 w-12 animate-pulse" />
            <p className="text-sm">Waiting for the other person to join…</p>
          </div>
        ) : (
          remoteUsers.map((user) => (
            <div
              key={user.uid}
              id={`remote-video-${user.uid}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ))
        )}

        {/* Local video — picture-in-picture */}
        <div className="absolute bottom-4 right-4 w-36 h-24 md:w-48 md:h-32 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg bg-gray-800">
          <div id="local-video" className="w-full h-full" />
          {!camOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-white/30" />
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMic}
          title={micOn ? "Mute mic" : "Unmute mic"}
          className={`h-14 w-14 rounded-full text-white ${
            micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-500"
          }`}
        >
          {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>

        <Button
          onClick={endCall}
          size="icon"
          title="End call"
          className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/40"
        >
          <PhoneOff className="h-7 w-7" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCam}
          title={camOn ? "Turn off camera" : "Turn on camera"}
          className={`h-14 w-14 rounded-full text-white ${
            camOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-500"
          }`}
        >
          {camOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
      </div>

      <p className="text-white/20 text-xs">Room: {channelName}</p>
    </div>
  );
}
