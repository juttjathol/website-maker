/**
 * Watermark — the "WEBLOOM by JATHOL" bubble shown at the bottom of a
 * free customer's published website. It is non-interactive
 * (pointer-events: none) so it never blocks editing or site clicks, and
 * it is removed automatically once the owner is on a paid plan.
 */
export function Watermark() {
  return (
    <div className="wk-watermark" aria-hidden="true">
      <span className="wk-watermark-dot" />
      <span className="wk-watermark-text">
        WEBLOOM <b>by JATHOL</b>
      </span>
    </div>
  );
}
