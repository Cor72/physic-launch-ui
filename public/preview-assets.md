# Hero preview assets

The task-management and component-gallery screenshots were downloaded from
the public [Launch UI homepage](https://www.launchuicomponents.com/) on
2026-08-30 to reproduce the requested three-page hero layout.

- `app-tasks-light.png`: https://www.launchuicomponents.com/app-tasks-light.png
- `app-tasks-dark.png`: https://www.launchuicomponents.com/app-tasks-dark.png
- `examples-light.png`: https://www.launchuicomponents.com/examples-light.png
- `examples-dark.png`: https://www.launchuicomponents.com/examples-dark.png

The dashboard screenshots were already included in this project.

## Hero motion reference

Checked against the homepage's public HTML and CSS on 2026-08-30:

- Resting transform: `rotate(-24deg) skewY(12deg)`.
- Shared hover transform: `rotate(-12deg) skewY(6deg)`.
- Hover transition: 700 ms, 200 ms delay, `cubic-bezier(0.4, 0, 0.2, 1)`.
- The first and last layers spread from -24% / 32% to -32% / 48%.
- Each frame fades in from 16 px below with a blur, lasting 600 ms;
  the three delays are 500, 1000, and 1500 ms.

The local implementation uses a separate wrapper for angle/hover and a frame
for entrance motion. Horizontal spreading uses transforms instead of animating
layout. Reduced-motion preferences disable the animations; hover is limited to
devices with a fine pointer and hover support.
