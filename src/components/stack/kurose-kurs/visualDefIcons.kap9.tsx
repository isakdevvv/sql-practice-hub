import * as React from "react";

/**
 * Ikoner for KuroseKap9Page (multimedia networking).
 * 48×48 viewBox, currentColor, gjenkjennelige strek-symboler.
 * Brukes av <VisualDefs> i kap 9 (streaming, DASH, VoIP/RTP, SIP, QoS, CDN).
 */

type IconProps = React.SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function S(props: IconProps & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <svg {...baseProps} {...rest}>
      {children}
    </svg>
  );
}

// ============================================================
// 9.1 — Multimedia-apper
// ============================================================

// VOD: filmrull + cloud
export const VodStreamIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="14" width="22" height="16" rx="1.5" />
    <circle cx="13" cy="18" r="1.4" />
    <circle cx="13" cy="26" r="1.4" />
    <circle cx="25" cy="18" r="1.4" />
    <circle cx="25" cy="26" r="1.4" />
    <path d="M32 32q4-2 8 0t4 6q-2 4-6 4H18q-4 0-5-3" />
  </S>
);

// VoIP samtale: telefon + bobler
export const VoipCallIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 10c-3 0-4 3-4 6 0 12 10 22 22 22 3 0 6-1 6-4l-6-4-4 3c-5-2-9-6-11-11l3-4z" />
    <circle cx="36" cy="12" r="1.6" />
    <circle cx="41" cy="14" r="1.2" />
  </S>
);

// Live broadcast: antenne + signal-bølger
export const LiveBroadcastIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 22v18M20 40h8" />
    <circle cx="24" cy="20" r="2.2" />
    <path d="M18 14a8 8 0 0112 0M14 9a14 14 0 0120 0" />
  </S>
);

// IoT sensor: liten chip med antenne
export const IotSensorIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="18" width="20" height="16" rx="1.5" />
    <path d="M18 18v-3M22 18v-3M26 18v-3M30 18v-3M18 37v-3M22 37v-3M26 37v-3M30 37v-3" />
    <circle cx="24" cy="26" r="2" />
    <path d="M28 12q3 0 3 3" />
  </S>
);

// Cloud gaming: gamepad + sky
export const CloudGamingIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 22q-4 0-4 4t4 4h28q4 0 4-4t-4-4q-1-5-6-5t-6 3q-4-3-9-2-3 1-3 4z" />
    <rect x="14" y="30" width="20" height="10" rx="3" />
    <circle cx="18" cy="35" r="1.2" />
    <circle cx="30" cy="35" r="1.2" />
  </S>
);

// Jitter: sawtooth/ujevne ankomster
export const JitterIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 32h6l3-12 4 18 4-22 4 16 4-10 4 12 4-6h7" />
  </S>
);

// Processing jitter: CPU + saw wave
export const ProcJitterIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="20" rx="2" />
    <path d="M18 22h12M18 26h12M18 30h12" />
    <path d="M14 18h-3M14 22h-3M34 18h3M34 22h3" />
    <path d="M37 38l2-3 2 3" />
  </S>
);

// Tap-toleranse: prosent med broken packet
export const LossToleranceIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="16" width="14" height="14" rx="1.5" />
    <path d="M22 23l4-3 4 3-4 3z" strokeDasharray="2 2" />
    <text x="34" y="36" fontSize="11" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">%</text>
  </S>
);

// MOS: 5-stjerners skala
export const MosScoreIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 22l3-4 3 4-2 5 2 5-3-2-3 2 2-5z" />
    <path d="M20 22l3-4 3 4-2 5 2 5-3-2-3 2 2-5z" />
    <path d="M30 22l3-4 3 4-2 5 2 5-3-2-3 2 2-5z" />
    <text x="24" y="42" fontSize="6" stroke="none" fill="currentColor" textAnchor="middle">MOS</text>
  </S>
);

