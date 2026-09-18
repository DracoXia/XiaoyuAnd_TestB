import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FirstVisitTour from './FirstVisitTour';

describe('FirstVisitTour', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 20, y: 100, top: 100, left: 20, right: 370, bottom: 240, width: 350, height: 140,
      toJSON: () => ({}),
    } as DOMRect);
  });

  it('dims the rest of the screen while leaving one action focused and skippable', () => {
    const onSkip = vi.fn();
    render(<><button data-tour-target="scent">听荷</button><FirstVisitTour step="scent" onSkip={onSkip} /></>);
    expect(screen.getByRole('dialog', { name: '新手引导' })).toHaveTextContent('先选一支香');
    expect(screen.getByTestId('tour-focus-ring')).toHaveStyle({ left: '12px', top: '92px', width: '366px', height: '156px' });
    fireEvent.click(screen.getByRole('button', { name: '跳过引导' }));
    expect(onSkip).toHaveBeenCalledOnce();
  });
});
