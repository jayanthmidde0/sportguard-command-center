// Realistic fallback data so the UI looks alive when the backend is offline.
export const mockOverview = {
  total_scans: 18432,
  detections: 1287,
  verified_piracy: 412,
  takedowns: 198,
  trend: { scans: +12.4, detections: +8.1, verified: -3.2, takedowns: +21.5 },
};

export const mockTimeline = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  detections: Math.round(40 + Math.sin(i / 3) * 25 + Math.random() * 20),
  verified: Math.round(15 + Math.cos(i / 4) * 10 + Math.random() * 8),
  scans: Math.round(200 + Math.sin(i / 2) * 80 + Math.random() * 40),
}));

export const mockSimilarity = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  video: 70 + Math.round(Math.random() * 25),
  audio: 65 + Math.round(Math.random() * 30),
  watermark: 80 + Math.round(Math.random() * 18),
}));

export const mockPlatforms = [
  { name: "YouTube", value: 412, color: "#FF4D8D" },
  { name: "Telegram", value: 287, color: "#7B61FF" },
  { name: "Twitch", value: 164, color: "#2D9CDB" },
  { name: "TikTok", value: 132, color: "#22C55E" },
  { name: "Other", value: 88, color: "#F59E0B" },
];

export const mockTopVideos = [
  { id: "v1", title: "UEFA Champions Final 2025 — Full Match", platform: "YouTube", views: 184320, risk: 0.94 },
  { id: "v2", title: "NBA Finals Game 7 Highlights HD", platform: "Telegram", views: 92140, risk: 0.88 },
  { id: "v3", title: "F1 Monaco GP Replay", platform: "Twitch", views: 71290, risk: 0.79 },
  { id: "v4", title: "Wimbledon Final — Live Stream", platform: "TikTok", views: 54021, risk: 0.71 },
  { id: "v5", title: "NFL Super Bowl LIX Recap", platform: "YouTube", views: 48910, risk: 0.66 },
];

export type DetectionStatus = "SAFE" | "PIRATED" | "VERIFIED_PIRACY" | "REVIEW" | "PROCESSING";

export const mockDetections = Array.from({ length: 28 }, (_, i) => {
  const statuses: DetectionStatus[] = ["SAFE", "PIRATED", "VERIFIED_PIRACY", "REVIEW", "PROCESSING"];
  const status = statuses[i % statuses.length];
  const platforms = ["YouTube", "Telegram", "Twitch", "TikTok", "X.com"];
  return {
    id: `DET-${1000 + i}`,
    title: [
      "Premier League — Arsenal vs Chelsea",
      "NBA Finals Highlights",
      "F1 Qualifying Replay",
      "UFC 312 Main Event",
      "MLB World Series Recap",
      "Champions League Quarter-Final",
    ][i % 6],
    platform: platforms[i % platforms.length],
    similarity: { video: 60 + Math.round(Math.random() * 39), audio: 55 + Math.round(Math.random() * 44), watermark: i % 3 === 0 },
    status,
    score: 0.5 + Math.random() * 0.49,
    detected_at: new Date(Date.now() - i * 1000 * 60 * 47).toISOString(),
    source_url: "https://example.com/video/" + (10000 + i),
  };
});

export const mockMonitoring = {
  youtube: { active: true, scanned_24h: 8421, hits: 142, latency_ms: 412 },
  telegram: { active: true, scanned_24h: 5142, hits: 91, latency_ms: 612 },
  alerts: [
    { id: "a1", at: "2m ago", level: "danger", text: "Verified piracy match — UEFA Final on Telegram channel @sport_hd" },
    { id: "a2", at: "11m ago", level: "warning", text: "High similarity (94%) — YouTube upload by @StreamHub_2025" },
    { id: "a3", at: "32m ago", level: "info", text: "New reference fingerprint indexed: NBA Finals G7" },
    { id: "a4", at: "1h ago", level: "danger", text: "Watermark verified pirate copy — TikTok @clipsdaily" },
  ],
};
