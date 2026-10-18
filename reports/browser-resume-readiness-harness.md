# Firefox resume readiness assertion failure

The final eleven-case run passed ten cases and failed the Firefox owner/pause
case at the fresh count-in assertion. Its raw result and trace are retained in
`browser-final-main-calibration.json` and `output/playwright/test-results`.

The test's old `waitRun()` predicate checked only mode, nonzero epoch and screen.
After the resume click, `start()` first awaits `ensureAudio()` while the previous
paused PLAY run remains visible. The predicate could therefore pass on that old
run. Its separate `return status()` could then observe the newly created run
with epoch/countStart zero while scene mounting awaited completion. The failure
read audioNow-epoch=31.6906667 rather than the armed count-in.

The immediate afterEach observation had epoch=35.274, audioNow=31.8106667,
paused=false, all notes pending and no page error: the scene had finished arming
and its count-in was correctly in the future. The unchanged runtime assigns a
zero epoch before mountScene, then assigns countStart and epoch synchronously.

The test predicate now also requires `!paused` and `countStart>0`. The fresh
count-in inequality, rollback, input ownership, exact earned12/score100 and
no-extra expectations remain unchanged. This is a readiness correction, not a
relaxed scoring oracle. A targeted Firefox rerun is recorded separately.
