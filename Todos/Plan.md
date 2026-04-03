# Bloom Plan

## Goal
Turn Bloom from a functional screen-recording prototype into a reliable async demo tool.

## Phase 1: Reliability and Recording Model
- Add an app-owned `Recording` model with persistent metadata.
- Stop deriving UI state directly from `mux.video.assets.list()`.
- Store `muxUploadId`, `muxAssetId`, `playbackId`, status fields, timestamps, duration, and summary/transcript state.
- Add explicit error states for permissions, upload failures, processing failures, and transcript failures.
- Replace fragile client-only polling with server-driven state where possible.

### Acceptance Criteria
- A recording can be created, tracked, and reloaded without losing app state.
- Failures are visible and actionable.
- Dashboard and detail pages render from normalized recording data.

## Phase 2: Mux Processing and Status Sync
- Add a Mux webhook endpoint for upload, asset, and transcript lifecycle updates.
- Update recording state from webhook events.
- Keep client polling only as a short-lived fallback for active sessions.
- Prevent repeated reprocessing of summaries and transcripts.

### Acceptance Criteria
- Recording status transitions correctly from upload to ready.
- Transcript-ready state is reflected without manual refresh loops.
- Summary generation is not retriggered unnecessarily.

## Phase 3: Manageability
- Add titles for recordings and allow rename.
- Add delete/archive behavior.
- Add sorting and filtering by readiness, state, and date.
- Add search across title and transcript content.
- Upgrade dashboard cards to show useful status metadata.

### Acceptance Criteria
- Users can find, rename, and organize recordings quickly.
- Dashboard supports mixed states cleanly.

## Phase 4: Async Demo Utility
- Auto-generate summary after transcript readiness.
- Produce structured outputs: title, summary, tags, key points, chapters.
- Make transcript interactive with timestamp seeking, copy, and download.
- Improve sharing with a summary-first viewer and clearer share actions.
- Add optional per-recording CTA and feedback fields for demo follow-up.

### Acceptance Criteria
- A finished recording is immediately useful as a shareable async demo.
- Transcript and summary features improve review and handoff.

## Phase 5: Product Polish
- Replace starter metadata, README, and leftover template assets.
- Rename `SharButton` to `ShareButton`.
- Fix lint warnings and route-level loading, error, and not-found states.
- Add meaningful empty states and basic analytics events.

### Acceptance Criteria
- The app no longer feels template-derived.
- Basic operational visibility exists for the recording funnel.

## Notes
- Primary use case: async narrated demos.
- Reliability and usefulness come before visual redesign.
- Persistence is required; otherwise Bloom stays constrained by Mux-list-based lookups.