// End-to-end / glass-to-glass: kamera→skjerm
export const GlassToGlassIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="5" />
    <circle cx="10" cy="24" r="2" />
    <path d="M16 24h16" strokeDasharray="2 2" />
    <rect x="32" y="14" width="14" height="20" rx="1.5" />
  </S>
);

// Best-effort: simple FIFO arrow
export const BestEffortIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="20" width="6" height="8" />
    <rect x="16" y="20" width="6" height="8" />
    <rect x="24" y="20" width="6" height="8" />
    <path d="M34 24h8M40 22l2 2-2 2" />
  </S>
);

// Codec / bitrate dial
export const CodecDialIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="12" />
    <path d="M24 24l8-5" />
    <circle cx="24" cy="24" r="1.5" />
    <path d="M14 24h-3M34 24h3M24 14v-3M24 37v-3" />
  </S>
);

// ============================================================
// 9.2 — DASH
// ============================================================

// MPD: menu / structured list
export const MpdManifestIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="8" width="28" height="32" rx="2" />
    <path d="M14 16h20M14 20h14M14 26h20M14 30h12M14 36h16" />
  </S>
);

// Segment: 2-10s blokk
export const SegmentIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="18" width="32" height="12" rx="1" />
    <line x1="16" y1="18" x2="16" y2="30" />
    <line x1="24" y1="18" x2="24" y2="30" />
    <line x1="32" y1="18" x2="32" y2="30" />
  </S>
);

// GOP: I + PB frames
export const GopFramesIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="10" height="12" rx="1" />
    <text x="11" y="27" fontSize="7" stroke="none" fill="currentColor" textAnchor="middle">I</text>
    <rect x="18" y="18" width="8" height="12" rx="1" />
    <text x="22" y="27" fontSize="6" stroke="none" fill="currentColor" textAnchor="middle">P</text>
    <rect x="28" y="18" width="8" height="12" rx="1" />
    <text x="32" y="27" fontSize="6" stroke="none" fill="currentColor" textAnchor="middle">B</text>
    <rect x="38" y="18" width="6" height="12" rx="1" />
  </S>
);

// Bitrate-ladder: trapper opp
export const BitrateLadderIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 40h6v-6h8v-8h8v-8h8v-8h8" />
  </S>
);

// Adaptation set: tre lag stablet
export const AdaptationSetIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="10" width="32" height="8" rx="1" />
    <rect x="8" y="20" width="32" height="8" rx="1" />
    <rect x="8" y="30" width="32" height="8" rx="1" />
    <path d="M42 14h2M42 24h2M42 34h2" />
  </S>
);

// ABR: feedback loop pil-sirkel
export const AbrLoopIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 14a14 14 0 0120 0" />
    <path d="M34 11l2 4-4 1" />
    <path d="M34 34a14 14 0 01-20 0" />
    <path d="M14 37l-2-4 4-1" />
    <text x="24" y="28" fontSize="7" stroke="none" fill="currentColor" textAnchor="middle">ABR</text>
  </S>
);

// Throughput-basert: tach/throughput gauge
export const ThroughputAbrIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 32a16 16 0 0132 0" />
    <path d="M24 32l8-8" />
    <circle cx="24" cy="32" r="1.5" />
    <path d="M10 36h28" />
  </S>
);

// Buffer-basert: tank med fyll-nivå
export const BufferFillIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="12" width="28" height="28" rx="2" />
    <rect x="10" y="24" width="28" height="16" />
    <path d="M14 16h2M14 20h2" />
  </S>
);

// BOLA / MPC: matematisk algoritme
export const AbrAlgoIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M14 24h20M24 14v20" strokeDasharray="2 2" />
    <text x="24" y="28" fontSize="8" stroke="none" fill="currentColor" textAnchor="middle" fontFamily="ui-monospace,monospace">fn</text>
  </S>
);

// Bitrate-oscillation: opp ned opp ned
export const OscillationIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 30l4-12 4 12 4-12 4 12 4-12 4 12 4-12 4 12 4-12" />
  </S>
);

