
import React, { useMemo } from 'react';

interface DynamicBackgroundProps {
  theme?: string; // 'warm' | 'rain' | 'wind'
  scentId?: string; // Scent ID for scent-specific colors
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ theme = 'warm', scentId }) => {

  // Get scent-specific gradient colors based on scent ID
  const scentColors = useMemo(() => {
    switch (scentId) {
      case 'tinghe':
        // Pink tones - 莲粉色系，更明显的渐变
        return {
          primary: 'rgba(236, 72, 153, 0.35)',
          secondary: 'rgba(244, 114, 182, 0.25)',
          accent: 'rgba(251, 207, 232, 0.2)',
          gradient: 'linear-gradient(180deg, rgba(252, 231, 243, 0.6) 0%, rgba(251, 207, 232, 0.7) 40%, rgba(249, 168, 212, 0.5) 100%)',
        };
      case 'wanxiang':
        // Orange-amber - 桂金色系，更明显的渐变
        return {
          primary: 'rgba(251, 191, 36, 0.35)',
          secondary: 'rgba(245, 158, 11, 0.25)',
          accent: 'rgba(254, 243, 199, 0.2)',
          gradient: 'linear-gradient(180deg, rgba(254, 243, 199, 0.6) 0%, rgba(253, 230, 138, 0.7) 40%, rgba(252, 211, 77, 0.5) 100%)',
        };
      case 'xiaoyuan':
        // Green - 苔绿色系，更明显的渐变
        return {
          primary: 'rgba(34, 197, 94, 0.3)',
          secondary: 'rgba(74, 222, 128, 0.25)',
          accent: 'rgba(187, 247, 208, 0.2)',
          gradient: 'linear-gradient(180deg, rgba(187, 247, 208, 0.6) 0%, rgba(134, 239, 172, 0.7) 40%, rgba(74, 222, 128, 0.5) 100%)',
        };
      default:
        return null;
    }
  }, [scentId]);

  const colors = useMemo(() => {
    switch (theme) {
      case 'rain':
        return {
          blob1: 'bg-blue-300/20',
          blob2: 'bg-slate-400/20',
          blob3: 'bg-indigo-300/20',
          blob4: 'bg-sky-200/20',
        };
      case 'wind':
        return {
          blob1: 'bg-emerald-300/20',
          blob2: 'bg-teal-200/20',
          blob3: 'bg-lime-200/20',
          blob4: 'bg-green-300/20',
        };
      case 'warm':
      default:
        return {
          blob1: 'bg-dopamine-orange/20',
          blob2: 'bg-dopamine-pink/20',
          blob3: 'bg-dopamine-blue/10',
          blob4: 'bg-dopamine-yellow/20',
        };
    }
  }, [theme]);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-1000"
      style={scentColors ? { background: scentColors.gradient } : { backgroundColor: 'rgba(255,255,255,0.5)' }}
    >

      {/* Base Background Image - Blurred for Atmosphere */}
      <div className="absolute inset-0 z-0">
        <img
            src="https://xiaoyuand2026-1252955517.cos.ap-guangzhou.myqcloud.com/BG%20%281%29.png"
            alt="Atmosphere"
            className={`w-full h-full object-cover filter blur-[80px] opacity-30 scale-110 mix-blend-multiply transition-all duration-1000 ${theme === 'rain' ? 'grayscale brightness-90' : 'grayscale-0'}`}
        />
      </div>

      {/* Scent-specific breathing gradient overlay */}
      {scentColors && (
        <div
          className="absolute inset-0 z-5 animate-breathe"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${scentColors.primary} 0%, transparent 50%),
                         radial-gradient(ellipse at 70% 80%, ${scentColors.secondary} 0%, transparent 50%),
                         radial-gradient(ellipse at 50% 50%, ${scentColors.accent} 0%, transparent 70%)`,
            animation: 'breathe 8s ease-in-out infinite',
          }}
        />
      )}

      {/* Dopamine Blobs - Layered on top for color variation */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-50 z-10">

        {/* Blob 1 */}
        <div className={`absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl animate-blob transition-colors duration-1000 ${colors.blob1}`}></div>

        {/* Blob 2 */}
        <div className={`absolute top-[-10%] right-[10%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 transition-colors duration-1000 ${colors.blob2}`}></div>

        {/* Blob 3 */}
        <div className={`absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 transition-colors duration-1000 ${colors.blob3}`}></div>

        {/* Blob 4 */}
        <div className={`absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-3000 transition-colors duration-1000 ${colors.blob4}`}></div>

      </div>

      {/* Noise overlay for texture (very subtle) */}
      <div className="absolute inset-0 opacity-[0.03] z-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};

export default DynamicBackground;
