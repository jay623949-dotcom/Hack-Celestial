import React from 'react';
import { BookOpen, Code, ShieldCheck, X } from 'lucide-react';

interface SchemaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaGuideModal: React.FC<SchemaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#210124]/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-[#0E4749]/30 bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#0E4749]/20 bg-[#0E4749] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#F2C14E]" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Smart Resort 360 • System Architecture & Schema Specification
              </h3>
              <p className="text-xs text-[#CCDAD1]">
                Autonomous Multi-Agent Operating System Intelligence Engine Contract
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#CCDAD1] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#210124] font-sans leading-relaxed scrollbar-thin bg-[#CCDAD1]/20">
          {/* Persona Axis */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0E4749] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0E4749]" />
              1. Persona Axis × Value × Sentiment Matrix
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white border border-[#0E4749]/20 shadow-sm">
                <span className="text-[#0E4749] font-bold block mb-1.5">8 Fixed Persona Labels:</span>
                <ul className="space-y-1 text-[#210124]/80">
                  <li>• <strong className="text-[#210124]">Frugal:</strong> Price-sensitive, deals/coupons</li>
                  <li>• <strong className="text-[#210124]">Luxury:</strong> Upgrades, exclusivity, spend willing</li>
                  <li>• <strong className="text-[#210124]">Business:</strong> Speed, Wi-Fi, quiet, meeting schedules</li>
                  <li>• <strong className="text-[#210124]">Family:</strong> Children, groups, pack-and-play</li>
                  <li>• <strong className="text-[#210124]">Loyalist:</strong> Repeat stays, high membership tier</li>
                  <li>• <strong className="text-[#210124]">Demanding:</strong> Stacked multiple requests</li>
                  <li>• <strong className="text-[#210124]">Influencer:</strong> Social reach, vlogging, aesthetics</li>
                  <li>• <strong className="text-[#210124]">Quiet:</strong> Minimal signal (true default only)</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#0E4749]/20 shadow-sm">
                <span className="text-[#E55934] font-bold block mb-1.5">Value × Sentiment Matrix (6 Cells):</span>
                <p className="text-[#210124]/85 mb-2">
                  Value Tier: <span className="text-[#0E4749] font-bold">Standard | VIP</span>
                  <br />
                  Sentiment: <span className="text-[#0E4749] font-bold">Positive</span> |{' '}
                  <span className="text-[#F2C14E] font-bold">Neutral</span> |{' '}
                  <span className="text-[#E55934] font-bold">At-Risk</span>
                </p>
                <div className="text-[11px] text-[#210124]/80 space-y-1">
                  <p>• <strong>At-Risk triggers:</strong> Flight delay, lost booking, frustration, stacked urgency.</p>
                  <p>• <strong>VIP triggers:</strong> Membership tier, high spend, or high-stakes trip reason. Never inferred from persona alone.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Strict Operational Guardrails */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E55934] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E55934]" />
              2. System Guardrails
            </h4>
            <div className="p-3.5 rounded-xl bg-white border border-[#E55934]/30 space-y-1.5 font-mono text-[11px] shadow-sm">
              <div>1. <strong className="text-[#210124]">Never Fabricate IDs:</strong> If guest_id, room_id, or work_order_id is absent, return null and set requires_human_review.</div>
              <div>2. <strong className="text-[#210124]">Default fault_free: false:</strong> Never mark fault_free: true unless explicitly verified. Gates guest room assignment safety.</div>
              <div>3. <strong className="text-[#210124]">Confidence &lt; 0.60 Prohibition:</strong> If image confidence &lt; 0.60, never fabricate model/part. Set requires_human_review: true.</div>
              <div>4. <strong className="text-[#210124]">Unsuppressable Safety Actions:</strong> Safety-severity issues must always trigger immediate room_lockout and emergency work_order_card.</div>
              <div>5. <strong className="text-[#210124]">Checked-In Flash Target:</strong> Flash sales are strictly restricted to checked-in guests only.</div>
            </div>
          </div>

          {/* 5 Schema Specifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0E4749] flex items-center gap-2">
              <Code className="w-4 h-4 text-[#0E4749]" />
              3. The 5 JSON Event Schemas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-white border border-[#0E4749]/20 shadow-sm">
                <span className="text-[#0E4749] font-bold block">1. GUEST_INTAKE_RESULT</span>
                <p className="text-[#210124]/80 text-[11px] mt-1">
                  guest_id, persona_label, value_sentiment_cell, extracted_preferences, ui_actions (sentiment_badge, service_recovery_panel), reasoning.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#0E4749]/20 shadow-sm">
                <span className="text-[#E55934] font-bold block">2. MAINTENANCE_CV_RESULT</span>
                <p className="text-[#210124]/80 text-[11px] mt-1">
                  room_id, confidence_score, requires_human_review, identified_asset, visible_issue, severity, ui_actions (room_lockout, work_order_card), reasoning.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#0E4749]/20 shadow-sm">
                <span className="text-[#E55934] font-bold block">3. COST_INCIDENT_SUMMARY</span>
                <p className="text-[#210124]/80 text-[11px] mt-1">
                  source_work_order_id, estimated_cost_impact, affects_room_ids, ui_actions (net_revpar_ticker recalculate), reasoning.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#0E4749]/20 shadow-sm">
                <span className="text-[#0E4749] font-bold block">4. FLASH_SALE_OFFER</span>
                <p className="text-[#210124]/80 text-[11px] mt-1">
                  asset, expires_in_minutes, target_guest_ids, persona_framing (Frugal, Luxury, Business, Family), ui_actions (flash_sale_push), reasoning.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#0E4749]/20 shadow-sm md:col-span-2">
                <span className="text-[#0E4749] font-bold block">5. HOUSEKEEPING_REORDER</span>
                <p className="text-[#210124]/80 text-[11px] mt-1">
                  trigger_reason, reordered_queue (room_id, new_priority_rank, reason), ui_actions (housekeeping_kanban, room_ready_eta_badge), reasoning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#0E4749]/20 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0E4749] hover:bg-[#E55934] text-white text-xs font-mono font-bold transition-colors shadow-sm"
          >
            Close Specification Guide
          </button>
        </div>
      </div>
    </div>
  );
};