// Stall: pause-knapp
export const StallIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <rect x="19" y="18" width="3" height="12" />
    <rect x="26" y="18" width="3" height="12" />
  </S>
);

// Startup delay: clock + play
export const StartupDelayIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="18" cy="24" r="10" />
    <path d="M18 18v6l4 3" />
    <path d="M32 18l10 6-10 6z" />
  </S>
);

// CDN: globe med regionale noder
export const CdnIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M10 24h28M24 10c5 5 5 23 0 28M24 10c-5 5-5 23 0 28" />
    <circle cx="14" cy="18" r="1.6" fill="currentColor" />
    <circle cx="34" cy="20" r="1.6" fill="currentColor" />
    <circle cx="32" cy="32" r="1.6" fill="currentColor" />
    <circle cx="16" cy="32" r="1.6" fill="currentColor" />
  </S>
);

// ============================================================
// 9.3 — VoIP, codecs
// ============================================================

// PCM: sample-bars
export const PcmSampleIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 24q4-12 8 0t8 0 8 0 8 0 8 0" strokeDasharray="2 2" />
    <line x1="10" y1="24" x2="10" y2="16" />
    <line x1="14" y1="24" x2="14" y2="30" />
    <line x1="18" y1="24" x2="18" y2="18" />
    <line x1="22" y1="24" x2="22" y2="32" />
    <line x1="26" y1="24" x2="26" y2="17" />
    <line x1="30" y1="24" x2="30" y2="29" />
    <line x1="34" y1="24" x2="34" y2="20" />
    <line x1="38" y1="24" x2="38" y2="28" />
  </S>
);

// Generic codec / phone label "G"
export const GCodecIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <text x="24" y="29" fontSize="14" stroke="none" fill="currentColor" textAnchor="middle" fontFamily="serif">G</text>
  </S>
);

// Opus: stylized "O"
export const OpusIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <circle cx="24" cy="24" r="7" />
  </S>
);

// H.264 / HEVC / VP9 / AV1 video codec: film + arrow
export const VideoCodecIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="22" height="16" rx="1.5" />
    <circle cx="10" cy="18" r="1.2" />
    <circle cx="10" cy="26" r="1.2" />
    <circle cx="24" cy="18" r="1.2" />
    <circle cx="24" cy="26" r="1.2" />
    <path d="M30 22h12M40 20l2 2-2 2" />
  </S>
);

// PLC: broken packet + patch
export const PlcPatchIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="14" height="12" rx="1" />
    <path d="M22 18h6v12h-6z" strokeDasharray="2 2" />
    <path d="M22 24h6" />
    <rect x="30" y="18" width="14" height="12" rx="1" />
    <path d="M22 12l6 4M22 36l6-4" />
  </S>
);

// FEC: redundancy XOR
export const FecIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="10" height="12" rx="1" />
    <rect x="19" y="18" width="10" height="12" rx="1" />
    <rect x="32" y="18" width="10" height="12" rx="1" />
    <path d="M37 14v4M37 30v4" />
    <text x="37" y="40" fontSize="6" stroke="none" fill="currentColor" textAnchor="middle">FEC</text>
  </S>
);

// Interleaving: vevet mønster
export const InterleavingIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 16l8 8-8 8M16 16l8 8-8 8M24 16l8 8-8 8M32 16l8 8-8 8" />
  </S>
);

// Playout-buffer (jitter): kø som drypper jevnt ut
export const PlayoutBufferIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="28" height="20" rx="1.5" />
    <rect x="9" y="17" width="5" height="14" />
    <rect x="16" y="20" width="5" height="11" />
    <rect x="23" y="17" width="5" height="14" />
    <path d="M34 24h8M40 22l2 2-2 2" />
  </S>
);

// Fixed playout buffer: låst
export const FixedBufferIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="20" width="28" height="16" rx="1.5" />
    <rect x="20" y="14" width="8" height="8" rx="1" />
    <circle cx="24" cy="28" r="2" />
  </S>
);

