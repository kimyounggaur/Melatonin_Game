# Firefox trusted-command transport

The first retry with strict armed/unpaused readiness completed all input and
pause/resume behavior but earned 10.75/12 (90 points). All four ties remained
continuous, all four releases were in their windows, all eight rests were clean,
and extras were zero. The observed onset errors were +31.3 to +51.3ms and release
errors +34.0 to +99.3ms. The automation waited until target-6ms, then returned
from Firefox to Node before sending each real command. These consistently late
arrivals are retained in `browser-firefox-command-latency.json`, its trace ZIP
at `../output/playwright/traces/browser-firefox-command-latency-trace.zip`,
and `browser-final-firefox-owner-rerun.json`.

An initial target-70ms retry overcompensated a warm browser: every onset arrived
52.7-60.7ms early and releases 52.7-63.7ms early, resulting in 9.5/12 (79 points).
That result is retained in `browser-firefox-command-lead70.json` and
`browser-final-firefox-owner-lead.json`, with its trace at
`../output/playwright/traces/browser-firefox-command-lead70-trace.zip`.

The final Firefox-specific test uses a fixed target-30ms real keyboard/mouse
command lead. Chrome retains target-6ms. This is one final rerun, rather than
an unbounded search for a passing score; any remaining failure is reported.
The game clock, inputOffset=0, Perfect/Good windows, musical targets and exact
earned12/score100 expectations remain unchanged. No in-page synthetic events or
scoring calls are used. This transport compensation is a test harness setting,
not a measurement or correction of a real device's acoustic/input latency.

The final fixed-30ms run passed in 55.1 seconds with earned12/score100/extra0.
Its onset errors were -3.3 to -19.3ms and release errors -12.7 to -25.7ms,
inside the unchanged Perfect windows. The raw result is
`browser-final-firefox-owner-lead30.json`; detailed states and trusted pointer
events are in `browser-input-owner-pause-firefox.json` (`commandLeadSec=0.03`).
