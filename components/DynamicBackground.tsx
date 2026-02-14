
import React, { useMemo } from 'react';

interface DynamicBackgroundProps {
  theme?: string; // 'warm' | 'rain' | 'wind'
  scentId?: string; // Scent ID for scent-specific colors
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ theme = 'warm', scentId }) => {

  // Get scent-specific gradient colors based on scent ID
  // 使用低饱和度大地色调，但保持区分度和可见度
  // 呼吸层颜色透明度更高，以便动画效果明显
  const scentColors = useMemo(() => {
    switch (scentId) {
      case 'tinghe':
        // 莲粉 - 明显的粉色调
        return {
          primary: 'rgba(196, 144, 138, 0.7)', // lotus-pink-dark (呼吸层更高透明度)
          secondary: 'rgba(232, 204, 200, 0.6)', // lotus-pink
          accent: 'rgba(242, 237, 228, 0.5)', // earth-sand
          gradient: 'linear-gradient(180deg, rgba(247, 245, 242, 1) 0%, rgba(232, 204, 200, 0.85) 40%, rgba(196, 144, 138, 0.6) 100%)',
        };
      case 'wanxiang':
        // 桂金 - 明显的金色调
        return {
          primary: 'rgba(196, 160, 96, 0.7)', // osmanthus-gold-dark
          secondary: 'rgba(232, 220, 192, 0.6)', // osmanthus-gold
          accent: 'rgba(191, 165, 148, 0.5)', // earth-clay
          gradient: 'linear-gradient(180deg, rgba(247, 245, 242, 1) 0%, rgba(232, 220, 192, 0.85) 40%, rgba(196, 160, 96, 0.6) 100%)',
        };
      case 'xiaoyuan':
        // 苔绿 - 低饱和度绿色调
        return {
          primary: 'rgba(154, 171, 154, 0.65)', // moss-green-dark
          secondary: 'rgba(212, 221, 212, 0.6)', // moss-green
          accent: 'rgba(148, 155, 138, 0.5)', // earth-sage
          gradient: 'linear-gradient(180deg, rgba(247, 245, 242, 1) 0%, rgba(212, 221, 212, 0.85) 40%, rgba(154, 171, 154, 0.6) 100%)',
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
      style={scentColors ? { background: scentColors.gradient } : { backgroundColor: '#f7f5f2' }}
    >

      {/* Scent-specific static gradient layers */}
      {scentColors && (
        <>
          {/* 渐变层1 - 主色 */}
          <div
            className="absolute inset-0 z-5"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 25% 35%, ${scentColors.primary} 0%, transparent 60%)`,
            }}
          />
          {/* 渐变层2 - 次色 */}
          <div
            className="absolute inset-0 z-6"
            style={{
              background: `radial-gradient(ellipse 50% 60% at 75% 65%, ${scentColors.secondary} 0%, transparent 55%)`,
            }}
          />
          {/* 渐变层3 - 强调色 */}
          <div
            className="absolute inset-0 z-7"
            style={{
              background: `radial-gradient(ellipse 70% 50% at 50% 85%, ${scentColors.accent} 0%, transparent 50%)`,
            }}
          />
        </>
      )}

      {/* Dopamine Blobs - 降低透明度，避免干扰主线香色调 */}
      {!scentColors && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 z-10">

          {/* Blob 1 */}
          <div className={`absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl animate-blob transition-colors duration-1000 ${colors.blob1}`}></div>

          {/* Blob 2 */}
          <div className={`absolute top-[-10%] right-[10%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 transition-colors duration-1000 ${colors.blob2}`}></div>

          {/* Blob 3 */}
          <div className={`absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 transition-colors duration-1000 ${colors.blob3}`}></div>

          {/* Blob 4 */}
          <div className={`absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-3000 transition-colors duration-1000 ${colors.blob4}`}></div>

        </div>
      )}

      {/* Noise overlay for texture (very subtle) */}
      <div className="absolute inset-0 opacity-[0.03] z-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};

export default DynamicBackground;