// Adaptive buffer: expand/contract arrows
export const AdaptiveBufferIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="18" width="28" height="14" rx="1.5" />
    <path d="M6 25h2M40 25h2" />
    <path d="M2 23l2 2-2 2M46 23l-2 2 2 2" />
  </S>
);

// VAD / silence suppression: muted mic
export const VadIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="20" y="10" width="8" height="16" rx="4" />
    <path d="M14 24a10 10 0 0020 0" />
    <line x1="24" y1="34" x2="24" y2="40" />
    <line x1="8" y1="8" x2="40" y2="40" />
  </S>
);

// Mund-til-øre: mouth -> ear
export const MouthToEarIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <path d="M14 24h20" strokeDasharray="2 2" />
    <path d="M32 18q6 0 6 6t-6 6q-2 0-2-2v-8" />
  </S>
);

// ============================================================
// 9.4 — RTP/RTCP
// ============================================================

// Bit-felt: små bokser med tall
export const BitFieldIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="8" rx="1" />
    <line x1="14" y1="20" x2="14" y2="28" />
    <line x1="22" y1="20" x2="22" y2="28" />
    <line x1="30" y1="20" x2="30" y2="28" />
    <text x="10" y="26" fontSize="5" stroke="none" fill="currentColor" textAnchor="middle">0</text>
    <text x="18" y="26" fontSize="5" stroke="none" fill="currentColor" textAnchor="middle">1</text>
    <text x="26" y="26" fontSize="5" stroke="none" fill="currentColor" textAnchor="middle">0</text>
    <text x="34" y="26" fontSize="5" stroke="none" fill="currentColor" textAnchor="middle">1</text>
  </S>
);

// Padding bit: rect med fylling
export const PaddingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="18" width="20" height="12" rx="1" />
    <rect x="28" y="18" width="12" height="12" rx="1" strokeDasharray="2 2" />
    <path d="M30 22l8 4M30 26l8-4" />
  </S>
);

// Extension bit: pil til vedlegg
export const ExtensionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="16" width="18" height="16" rx="1" />
    <path d="M24 24h6M28 22l2 2-2 2" />
    <rect x="32" y="16" width="12" height="16" rx="1" strokeDasharray="2 2" />
  </S>
);

// CSRC count: liste-teller
export const CsrcCountIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="10" width="20" height="6" rx="1" />
    <rect x="14" y="18" width="20" height="6" rx="1" />
    <rect x="14" y="26" width="20" height="6" rx="1" />
    <text x="44" y="22" fontSize="9" stroke="none" fill="currentColor" textAnchor="end" fontFamily="ui-monospace,monospace">n</text>
  </S>
);

// Marker bit: flagg
export const MarkerBitIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="14" y1="8" x2="14" y2="40" />
    <path d="M14 10h18l-4 6 4 6H14" />
  </S>
);

// Payload type: codec-tag
export const PayloadTypeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="14" width="32" height="20" rx="1.5" />
    <text x="24" y="28" fontSize="9" stroke="none" fill="currentColor" textAnchor="middle" fontFamily="ui-monospace,monospace">PT</text>
  </S>
);

// SEQ: ascending numbers
export const SeqNumIcon = (p: IconProps) => (
  <S {...p}>
    <text x="8" y="28" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">1</text>
    <text x="18" y="28" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">2</text>
    <text x="28" y="28" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">3</text>
    <text x="38" y="28" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">4</text>
    <path d="M6 36h36M40 34l2 2-2 2" />
  </S>
);

// Timestamp: stempel/klokke
export const TimestampIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="12" />
    <path d="M24 16v8l6 4" />
    <path d="M24 8v3M24 37v3M8 24h3M37 24h3" />
  </S>
);

// SSRC: unik ID-tag
export const SsrcIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="14" width="32" height="20" rx="2" />
    <text x="24" y="28" fontSize="8" stroke="none" fill="currentColor" textAnchor="middle" fontFamily="ui-monospace,monospace">0xA1B2</text>
  </S>
);

