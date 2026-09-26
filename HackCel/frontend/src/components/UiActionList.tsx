import React from 'react';
import { ArrowRight, BellRing, DoorClosed, LayoutList, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import { UiAction } from '../types/schemas';

interface UiActionListProps {
  actions: UiAction[];
  title?: string;
}

export const UiActionList: React.FC<UiActionListProps> = ({
  actions,
  title = 'Dispatched UI Actions',
}) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  const getActionIcon = (component: string) => {
    switch (component) {
      case 'sentiment_badge':
        return <Sparkles className="w-4 h-4 text-[#F2CC8F]" />;
      case 'service_recovery_panel':
        return <BellRing className="w-4 h-4 text-[#E07A5F]" />;
      case 'room_lockout':
        return <DoorClosed className="w-4 h-4 text-[#E07A5F]" />;
      case 'work_order_card':
        return <ShieldAlert className="w-4 h-4 text-[#81B29A]" />;
      case 'net_revpar_ticker':
        return <TrendingDown className="w-4 h-4 text-[#E07A5F]" />;
      case 'flash_sale_push':
        return <Sparkles className="w-4 h-4 text-[#F2CC8F]" />;
      case 'housekeeping_kanban':
      case 'room_ready_eta_badge':
      default:
        return <LayoutList className="w-4 h-4 text-[#81B29A]" />;
    }
  };

  return (
    <div className="rounded-xl border border-[#3D405B]/15 bg-[#FAF8EE] p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#3D405B]/15">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-[#81B29A]" />
          {title} ({actions.length})
        </h4>
        <span className="text-[10px] font-mono font-semibold text-[#3D405B]/70">Agent Bus Dispatched</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((act, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-white border border-[#3D405B]/15 p-3 hover:border-[#81B29A] transition-colors shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[#FAF8EE] border border-[#3D405B]/15">
                  {getActionIcon(act.component)}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-[#3D405B]">
                    {act.component}
                  </span>
                  <div className="text-[10px] font-mono text-[#81B29A] uppercase font-semibold">
                    Action: {act.action}
                  </div>
                </div>
              </div>

              {act.payload?.fault_free !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    act.payload.fault_free
                      ? 'bg-[#81B29A] text-white'
                      : 'bg-[#E07A5F] text-white'
                  }`}
                >
                  fault_free: {String(act.payload.fault_free)}
                </span>
              )}

              {act.payload?.color && (
                <span
                  className={`w-3 h-3 rounded-full border border-[#3D405B]/20 ${
                    act.payload.color === 'green'
                      ? 'bg-[#81B29A]'
                      : act.payload.color === 'red'
                      ? 'bg-[#E07A5F]'
                      : 'bg-[#F2CC8F]'
                  }`}
                  title={`Sentiment color: ${act.payload.color}`}
                />
              )}
            </div>

            {/* Payload summary */}
            <div className="bg-[#3D405B] text-[#F4F1DE] rounded p-2 text-[11px] font-mono overflow-x-auto border border-[#3D405B]/40">
              <pre>{JSON.stringify(act.payload, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
