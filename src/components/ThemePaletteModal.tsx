import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import { ThemePalette } from '../types';
import { THEME_PALETTES } from '../utils/themePalettes';

interface ThemePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: ThemePalette;
  onSelectPalette: (palette: ThemePalette) => void;
}

export const ThemePaletteModal: React.FC<ThemePaletteModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  onSelectPalette,
}) => {
  if (!isOpen) return null;

  const activeConfig = THEME_PALETTES.find(p => p.id === currentPalette) || THEME_PALETTES[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="w-full max-w-md max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#191611]/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#F5D77F]">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#F5D77F] leading-tight">
                  Prestige Palettes & Themes
                </h2>
                <p className="text-[11px] text-[#9E9689]">
                  Live aesthetic theme switcher
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#9E9689] hover:text-[#EDE8D0] hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Palette List */}
          <div className="p-4 overflow-y-auto space-y-3 max-h-[calc(90vh-130px)]">
            {/* Live Indicator Banner */}
            <div
              className="p-3 rounded-2xl border flex items-center justify-between transition-all duration-300"
              style={{
                backgroundColor: activeConfig.cardSurfaceHex,
                borderColor: activeConfig.accentGoldHex,
              }}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4" style={{ color: activeConfig.accentGoldHex }} />
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: activeConfig.accentSecondaryHex }}>
                    Active Aura
                  </div>
                  <div className="text-xs font-bold font-display" style={{ color: activeConfig.textPrimaryHex }}>
                    {activeConfig.name} ({activeConfig.tagline})
                  </div>
                </div>
              </div>
              <div
                className="w-3.5 h-3.5 rounded-full animate-pulse shadow-md"
                style={{ backgroundColor: activeConfig.accentGoldHex }}
              />
            </div>

            <p className="text-xs text-[#C5BEAF] leading-relaxed pt-1">
              Select any theme below to instantly transform all backgrounds, cards, typography, and status indicators in real-time.
            </p>

            <div className="space-y-3 pt-1">
              {THEME_PALETTES.map((palette) => {
                const isSelected = currentPalette === palette.id;

                return (
                  <div
                    key={palette.id}
                    onClick={() => onSelectPalette(palette.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer select-none active:scale-[0.99] relative overflow-hidden ${
                      isSelected
                        ? 'shadow-lg'
                        : 'border-white/10 bg-[#100E0A] hover:border-white/20'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: palette.accentGoldHex,
                            backgroundColor: palette.cardBgHex,
                            boxShadow: `0 4px 20px ${palette.glowRgba}`,
                          }
                        : {}
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Swatch preview orb */}
                        <div
                          className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-md relative overflow-hidden transition-transform duration-200"
                          style={{
                            backgroundColor: palette.bgHex,
                            borderColor: isSelected ? palette.accentGoldHex : 'rgba(255,255,255,0.15)',
                          }}
                        >
                          {/* Inner preview card surface */}
                          <div
                            className="w-7 h-7 rounded-lg border flex items-center justify-center"
                            style={{
                              backgroundColor: palette.cardBgHex,
                              borderColor: 'rgba(255,255,255,0.1)',
                            }}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-full shadow-md"
                              style={{ backgroundColor: palette.accentGoldHex }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className="font-display text-sm font-bold transition-colors"
                              style={isSelected ? { color: palette.accentSecondaryHex } : { color: '#F5D77F' }}
                            >
                              {palette.name}
                            </h3>
                            <span
                              className="text-[10px] px-1.5 py-0.2 rounded border"
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderColor: 'rgba(255,255,255,0.1)',
                                color: isSelected ? palette.accentSecondaryHex : '#C5BEAF',
                              }}
                            >
                              {palette.tagline}
                            </span>
                          </div>
                          <p
                            className="text-xs mt-0.5 leading-relaxed transition-colors"
                            style={isSelected ? { color: palette.textMutedHex } : { color: '#9E9689' }}
                          >
                            {palette.description}
                          </p>
                        </div>
                      </div>

                      {/* Selected check or select circle */}
                      {isSelected ? (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-md"
                          style={{
                            backgroundColor: palette.accentGoldHex,
                            color: palette.btnTextHex,
                          }}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-white/20 shrink-0 flex items-center justify-center" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#110F0C] border-t border-[#D4AF37]/20 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-[#090807] font-bold text-sm shadow-md active:scale-98 transition-all duration-200"
              style={{
                background: activeConfig.gradientAccent,
                color: activeConfig.btnTextHex,
              }}
            >
              Confirm Aesthetic
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
