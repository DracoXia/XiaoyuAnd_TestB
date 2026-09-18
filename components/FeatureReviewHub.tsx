import React from 'react';

const REVIEW_STATES = [
  ['首页未读通知', '/?preview=home&fixture=unread'],
  ['更新中心已展开', '/?preview=updates&fixture=unread'],
  ['有完整数据的一周总结', '/?preview=weekly-summary&fixture=full'],
  ['主动记录心情页', '/?preview=mood-record&source=manual'],
  ['关联因素选择页', '/?preview=mood-context&mood=anxious&source=manual'],
  ['即时反馈页', '/?preview=mood-feedback&mood=anxious&context=recognition&variant=1'],
  ['通知授权引导', '/?preview=notification-opt-in&permission=default'],
  ['计时结束通知点击后的记录页', '/?preview=timer-ended&scent=tinghe'],
] as const;

const FeatureReviewHub: React.FC = () => (
  <main className="min-h-[100dvh] bg-[#f5f0f7] px-5 py-10 text-[#28232b]">
    <div className="mx-auto max-w-md">
      <p className="text-xs font-semibold tracking-[0.2em] text-[#8d7d88]">DEVELOPMENT REVIEW</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">心绪与通知审核中心</h1>
      <p className="mt-3 text-sm leading-6 text-[#756d77]">以下入口使用只读预览数据，不保存心情、不播放声音，也不会申请通知权限。</p>
      <nav className="mt-7 space-y-3" aria-label="功能审核状态">
        {REVIEW_STATES.map(([label, href], index) => (
          <a key={href} href={href} className="flex min-h-14 items-center justify-between rounded-[1.35rem] border border-white/80 bg-white/65 px-4 py-3 shadow-[0_14px_40px_rgba(70,52,67,0.07)]">
            <span className="text-sm font-medium">{index + 1}. {label}</span>
            <span aria-hidden="true" className="text-[#9a8794]">→</span>
          </a>
        ))}
      </nav>
    </div>
  </main>
);

export default FeatureReviewHub;
