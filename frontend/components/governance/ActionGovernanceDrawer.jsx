'use client';

import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, AlertTriangle, CheckCircle2, Sliders,
  RefreshCw, Bot, UserCheck, Lock, Sparkles, FileText
} from 'lucide-react';

export default function ActionGovernanceDrawer({
  isOpen = false,
  onClose = () => {},
  actionData = null,
  onConfirmAction = () => {},
  onToast = () => {}
}) {
  const [loading, setLoading] = useState(false);
  const [overrideReason, setOverrideReason] = useState('vip_priority');
  const [assignedStaff, setAssignedStaff] = useState('Elena Rostova (Front Desk)');
  const [autoApprovalToggle, setAutoApprovalToggle] = useState(true);
  const [requireDoubleSign, setRequireDoubleSign] = useState(false);
  const [customManagerNotes, setCustomManagerNotes] = useState('');

  // Simulate skeleton fetching when actionData changes or opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen, actionData]);

  if (!isOpen) return null;

  const handleApprove = () => {
    onConfirmAction({
      status: 'APPROVED',
      overrideReason,
      assignedStaff,
      autoApprovalToggle,
      notes: customManagerNotes,
    });
    onToast({
      type: 'success',
      title: 'Action Governance Approved',
      message: `Authorized ${actionData?.title || 'Room 505 VIP Swap'} for execution.`,
    });
    onClose();
  };

  const handleReject = () => {
    onConfirmAction({
      status: 'REJECTED',
      notes: customManagerNotes,
    });
    onToast({
      type: 'warning',
      title: 'Action Vetoed by Duty Manager',
      message: `Execution cancelled for ${actionData?.title || 'Proposed AI Action'}.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay Backdrop: Simple bg-black/20 without heavy blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Right-Side Pure White Slide-Over Drawer */}
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between border-l border-border transform transition-transform duration-300 ease-in-out">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-border bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-odoo-purple/10 text-odoo-purple flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    Action Governance Console
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-odoo-teal/10 text-odoo-teal border border-odoo-teal/20">
                    Odoo OS
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Human-in-the-Loop Duty Manager Authorization
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            
            {/* SKELETON LOADER STATE */}
            {loading ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-gray-200 animate-pulse rounded-xl" />
                  <div className="h-8 w-full bg-gray-200 animate-pulse rounded-xl" />
                </div>

                <div className="p-4 rounded-2xl bg-gray-100 space-y-3">
                  <div className="h-5 w-40 bg-gray-200 animate-pulse rounded-xl" />
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded-xl" />
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-xl" />
                </div>

                <div className="space-y-4">
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded-xl" />
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded-xl" />
                  <div className="h-16 w-full bg-gray-200 animate-pulse rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                {/* Proposed Action Overview Card */}
                <div className="bg-surface-secondary/70 rounded-2xl p-5 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-odoo-purple tracking-wider">
                      Proposed Swarm Action
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      High Confidence (98.4%)
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-foreground">
                    {actionData?.title || 'Move VIP Alexander Vance → Room 505'}
                  </h4>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {actionData?.description || 'Reassigns Diamond VIP guest to Suite 505 to bypass Room 401 HVAC repair delay while protecting Floor 4 group block revenue.'}
                  </p>

                  <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono">
                      Impact: Zero Yield Loss
                    </span>
                    <span className="font-accent text-sm font-bold text-odoo-purple">
                      VIP Satisfaction Protected
                    </span>
                  </div>
                </div>

                {/* ODOO FORM STYLE CONTROLS */}
                <div className="space-y-6">
                  {/* Underline Style Input 1: Governance Override Reason */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      Governance Approval Basis
                    </label>
                    <select
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-gray-200 focus:border-odoo-teal focus:outline-none py-2 text-xs text-foreground font-medium transition-colors cursor-pointer"
                    >
                      <option value="vip_priority">VIP Guest Experience Recovery (Priority 1)</option>
                      <option value="maintenance_safety">Engineering &amp; HVAC Safety Exemption</option>
                      <option value="group_revenue_lock">Revenue ADR Protection Lock</option>
                      <option value="duty_manager_override">Duty Manager Direct Executive Discretion</option>
                    </select>
                  </div>

                  {/* Underline Style Input 2: Assigned Staff Member */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      Assigned Execution Manager
                    </label>
                    <select
                      value={assignedStaff}
                      onChange={(e) => setAssignedStaff(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-gray-200 focus:border-odoo-teal focus:outline-none py-2 text-xs text-foreground font-medium transition-colors cursor-pointer"
                    >
                      <option value="Elena Rostova (Front Desk)">Elena Rostova — Front Desk Manager</option>
                      <option value="Dave Kowalski (Engineering)">Dave Kowalski — Lead Maintenance Engineer</option>
                      <option value="Maria Santos (Housekeeping)">Maria Santos — Housekeeping Supervisor</option>
                      <option value="Self (Duty Manager)">Duty Manager Direct Execution</option>
                    </select>
                  </div>

                  {/* Subtle Gray Container Box Switch 1: Auto-Approval Rule */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-gray-300">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground block">
                        Save as Autonomous Auto-Approve Rule
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        Allow AI Swarm to auto-execute similar VIP swaps under 15 mins
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAutoApprovalToggle(!autoApprovalToggle)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                        autoApprovalToggle ? 'bg-odoo-teal' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          autoApprovalToggle ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Subtle Gray Container Box Switch 2: Dual Signature Governance */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-gray-300">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground block">
                        Require Dual-Manager Signature
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        Enforce secondary sign-off for financial comps exceeding $200
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRequireDoubleSign(!requireDoubleSign)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                        requireDoubleSign ? 'bg-odoo-purple' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          requireDoubleSign ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Manager Direct Notes (Underline + Handwritten Preview) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      Duty Manager Custom Log Notes
                    </label>
                    <input
                      type="text"
                      value={customManagerNotes}
                      onChange={(e) => setCustomManagerNotes(e.target.value)}
                      placeholder="e.g. Approved. Offer complimentary champagne amenity in lounge..."
                      className="w-full bg-transparent border-b-2 border-gray-200 focus:border-odoo-teal focus:outline-none py-2 text-xs text-foreground placeholder:text-gray-400 font-medium transition-colors"
                    />

                    {customManagerNotes && (
                      <p className="font-accent text-base font-bold text-odoo-purple pt-1">
                        &ldquo;{customManagerNotes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-border bg-white flex items-center justify-between gap-3">
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all disabled:opacity-50"
            >
              Veto / Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all"
              >
                Close
              </button>

              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-5 py-2.5 rounded-2xl bg-odoo-teal hover:bg-odoo-teal/90 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorize AI Action</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
