import React, { useState } from 'react';
import {
  Clock,
  DollarSign,
  Gift,
  Play,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react';
import { FLASH_SALE_ASSETS, INITIAL_GUESTS, PerishableAssetScenario } from '../data/benchmarks';
import { callFlashSale } from '../services/apiClient';
import { FlashSaleOffer, GuestRecord } from '../types/schemas';
import { JsonViewer } from './JsonViewer';
import { UiActionList } from './UiActionList';

interface FlashSaleStudioProps {
  onEventDispatched: (event: FlashSaleOffer) => void;
  checkedInGuests?: GuestRecord[];
}

export const FlashSaleStudio: React.FC<FlashSaleStudioProps> = ({
  onEventDispatched,
  checkedInGuests = INITIAL_GUESTS,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<PerishableAssetScenario>(FLASH_SALE_ASSETS[0]);
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(
    FLASH_SALE_ASSETS[0].expires_in_minutes
  );
  const [discountedPrice, setDiscountedPrice] = useState<number>(
    FLASH_SALE_ASSETS[0].discounted_price
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FlashSaleOffer | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | undefined>();

  // Filter strictly to checked-in guests per guardrail!
  const eligibleGuests = checkedInGuests.filter((g) => g.checkInStatus === 'Checked-In');

  const handleSelectAsset = (asset: PerishableAssetScenario) => {
    setSelectedAsset(asset);
    setExpiresInMinutes(asset.expires_in_minutes);
    setDiscountedPrice(asset.discounted_price);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const res = await callFlashSale({
        asset: selectedAsset.asset,
        expires_in_minutes: expiresInMinutes,
        checked_in_guests: eligibleGuests,
        discounted_price: discountedPrice,
      });
      setResult(res.result);
      setLatencyMs(res.latencyMs);
      onEventDispatched(res.result);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#FAF8EE] border border-[#3D405B]/15 text-[#3D405B] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#3D405B] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#81B29A]" />
            Revenue Dynamic Flash Sale & Perishable Asset Yield Pipeline
          </h3>
          <p className="text-xs text-[#3D405B]/75 mt-0.5">
            Micro-auctions for unbooked spa slots, cabanas, and private cruises with automated 4-way persona framing (Frugal, Luxury, Business, Family).
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#3D405B] bg-[#F2CC8F] px-3 py-1.5 rounded-lg shadow-xs">
          <Users className="w-3.5 h-3.5" />
          <span>Checked-In Guests Guardrail Enforced</span>
        </div>
      </div>

      {/* Asset Presets */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] mb-2">
          Select Expiring Resort Inventory Asset
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FLASH_SALE_ASSETS.map((asset) => {
            const isSelected = selectedAsset.id === asset.id;
            return (
              <button
                key={asset.id}
                onClick={() => handleSelectAsset(asset)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-white border-[#81B29A] shadow-sm ring-2 ring-[#81B29A]'
                    : 'bg-white border-[#3D405B]/15 hover:border-[#81B29A] hover:bg-[#FAF8EE]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4F1DE] text-[#3D405B] font-bold">
                    Expires in {asset.expires_in_minutes}m
                  </span>
                  <div className="text-xs font-mono">
                    <span className="line-through text-[#3D405B]/50 mr-1.5">${asset.original_price}</span>
                    <span className="text-[#81B29A] font-bold">${asset.discounted_price}</span>
                  </div>
                </div>

                <div className="text-xs font-bold text-[#3D405B] line-clamp-1">{asset.asset}</div>
                <p className="text-[11px] text-[#3D405B]/75 mt-1 line-clamp-2 leading-tight">
                  {asset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Guest Roster & Pricing Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Checked-in Target Audience */}
        <div className="lg:col-span-5 rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#81B29A]" />
              Eligible Target Audience ({eligibleGuests.length})
            </span>
            <span className="text-[10px] font-mono font-bold text-[#81B29A]">Status: Checked-In Only</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {eligibleGuests.map((g) => (
              <div
                key={g.id}
                className="p-2.5 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15 text-xs font-mono flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#3D405B] flex items-center gap-2">
                    <span>{g.name}</span>
                    <span className="text-[10px] text-[#81B29A]">({g.id})</span>
                  </div>
                  <div className="text-[10px] text-[#3D405B]/70 mt-0.5">
                    {g.roomNumber} • Tier: {g.vipTier}
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2CC8F] text-[#3D405B]">
                  {g.persona || 'Standard'}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-[#3D405B]/70 font-mono">
            *Guardrail Check: Non-checked-in guest G-8802 (Arriving) is strictly excluded from target_guest_ids.
          </p>
        </div>

        {/* Right: Yield Controls */}
        <div className="lg:col-span-7 rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B]">
              Yield Optimization Parameters
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3D405B] mb-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#81B29A]" />
                  Flash Expiration (Minutes)
                </label>
                <input
                  type="number"
                  value={expiresInMinutes}
                  onChange={(e) => setExpiresInMinutes(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/20 text-xs font-mono text-[#3D405B] font-semibold focus:outline-none focus:border-[#81B29A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D405B] mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-[#81B29A]" />
                  Flash Offer Price ($)
                </label>
                <input
                  type="number"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/20 text-xs font-mono text-[#3D405B] font-semibold focus:outline-none focus:border-[#81B29A]"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15 text-xs font-mono space-y-1.5">
              <span className="text-[#3D405B] font-bold block">4-Way Behavioral Copy Framings:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#3D405B]/85">
                <div>• <strong className="text-[#3D405B]">Frugal:</strong> Value-bundle framing</div>
                <div>• <strong className="text-[#3D405B]">Luxury:</strong> Exclusivity framing</div>
                <div>• <strong className="text-[#3D405B]">Business:</strong> Express / minimal</div>
                <div>• <strong className="text-[#3D405B]">Family:</strong> Flexible / kid-friendly</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#3D405B]/15 flex items-center justify-between">
            <button
              onClick={() => handleSelectAsset(selectedAsset)}
              className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#3D405B]/70 hover:text-[#81B29A]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Asset
            </button>

            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#81B29A] hover:bg-[#6D9E86] text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Persona Copies...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Emit FLASH_SALE_OFFER</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Persona Framed Copy Cards */}
          <div className="rounded-xl border border-[#3D405B]/15 bg-white p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D405B] flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#81B29A]" />
              Generated Persona-Framed Copy Variants
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15">
                <span className="text-[10px] font-mono text-[#81B29A] font-bold uppercase block mb-1">
                  [Frugal] Persona Copy:
                </span>
                <p className="text-xs text-[#3D405B] italic">"{result.persona_framing.Frugal}"</p>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15">
                <span className="text-[10px] font-mono text-[#E07A5F] font-bold uppercase block mb-1">
                  [Luxury] Persona Copy:
                </span>
                <p className="text-xs text-[#3D405B] italic">"{result.persona_framing.Luxury}"</p>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15">
                <span className="text-[10px] font-mono text-[#81B29A] font-bold uppercase block mb-1">
                  [Family] Persona Copy:
                </span>
                <p className="text-xs text-[#3D405B] italic">"{result.persona_framing.Family}"</p>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8EE] border border-[#3D405B]/15">
                <span className="text-[10px] font-mono text-[#3D405B]/70 font-bold uppercase block mb-1">
                  [Business] Persona Copy (Minimal/Low Receptivity):
                </span>
                <p className="text-xs text-[#3D405B]/80 italic">"{result.persona_framing.Business}"</p>
              </div>
            </div>
          </div>

          <UiActionList actions={result.ui_actions} title="Guest Push Notifications Dispatched" />

          <JsonViewer
            data={result}
            title="FLASH_SALE_OFFER (JSON Schema #4)"
            eventType="FLASH_SALE_OFFER"
            latencyMs={latencyMs}
          />
        </div>
      )}
    </div>
  );
};
