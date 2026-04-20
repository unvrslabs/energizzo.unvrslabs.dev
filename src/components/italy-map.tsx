"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { STATUS_CONFIG, type Status } from "@/lib/status-config";
import type { Lead } from "@/lib/types";

type Props = {
  leads: Lead[];
  onSelect: (id: string) => void;
};

export default function ItalyMap({ leads, onSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<Status>>(new Set());

  const withCoords = useMemo(() => leads.filter((l) => l.latitude != null && l.longitude != null), [leads]);
  const withoutCoords = leads.length - withCoords.length;

  const statusCounts = useMemo(() => {
    const m = new Map<Status, number>();
    for (const l of leads) m.set(l.status, (m.get(l.status) ?? 0) + 1);
    return m;
  }, [leads]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [42.5, 12.5],
      zoom: 6,
      minZoom: 5,
      maxZoom: 18,
      maxBounds: L.latLngBounds([35.0, 6.0], [47.5, 19.0]),
      maxBoundsViscosity: 0.8,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      iconCreateFunction: (c) => {
        const count = c.getChildCount();
        const size = count < 10 ? 36 : count < 100 ? 44 : 54;
        return L.divIcon({
          html: `<div class="flex items-center justify-center rounded-full font-bold text-white" style="width:${size}px;height:${size}px;background:radial-gradient(circle, hsla(158,64%,50%,0.95), hsla(160,70%,36%,0.9));box-shadow:0 0 20px hsla(158,64%,42%,0.6);border:2px solid white;">${count}</div>`,
          className: "custom-cluster",
          iconSize: [size, size],
        });
      },
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();
    const markers: L.Marker[] = [];
    for (const lead of withCoords) {
      if (hiddenStatuses.has(lead.status)) continue;
      const cfg = STATUS_CONFIG[lead.status];
      const icon = L.divIcon({
        html: `<div style="width:18px;height:18px;border-radius:50%;background:${cfg.color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
        className: "custom-pin",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker([lead.latitude!, lead.longitude!], {
        icon,
        title: lead.ragione_sociale,
      });
      marker.bindTooltip(
        `<strong>${escapeHtml(lead.ragione_sociale)}</strong><br/><span style="color:#888;font-size:11px">${escapeHtml(lead.comune ?? "")} (${escapeHtml(lead.provincia ?? "")}) · ${escapeHtml(cfg.label)}</span>`,
        { direction: "top", offset: [0, -8] },
      );
      marker.on("click", () => onSelect(lead.id));
      markers.push(marker);
    }
    cluster.addLayers(markers);
  }, [withCoords, hiddenStatuses, onSelect]);

  function toggleStatus(s: Status) {
    setHiddenStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  return (
    <div className="glass rounded-lg overflow-hidden relative">
      {withoutCoords > 0 && (
        <div className="absolute top-3 left-3 right-3 z-[400] glass rounded-md px-3 py-2 text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/30">
          {withoutCoords} lead senza coordinate — visibili solo in Tabella e Pipeline
        </div>
      )}
      <div ref={containerRef} className="h-[70vh] w-full" />
      <div className="absolute bottom-4 left-4 z-[400] glass rounded-md p-2 max-w-[220px]">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 px-1">Legenda</div>
        <div className="flex flex-col gap-0.5 max-h-[280px] overflow-y-auto">
          {Array.from(statusCounts.entries())
            .sort((a, b) => STATUS_CONFIG[a[0]].order - STATUS_CONFIG[b[0]].order)
            .map(([s, count]) => {
              const cfg = STATUS_CONFIG[s];
              const hidden = hiddenStatuses.has(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  className={`flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-accent/10 transition-all ${hidden ? "opacity-30" : ""}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                  <span className="flex-1 text-left truncate">{cfg.label}</span>
                  <span className="font-mono text-muted-foreground">{count}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
