// Home page: the red line that leaves the N of the logo keeps going down the page as you scroll.
// It turns at right angles in the empty gaps between sections, passes behind the content and
// joins the footer line. It draws itself as you scroll down and stays drawn (it never retracts).
// Phone: a thin straight line along the right edge.

import { $, clamp } from './env.js';

// Geometry of the logo PNG (1400 px): the right line runs from x 1018 to 1040.
const LOGO_LINE_X = 1029 / 1400;  // centre of that line, fraction of the logo width
const LOGO_LINE_W = 22 / 1400;    // its thickness, fraction of the logo width
const TIP = 0.65;                 // the tip of the line follows 65% of the viewport height
const PHONE = '(max-width: 760px)';

export function initScrollLine({ reduced = false, rec = false } = {}) {
  const svg = $('[data-scroll-line]');
  if (!svg) return;
  const path = $('path', svg);

  let points = [];
  let total = 0;
  let reach = 0;   // deepest document y the tip has reached
  let shown = 0;   // drawn length, eased toward the target
  let frame = 0;

  const box = (selector) => {
    const el = $(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, width: r.width, top: r.top + scrollY, bottom: r.bottom + scrollY };
  };

  function layout() {
    svg.style.height = '0px'; // measure the page without the line itself
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.scrollHeight;
    const hero = box('.hero');
    const rule = box('.footer-line .rule');
    if (!hero || !rule) return;

    let stroke;
    if (matchMedia(PHONE).matches) {
      stroke = 3;
      const x = width - 6;
      points = [[x, hero.bottom], [x, rule.bottom]];
    } else {
      const logo = box('.photo-wrap');
      const panel = box('.panel');
      const statement = box('.statement');
      const sub = box('.sub');
      const projectsHead = box('.projects-head');
      const projectsFoot = box('.projects-foot');
      const explore = box('.explore .section-inner');
      if (!logo || !panel || !statement || !sub || !projectsHead || !projectsFoot || !explore) return;

      stroke = logo.width * LOGO_LINE_W;
      const x0 = logo.left + logo.width * LOGO_LINE_X;
      const xLeft = panel.left / 2;              // middle of the left margin
      const xRight = (panel.right + width) / 2;  // middle of the right margin
      const gap = (a, b) => (a + b) / 2;         // middle of the empty space between two blocks
      const y1 = gap(hero.bottom, statement.top);
      const y2 = gap(sub.bottom, panel.top);
      const y3 = gap(panel.bottom, projectsHead.top);
      const y4 = gap(projectsFoot.bottom, explore.top);
      points = [
        [x0, hero.bottom], [x0, y1],
        [xRight, y1], [xRight, y2],
        [xLeft, y2], [xLeft, y3],
        [xRight, y3], [xRight, y4],
        [xLeft, y4], [xLeft, rule.bottom],
      ];
    }

    svg.style.height = `${height}px`;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    path.setAttribute('d', points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' '));
    path.style.strokeWidth = `${stroke}px`;
    total = points.slice(1).reduce((sum, [x, y], i) => sum + Math.abs(x - points[i][0]) + Math.abs(y - points[i][1]), 0);
    path.style.strokeDasharray = `${total} ${total}`;
    draw(true);
  }

  // Length of the path above a document y (the path only goes down or sideways).
  function lengthAbove(y) {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const [ax, ay] = points[i - 1];
      const [bx, by] = points[i];
      if (ay === by) {                       // horizontal
        if (y < ay) break;
        length += Math.abs(bx - ax);
      } else {                               // vertical, going down
        if (y >= by) { length += by - ay; continue; }
        if (y > ay) length += y - ay;
        break;
      }
    }
    return length;
  }

  function draw(immediate = false) {
    const target = reduced ? total : lengthAbove(reach);
    shown = immediate || reduced ? target : shown + (target - shown) * 0.18;
    if (Math.abs(target - shown) < 0.5) shown = target;
    path.style.strokeDashoffset = `${total - shown}`;
    return shown !== target;
  }

  const tick = () => {
    frame = draw() ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (!frame) frame = requestAnimationFrame(tick); };

  layout();
  addEventListener('resize', layout);
  document.fonts?.ready.then(layout);
  addEventListener('load', layout);
  new ResizeObserver(() => layout()).observe(document.body);

  if (reduced) return;

  if (rec) {
    // ?rec=1 captures the whole page in one frame: the line draws over time instead (1–5 s)
    const start = performance.now();
    const loop = (now) => {
      const p = clamp(((now - start) / 1000 - 1) / 4);
      const first = points[0]?.[1] ?? 0;
      const last = points[points.length - 1]?.[1] ?? 0;
      reach = first + (last - first) * p;
      draw();
      if (p < 1) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return;
  }

  const onScroll = () => {
    reach = Math.max(reach, scrollY + innerHeight * TIP); // only ever grows: drawn once
    kick();
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
