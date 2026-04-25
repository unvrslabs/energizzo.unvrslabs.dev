"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play, Sparkles, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

function HeroVideo() {
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
    if (v.paused) v.play();
    else v.pause();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  return (
    <div className="hero-video-wrap">
      <div className="hero-video-shell">
        <div className="hero-video-frame">
          <video
            ref={videoRef}
            src="/home-dispaccio.mp4"
            className="hero-video"
            playsInline
            loop
            muted={muted}
            preload="metadata"
          />
          {!hasInteracted && (
            <button
              type="button"
              onClick={togglePlay}
              className="hero-video-overlay"
              aria-label="Riproduci video"
            >
              <span className="hero-video-play">
                <Play className="w-5 h-5" fill="currentColor" />
              </span>
            </button>
          )}
          {hasInteracted && (
            <div className="hero-video-controls">
              <button type="button" onClick={togglePlay} className="hero-video-ctrl" aria-label={playing ? "Pausa" : "Play"}>
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" fill="currentColor" />}
              </button>
              <button type="button" onClick={toggleMute} className="hero-video-ctrl" aria-label={muted ? "Attiva audio" : "Disattiva audio"}>
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hero-video-wrap {
          position: relative;
          display: flex;
          justify-content: center;
        }
        .hero-video-wrap::before {
          content: "";
          position: absolute;
          inset: -20px;
          background: radial-gradient(
            ellipse 60% 50% at 50% 50%,
            hsl(155 70% 45% / 0.18),
            transparent 70%
          );
          filter: blur(36px);
          pointer-events: none;
        }
        .hero-video-shell {
          position: relative;
          width: 100%;
          max-width: 340px;
          padding: 1.5px;
          border-radius: 26px;
          background: linear-gradient(
            145deg,
            hsl(155 70% 45% / 0.55) 0%,
            hsl(155 60% 35% / 0.18) 35%,
            rgba(255, 255, 255, 0.04) 60%,
            hsl(155 70% 45% / 0.35) 100%
          );
          box-shadow:
            0 30px 80px -25px rgba(0, 0, 0, 0.85),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset,
            0 0 100px -25px hsl(155 70% 45% / 0.35);
        }
        .hero-video-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 16;
          border-radius: 24px;
          overflow: hidden;
          background: #000;
        }
        .hero-video-frame::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -40px 60px -40px rgba(0, 0, 0, 0.8);
        }
        .hero-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
          display: block;
        }
        .hero-video-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.45));
          cursor: pointer;
          border: none;
          z-index: 1;
        }
        .hero-video-play {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: hsl(155 70% 45%);
          color: #001b0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 3px;
          box-shadow:
            0 0 0 7px hsl(155 70% 45% / 0.18),
            0 10px 24px -6px hsl(155 70% 45% / 0.5);
        }
        .hero-video-controls {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 1;
        }
        .hero-video-frame:hover .hero-video-controls {
          opacity: 1;
        }
        .hero-video-ctrl {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .hero-video-ctrl:hover {
          background: rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
}

export function HeroV2Demo() {
  return (
    <section className="lv2-section" style={{ paddingTop: 140 }}>
      <div className="lv2-container">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 items-center">
          <div>
            <div className="lv2-kicker mb-6">// Il network dei reseller energia</div>

            <h1 className="lv2-h1 mb-6">
              Il primo <em>network</em> dei reseller energia in Italia.
            </h1>

            <p className="lv2-lede mb-3">
              Delibere ARERA decifrate in bullet point, benchmark tariffario
              live, podcast editoriale &ldquo;Il Reseller&rdquo;, report
              indipendente annuale e area riservata online.
            </p>
            <p className="lv2-lede mb-9">
              Accesso gratuito su invito. 100 posti disponibili per il primo
              giro di selezioni.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a href="#richiedi" className="lv2-btn-primary">
                Richiedi l&apos;invito
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/network/login" className="lv2-btn-ghost">
                Accedi all&apos;area riservata
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--lv2-accent))" }} />
                <span
                  className="lv2-mono"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "hsl(var(--lv2-text-dim))",
                  }}
                >
                  €0 · per sempre
                </span>
              </div>
              <span className="lv2-mono" style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "hsl(var(--lv2-text-mute))" }}>
                · sponsorizzato da energizzo
              </span>
            </div>
          </div>

          <HeroVideo />
        </div>
      </div>
    </section>
  );
}