// CSRC list: mixer source list
export const CsrcListIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="16" r="3" />
    <circle cx="10" cy="24" r="3" />
    <circle cx="10" cy="32" r="3" />
    <path d="M14 16h6m-6 8h6m-6 8h6" />
    <rect x="22" y="14" width="20" height="20" rx="1.5" />
  </S>
);

// RTCP SR: report med NTP-klokke
export const RtcpSrIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="10" width="32" height="28" rx="2" />
    <text x="24" y="20" fontSize="7" stroke="none" fill="currentColor" textAnchor="middle" fontFamily="ui-monospace,monospace">SR</text>
    <circle cx="24" cy="28" r="5" />
    <path d="M24 24v4l3 2" />
  </S>
);

// RTCP RR: arrow back
export const RtcpRrIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="10" width="32" height="28" rx="2" />
    <text x="24" y="22" fontSize="7" stroke="none" fill="currentColor" textAnchor="middle" fontFamily="ui-monospace,monospace">RR</text>
    <path d="M14 32h20M16 30l-2 2 2 2" />
  </S>
);

// SDES: visit card
export const SdesIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="22" rx="2" />
    <circle cx="14" cy="22" r="3" />
    <path d="M11 30q3-3 6 0" />
    <path d="M22 20h16M22 24h12M22 28h14" />
  </S>
);

// BYE: door-out
export const ByeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="10" width="14" height="28" rx="1.5" />
    <circle cx="20" cy="24" r="1.2" fill="currentColor" />
    <path d="M28 24h14M38 22l4 2-4 2" />
  </S>
);

// APP: utility puzzle/extension
export const RtcpAppIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 14h8v6h6v8h-6v6h-8v-6h-6v-8h6z" />
    <text x="24" y="42" fontSize="6" stroke="none" fill="currentColor" textAnchor="middle">APP</text>
  </S>
);

// RTSP: remote control
export const RtspIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="8" width="20" height="32" rx="3" />
    <circle cx="24" cy="16" r="3" />
    <rect x="18" y="22" width="5" height="4" />
    <rect x="25" y="22" width="5" height="4" />
    <rect x="18" y="28" width="5" height="4" />
    <rect x="25" y="28" width="5" height="4" />
  </S>
);

// SRTP: lock on packet
export const SrtpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="14" rx="1.5" />
    <rect x="20" y="10" width="8" height="10" rx="1.5" />
    <path d="M22 14v-2a2 2 0 014 0v2" />
    <circle cx="24" cy="27" r="1.5" />
  </S>
);

// ============================================================
// 9.5 — QoS / DiffServ
// ============================================================

// IntServ / RSVP: reservasjons-billett
export const RsvpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M18 14v20M30 14v20" strokeDasharray="2 2" />
    <text x="24" y="27" fontSize="6" stroke="none" fill="currentColor" textAnchor="middle" fontFamily="ui-monospace,monospace">RSVP</text>
  </S>
);

// Soft-state refresh: cyclical arrow + clock
export const SoftStateIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="12" />
    <path d="M24 14v10l7 4" />
    <path d="M36 14l2 4-4 1" />
  </S>
);

// DiffServ: prioritetskøer
export const DiffservIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="14" height="6" />
    <rect x="6" y="20" width="14" height="6" />
    <rect x="6" y="30" width="14" height="6" />
    <path d="M20 13h12l4 8M20 23h16M20 33h12l4-8" />
    <path d="M40 21l2 2-2 2M40 27l2-2 2 2" />
  </S>
);

// DSCP: 6-bit code
export const DscpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="10" rx="1" />
    <line x1="12" y1="20" x2="12" y2="30" />
    <line x1="18" y1="20" x2="18" y2="30" />
    <line x1="24" y1="20" x2="24" y2="30" />
    <line x1="30" y1="20" x2="30" y2="30" />
    <line x1="36" y1="20" x2="36" y2="30" />
    <text x="24" y="14" fontSize="6" stroke="none" fill="currentColor" textAnchor="middle">DSCP</text>
  </S>
);

