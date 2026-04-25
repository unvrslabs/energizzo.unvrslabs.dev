"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function HomeVideoV2() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    setHasInteracted(true);
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  return (
    <section className="lv2-section" style={{ paddingTop: "32px" }}>
      <div className="lv2-container">
        <div className="lv2-home-video-wrap">
          <div className="lv2-home-video-frame">
            <video
              ref={videoRef}
              src="/home-dispaccio.mp4"
              className="lv2-home-video"
              playsInline
              loop
              muted={muted}
              preload="metadata"
            />

            {!hasInteracted && (
              <button
                type="button"
                onClick={togglePlay}
                className="lv2-home-video-overlay"
                aria-label="Riproduci video"
              >
                <span className="lv2-home-video-play">
                  <Play className="w-6 h-6" fill="currentColor" />
                </span>
              </button>
            )}

            {hasInteracted && (
              <div className="lv2-home-video-controls">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="lv2-home-video-ctrl"
                  aria-label={playing ? "Pausa" : "Play"}
                >
                  {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" fill="currentColor" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="lv2-home-video-ctrl"
                  aria-label={muted ? "Attiva audio" : "Disattiva audio"}
                >
                  {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .lv2-home-video-wrap {
          display: flex;
          justify-content: center;
        }
        .lv2-home-video-frame {
          position: relative;
          width: 100%;
          max-width: 960px;
          aspect-ratio: 16 / 9;
          border-radius: 18px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 20px 60px -20px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 255, 255, 0.02) inset,
            0 0 80px -30px hsl(155 70% 45% / 0.25);
        }
        .lv2-home-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .lv2-home-video-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.15) 0%,
            rgba(0, 0, 0, 0.45) 100%
          );
          cursor: pointer;
          transition: background 0.2s ease;
          border: none;
        }
        .lv2-home-video-overlay:hover {
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.05) 0%,
            rgba(0, 0, 0, 0.35) 100%
          );
        }
        .lv2-home-video-play {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: hsl(155 70% 45%);
          color: #001b0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 4px;
          box-shadow:
            0 0 0 8px hsl(155 70% 45% / 0.18),
            0 12px 30px -8px hsl(155 70% 45% / 0.5);
          transition: transform 0.18s ease;
        }
        .lv2-home-video-overlay:hover .lv2-home-video-play {
          transform: scale(1.06);
        }
        .lv2-home-video-controls {
          position: absolute;
          bottom: 14px;
          right: 14px;
          display: flex;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .lv2-home-video-frame:hover .lv2-home-video-controls {
          opacity: 1;
        }
        .lv2-home-video-ctrl {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .lv2-home-video-ctrl:hover {
          background: rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </section>
  );
}
