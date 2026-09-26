import React from 'react';

interface SvgFixturePreviewProps {
  type: string;
  className?: string;
}

export const SvgFixturePreview: React.FC<SvgFixturePreviewProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'hvac-hazard':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-[#210124] border border-[#E55934]/60 p-4 shadow-sm ${className}`}>
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#E55934] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2C14E] animate-ping" />
            Safety Critical
          </div>
          <svg viewBox="0 0 400 240" className="w-full h-48 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ceiling drywall cutaway */}
            <rect x="20" y="20" width="360" height="200" rx="8" fill="#2E0E32" stroke="#CCDAD1" strokeWidth="1.5" />
            <path d="M20 70 H380" stroke="#CCDAD1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
            <text x="32" y="45" fill="#CCDAD1" fontSize="12" fontFamily="monospace">CEILING AIR CAVITY - ROOM 412</text>
            
            {/* HVAC Plenum */}
            <rect x="50" y="80" width="180" height="110" rx="4" fill="#0E4749" stroke="#CCDAD1" strokeWidth="1.5" />
            <line x1="60" y1="100" x2="220" y2="100" stroke="#CCDAD1" strokeWidth="1.5" opacity="0.6" />
            <line x1="60" y1="120" x2="220" y2="120" stroke="#CCDAD1" strokeWidth="1.5" opacity="0.6" />
            <line x1="60" y1="140" x2="220" y2="140" stroke="#CCDAD1" strokeWidth="1.5" opacity="0.6" />
            <line x1="60" y1="160" x2="220" y2="160" stroke="#CCDAD1" strokeWidth="1.5" opacity="0.6" />
            <text x="65" y="96" fill="#F2C14E" fontSize="10" fontFamily="monospace" fontWeight="bold">CARRIER 30XA COIL</text>

            {/* Split PVC Drain Line */}
            <path d="M190 170 C190 190, 240 190, 250 160" stroke="#E55934" strokeWidth="6" fill="none" />
            <circle cx="225" cy="188" r="6" fill="#E55934" className="animate-pulse" />
            <text x="238" y="196" fill="#E55934" fontSize="10" fontFamily="monospace" fontWeight="bold">RUPTURE (DRIP)</text>

            {/* Water Drip Cascade */}
            <path d="M225 195 L225 210" stroke="#F2C14E" strokeWidth="3" strokeDasharray="3 3" />
            <circle cx="225" cy="215" r="4" fill="#F2C14E" className="animate-bounce" />

            {/* Electrical Conduit Junction Box */}
            <rect x="270" y="140" width="90" height="60" rx="4" fill="#0E4749" stroke="#F2C14E" strokeWidth="2" />
            <text x="278" y="160" fill="#F2C14E" fontSize="9" fontFamily="monospace" fontWeight="bold">220V JUNCTION</text>
            <path d="M250 175 L270 175" stroke="#E55934" strokeWidth="2" strokeDasharray="2 2" />
            
            {/* Spark Hazard Arc */}
            <path d="M265 170 L275 165 L270 180 L280 172" stroke="#F2C14E" strokeWidth="2.5" fill="none" className="animate-pulse" />
          </svg>
          <div className="text-xs text-[#CCDAD1] font-mono mt-1 text-center font-medium">
            Detected: Ruptured PVC line spraying water onto live 220V junction box
          </div>
        </div>
      );

    case 'blur-hazard':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-[#210124] border border-[#F2C14E]/60 p-4 shadow-sm ${className}`}>
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F2C14E] text-[#210124] text-[10px] font-mono font-bold uppercase tracking-wider">
            Confidence &lt; 0.6 Guardrail
          </div>
          <svg viewBox="0 0 400 240" className="w-full h-48 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="360" height="200" rx="8" fill="#2E0E32" stroke="#CCDAD1" strokeWidth="1.5" />
            {/* Motion Blur / Low Light Filter */}
            <defs>
              <filter id="heavyBlur" x="0" y="0">
                <feGaussianBlur in="SourceGraphic" stdDeviation="9" />
              </filter>
            </defs>
            <g filter="url(#heavyBlur)">
              <rect x="90" y="70" width="220" height="120" rx="20" fill="#0E4749" />
              <circle cx="200" cy="130" r="40" fill="#CCDAD1" />
              <path d="M140 130 H260" stroke="#F2C14E" strokeWidth="16" />
              <rect x="180" y="50" width="40" height="130" fill="#E55934" />
            </g>
            <text x="80" y="110" fill="#CCDAD1" fontSize="14" fontFamily="monospace" opacity="0.8">LOW-LIGHT CAMERA 0.3MP</text>
            <text x="60" y="145" fill="#F2C14E" fontSize="12" fontFamily="monospace" fontWeight="bold">OPTICAL CONFIDENCE: 0.44</text>
            <text x="65" y="165" fill="#CCDAD1" fontSize="10" fontFamily="monospace" fontWeight="semibold">HUMAN REVIEW ESCALATION MANDATED</text>
          </svg>
          <div className="text-xs text-[#F2C14E] font-mono mt-1 text-center font-semibold">
            Guardrail: Part fabrication strictly prohibited when confidence &lt; 0.60
          </div>
        </div>
      );

    case 'faucet-leak':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-[#210124] border border-[#0E4749]/60 p-4 shadow-sm ${className}`}>
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0E4749] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
            Guest-Facing Triage
          </div>
          <svg viewBox="0 0 400 240" className="w-full h-48 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="360" height="200" rx="8" fill="#2E0E32" stroke="#CCDAD1" strokeWidth="1.5" />
            <text x="32" y="45" fill="#CCDAD1" fontSize="12" fontFamily="monospace">VILLA 14 - MASTER BATH VANITY</text>
            {/* Countertop */}
            <rect x="40" y="170" width="320" height="30" rx="4" fill="#0E4749" stroke="#CCDAD1" strokeWidth="1.5" />
            {/* Basin Faucet Neck */}
            <path d="M170 170 V100 C170 65, 230 65, 230 110 V130" stroke="#CCDAD1" strokeWidth="18" strokeLinecap="round" />
            <path d="M170 170 V100 C170 65, 230 65, 230 110 V130" stroke="#0E4749" strokeWidth="12" strokeLinecap="round" />
            {/* Mixer Lever */}
            <path d="M165 95 L130 80" stroke="#F2C14E" strokeWidth="7" strokeLinecap="round" />
            {/* Base Escutcheon Ring with Fracture */}
            <rect x="150" y="156" width="40" height="16" rx="2" fill="#CCDAD1" stroke="#0E4749" strokeWidth="1" />
            <line x1="162" y1="158" x2="168" y2="170" stroke="#E55934" strokeWidth="2.5" />
            <circle cx="166" cy="174" r="3" fill="#F2C14E" />
            <text x="210" y="165" fill="#E55934" fontSize="10" fontFamily="monospace" fontWeight="bold">COLLAR CRACK</text>
            <text x="210" y="180" fill="#F2C14E" fontSize="9" fontFamily="monospace" fontWeight="bold">SEEPAGE 2 DROPS/MIN</text>
          </svg>
          <div className="text-xs text-[#CCDAD1] font-mono mt-1 text-center font-medium">
            Identified: Hansgrohe Basin Mixer #M2 Cartridge Fracture
          </div>
        </div>
      );

    case 'lock-hazard':
    default:
      return (
        <div className={`relative overflow-hidden rounded-xl bg-[#210124] border border-[#E55934]/60 p-4 shadow-sm ${className}`}>
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#E55934] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
            Safety Hazard
          </div>
          <svg viewBox="0 0 400 240" className="w-full h-48 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="360" height="200" rx="8" fill="#2E0E32" stroke="#CCDAD1" strokeWidth="1.5" />
            <text x="32" y="45" fill="#CCDAD1" fontSize="12" fontFamily="monospace">BALCONY GLASS SLIDER - 6TH FLOOR</text>
            <rect x="80" y="60" width="100" height="140" fill="#0E4749" stroke="#CCDAD1" strokeWidth="1.5" />
            <rect x="220" y="60" width="100" height="140" fill="#0E4749" stroke="#CCDAD1" strokeWidth="1.5" />
            {/* Locking mechanism in jamb */}
            <rect x="180" y="100" width="40" height="70" fill="#210124" stroke="#E55934" strokeWidth="2" />
            <line x1="190" y1="120" x2="210" y2="135" stroke="#E55934" strokeWidth="3.5" />
            <circle cx="200" cy="128" r="4" fill="#F2C14E" className="animate-ping" />
            <text x="140" y="190" fill="#E55934" fontSize="10" fontFamily="monospace" fontWeight="bold">SHEARED HOOK PIN</text>
            <text x="115" y="205" fill="#F2C14E" fontSize="9" fontFamily="monospace" fontWeight="bold">HIGH WIND FALL RISK • LOCKOUT REQUIRED</text>
          </svg>
          <div className="text-xs text-[#E55934] font-mono mt-1 text-center font-semibold">
            Perimeter Security Failure: Sliding Door Cannot Latch
          </div>
        </div>
      );
  }
};