// EF: rocket / priority
export const ExpeditedIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 34l8-20 8 20-8-4z" />
    <circle cx="22" cy="22" r="1.5" />
    <path d="M30 38l4 4M18 38l-4 4" />
  </S>
);

// AF: balanced 4-class grid
export const AssuredIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="8" width="14" height="14" />
    <rect x="26" y="8" width="14" height="14" />
    <rect x="8" y="26" width="14" height="14" />
    <rect x="26" y="26" width="14" height="14" />
  </S>
);

// BE / Best-effort: default
export const BeDefaultIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="18" width="32" height="12" rx="1" />
    <text x="24" y="27" fontSize="7" stroke="none" fill="currentColor" textAnchor="middle">BE</text>
    <path d="M8 38h32" strokeDasharray="1 2" />
  </S>
);

// Marking: stempel/tag pakke
export const MarkingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="18" width="24" height="14" rx="1" />
    <path d="M32 22l8 0v6l-3-3z" />
    <circle cx="36" cy="25" r="1" />
  </S>
);

// Policing: politi-skilt
export const PolicingIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 8l12 4v10c0 8-5 14-12 18-7-4-12-10-12-18V12z" />
    <text x="24" y="26" fontSize="8" stroke="none" fill="currentColor" textAnchor="middle">P</text>
  </S>
);

// Shaping: jevn ut puls
export const ShapingIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 30l3-12 3 12 4-6 4 6" />
    <path d="M20 30h6" />
    <path d="M28 24h14" />
    <path d="M26 30l2-3 2 3" />
  </S>
);

// Leaky bucket
export const LeakyBucketIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 14h20l-3 20h-14z" />
    <path d="M22 36v6M22 42l-2-2M22 42l2-2" />
  </S>
);

// Token bucket
export const TokenBucketIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M12 16h24l-3 22h-18z" />
    <circle cx="18" cy="24" r="2" />
    <circle cx="24" cy="28" r="2" />
    <circle cx="30" cy="24" r="2" />
    <path d="M22 8v6M28 8v6" />
  </S>
);

// Priority queueing: priority lane
export const PriorityQueueIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="32" height="8" rx="1" />
    <rect x="6" y="22" width="32" height="8" rx="1" strokeDasharray="2 2" />
    <rect x="6" y="34" width="32" height="6" rx="1" strokeDasharray="2 2" />
    <path d="M40 14h4" />
  </S>
);

// WFQ: weighted lanes
export const WfqIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="32" height="6" rx="1" />
    <text x="42" y="15" fontSize="6" stroke="none" fill="currentColor">3</text>
    <rect x="6" y="20" width="32" height="6" rx="1" />
    <text x="42" y="25" fontSize="6" stroke="none" fill="currentColor">2</text>
    <rect x="6" y="30" width="32" height="6" rx="1" />
    <text x="42" y="35" fontSize="6" stroke="none" fill="currentColor">1</text>
  </S>
);

// RED: tilfeldig drop
export const RedDropIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="6" height="8" />
    <rect x="14" y="20" width="6" height="8" strokeDasharray="2 2" />
    <rect x="22" y="20" width="6" height="8" />
    <rect x="30" y="20" width="6" height="8" strokeDasharray="2 2" />
    <path d="M20 32l-2 4M28 32l-2 4M36 32l-2 4" />
  </S>
);

// Admission control: bom
export const AdmissionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="22" width="28" height="4" />
    <line x1="10" y1="22" x2="10" y2="40" />
    <line x1="14" y1="26" x2="14" y2="40" strokeDasharray="2 2" />
    <circle cx="38" cy="24" r="2" fill="currentColor" />
  </S>
);

// SLA: kontrakt-dokument
export const SlaIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 8h20l8 8v24H10z" />
    <path d="M30 8v8h8" />
    <path d="M14 26h20M14 30h20M14 34h14" />
  </S>
);
