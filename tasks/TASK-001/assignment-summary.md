# TASK-001 Assignment Summary

**Passed.** The required roles ran one at a time, the trainer workspace implements the list, filter, and create flow, and the recorded checks match what actually ran.

This file is the developer judgment. It does not replace `requirements.md`, `implementation-plan.md`, `review.md`, `verification.md`, or `workflow-log.md`. Those files stay as the roles and the workflow log left them. The acceptance boxes in `requirements.md` are still unchecked because that file was not rewritten after implementation. Completion is judged from the code, the review, the browser note, and the verification report.

Evidence used:

- `frontend-accelerator-onboarding/TASK.md` and `frontend-accelerator-onboarding/PASS_CRITERIA.md`
- `tasks/TASK-001/requirements.md`, `implementation-plan.md`, `review.md`, `verification.md`, `workflow-log.md`
- Application code under `src/sessions/`, `src/mocks/`, `src/App.tsx`, `src/App.test.tsx`, `src/main.tsx`, and `src/test/setup.ts`

Doctor, recorded in `tasks/TASK-001/workflow-log.md`: top-level result `DEGRADED`. Runtime hooks `claude` and `codex` are both `PENDING_ACTIVATION`. The command was `node ./toolchain/bin/doctor.mjs --json` with Node.js 26.13.0, exit 0. That status does not block the five required roles. No setup receipt is claimed.

## Required behavior

### Session list shows title, status, and start

**Why.** `TASK.md` requires the trainer to see each session’s title, status, and start date/time after sessions load from a mock API. `requirements.md` makes that an acceptance check for every visible session.

**What.** The workspace renders each session as a list item with an `h2` title, status text `Scheduled` or `Completed`, and a `time` element whose `dateTime` is the stored ISO start. Seed rows are Intro to React (`scheduled`, `2026-12-01T09:00:00.000Z`) and Testing Basics (`completed`, `2026-10-15T14:00:00.000Z`).

**How.** `src/sessions/SessionWorkspace.tsx` maps the loaded set into that row. `src/mocks/seed.ts` supplies the two sessions. `tasks/TASK-001/review.md` (verdict `PASS`) cites those files. The behavior test in `src/App.test.tsx` waits for both headings and checks status text plus `dateTime`. On 2026-11-03 13:39 CET the browser at `http://127.0.0.1:5173/` showed both rows under `All`, with Dec 1, 2026, 10:00 AM and Oct 15, 2026, 4:00 PM. That observation is in `tasks/TASK-001/workflow-log.md`.

### `All` plus one status filter

**Why.** The task allows exactly two list choices: `All`, and one status. The two choices must show different sessions, so the loaded set needs one matching row and one other row.

**What.** The choices are `All` and `Scheduled`. `All` shows the loaded set. `Scheduled` shows only `scheduled` rows. Filtering is local and does not send another request. `Completed` is row text, not a third filter.

**How.** `src/sessions/SessionWorkspace.tsx` keeps `filter` as `all` or `scheduled` and filters `session.status === 'scheduled'`. The plan in `tasks/TASK-001/implementation-plan.md` fixed that one label. `src/App.test.tsx` clicks `Scheduled`, asserts Testing Basics is gone, then clicks `All` and asserts both titles return. `npm run test` exited 0 (`tasks/TASK-001/verification.md`: 1 file, 1 test). In the browser, `Scheduled` left only Intro to React, and Testing Basics stayed hidden after the later create.

### Loading state while the list request is pending

**Why.** The trainer must not see the list presented as ready before the list request finishes.

**What.** The workspace starts in phase `loading` and renders `Loading…` with `role="status"`. The filter, create control, and session list are not rendered in that phase.

**How.** `src/sessions/SessionWorkspace.tsx` returns that branch until `listSessions` resolves, and returns to it when `Try again` increments the load attempt. `tasks/TASK-001/review.md` records this as matching the plan. The 13:39 CET browser pass did not see the message: the document was empty, then the ready list. The state is implemented and reviewed. It was not observed in the browser and has no automated test.

### One understandable, recoverable list-request error

**Why.** A failed list request needs one readable error and a way to retry that same request. A successful retry must clear the error and show the sessions.

**What.** A failed `listSessions` call sets phase `error`, shows `Sessions could not be loaded.`, and shows a `Try again` button. The list is not rendered. Retry returns to loading and calls `listSessions` again. A later success replaces the loaded set.

**How.** `src/sessions/sessionClient.ts` throws `Sessions could not be loaded.` when the GET is not OK or the body is not a session list. `src/sessions/SessionWorkspace.tsx` catches that for the list request only. `tasks/TASK-001/review.md` accepted this path and did not treat the absent create-error screen as a defect, matching the plan. The browser pass did not trigger the error or `Try again`. `verification.md` lists both as unverified. No automated test covers them.

### Create form opened from the list

**Why.** The trainer starts from the list and opens the form with a user action. The form asks for a title and a start. The trainer does not type a status.

**What.** A `Create session` button opens the form while the list stays mounted. Fields are `Title` and `Start` (`datetime-local`). Submit is `Save session`.

**How.** `src/sessions/SessionWorkspace.tsx` toggles `formOpen`. `src/sessions/CreateSessionForm.tsx` renders the two labeled controls. In the browser, Create opened Title and Start while `Scheduled` stayed selected.

### Trimmed title of 3 to 80 characters

**Why.** A title is required. Length is judged only after trimming. 3 and 80 are valid. 2 and 81 are not. A valid title with surrounding whitespace is stored trimmed.

**What.** Submit trims the title, rejects lengths outside 3–80 with `Title must be between 3 and 80 characters.`, and sends the trimmed title when the length is inside that range. The title field has no `maxLength`, so an over-long value can be submitted and rejected.

**How.** `src/sessions/validation.ts` (`validateSessionDraft`) measures `input.title.trim()`. `src/sessions/CreateSessionForm.tsx` calls that function before `createSession` and shows the title message inline. `tasks/TASK-001/review.md` cites this behavior. The browser create used `Manual check session`, which is inside the range. Boundary lengths and surrounding whitespace were not typed in the browser and are not in `src/App.test.tsx`.

### Start date and time in the future

**Why.** Create requires a calendar date and a time of day. A missing date or time, or a start equal to or earlier than the submit attempt, must not create a session.

**What.** One `datetime-local` field collects both. A blank value shows `A date and time are required.` A parsed start at or before the `Date` captured at submit shows `Start must be in the future.` A strictly later start is sent as `toISOString()`.

**How.** `src/sessions/validation.ts` parses the local value and compares it with `submittedAt`. The form passes `new Date()` at the start of that submit. The browser create used start `2026-12-15T15:30`, which is after the 13:39 CET observation, and the new row showed Dec 15, 2026, 3:30 PM. Blank and non-future starts were not tried in the browser and have no automated test.

### Duplicate submit blocked while create is pending

**Why.** A second submit while the create request is pending must not create a second session.

**What.** A pending ref returns immediately from a further submit. `Save session` is disabled for that interval. On success the pending flag is cleared. On failure the flag is cleared, the form stays open with the entered values, and no session is added. There is no create-error message.

**How.** `src/sessions/CreateSessionForm.tsx` sets `pendingRef` before `createSession` and disables the submit button from `pending`. The mock assigns one `scheduled` session in `src/mocks/store.ts`. The browser note records that Save session was disabled while the request was pending, then the form closed. A second click during that interval was not tried. The silent create-failure path is the plan’s specified behavior (`implementation-plan.md`, Contracts And Dependencies) and was accepted in the review as non-blocking.

### Validation message, and no save on invalid input

**Why.** Invalid input must be explained and must not be saved. The message has to identify the failed rule.

**What.** Failed rules show the three messages above. `createSession` is not called while any message is set. The first invalid field is focused.

**How.** `CreateSessionForm.tsx` returns after `validateSessionDraft` fails. Review evidence is `src/sessions/validation.ts` lines 45–81 and the form’s inline messages. The browser pass used a valid title and a future start, so no validation message was seen. `verification.md` lists validation as unverified.

### Created session appears in the visible list

**Why.** After a successful create, the new session is in the loaded set and visible with title, status, and start, including when a filter was already selected.

**What.** Success appends the session returned by `createSession`. The mock stores it as `scheduled`, so an active `Scheduled` filter still shows it. The list is not refetched.

**How.** `SessionWorkspace.tsx` `handleCreated` appends and closes the form. `src/mocks/handlers.ts` maps `POST /api/sessions` to `addSession`, which sets `status: 'scheduled'`. In the browser, with `Scheduled` still selected, the list then showed Intro to React and Manual check session, Scheduled, Dec 15, 2026, 3:30 PM. Testing Basics stayed hidden. `All` was not selected again after create, so the completed seed row was not rechecked beside the new session. The automated test does not open the create form.

### Mock HTTP boundary, and no backend

**Why.** Sessions must come from a replaceable request boundary. The scaffold had no mock, so a conventional HTTP mock is allowed. A backend service is out of scope.

**What.** `src/sessions/sessionClient.ts` is the only module under `src/` that calls `fetch`. `listSessions` GETs `/api/sessions`. `createSession` POSTs `{ title, startsAt }`. UI code calls those two functions. MSW 2.15.0 intercepts both. The browser worker starts from `src/main.tsx` before render. Vitest uses the Node server from `src/test/setup.ts`. `msw` is a devDependency. `public/mockServiceWorker.js` is the generated worker. No backend service was added.

**How.** `package.json` has `"msw": "^2.15.0"` and `msw.workerDirectory: ["public"]`. Handlers live in `src/mocks/handlers.ts`. `tasks/TASK-001/review.md` records this boundary. The browser list and create at `http://127.0.0.1:5173/` returned the seed rows and the new session through that worker. `npm run preview` was not run, so the production bundle’s worker path is unverified (`verification.md`).

### One behavior-level automated test

**Why.** The task requires at least one behavior-level test of the main flow, covering filtering or a successful create, on the repository’s existing Vitest and Testing Library stack.

**What.** `src/App.test.tsx` has one test, `filters the loaded sessions by scheduled status`. It renders `App`, waits for both seed headings, checks status and `dateTime`, activates `Scheduled`, then activates `All`. It does not mock `fetch` by hand. The setup file starts MSW.

**How.** The plan assigned the required test to the filter. `tasks/TASK-001/verification.md` records `npm run test` (`vitest run`) exit 0 on 2026-11-03: Vitest v5.1.0, 1 test file passed, 1 test passed. The coder’s earlier run of the same script also exited 0 (`workflow-log.md`). The plan’s extra risk-based tests were not added, which is what the plan requires.

### Manual browser check of list, filter, and create

**Why.** A person must start the app with the repository `dev` script and record one real observation of the list, the status filter, and a successful create. `browser-verify` is optional.

**What.** Observed 2026-11-03 13:39 CET from `/Users/user/Desktop/acs/accelerator`.

**How.** Node.js 26.13.0 was put on `PATH` with `$HOME/.nvm/versions/node/v26.13.0/bin` because `nvm use 26.13.0` exits 11 on the existing `.npmrc` prefix conflict. Command: `export PATH="$HOME/.nvm/versions/node/v26.13.0/bin:$PATH" && node -v && npm run dev -- --host 127.0.0.1 --port 5173`. `node -v` printed `v26.13.0`. Vite v8.3.5 reported ready. URL: `http://127.0.0.1:5173/`. Flow: `All`, then `Scheduled`, then create `Manual check session` at `2026-12-15T15:30` with `Scheduled` still selected. Result: both seed rows under `All`; only Intro to React under `Scheduled`; Save session disabled while pending; form closed; Manual check session appeared as Scheduled, Dec 15, 2026, 3:30 PM. The full note is in `tasks/TASK-001/workflow-log.md` under Manual Browser Observation. `verification.md` cites it as a prior parent observation. This summary does not claim a second browser pass.

### Stack, scope, and non-goals

**Why.** The task requires the existing React, TypeScript, Vite, npm, and Vitest scripts, and forbids features outside the required flow.

**What.** Scripts remain `dev`, `build`, `lint`, `preview`, and `test`. The only new dependency is `msw`. The starter screen in `src/App.tsx` is now the workspace. No session details, search, extra filters, pagination, router, state library, authentication, editing, deletion, CI, deployment, or public URL was added.

**How.** `tasks/TASK-001/implementation-plan.md` lists those non-goals. `tasks/TASK-001/review.md` says the change stays inside the plan. `npm run lint` (oxlint) and `npm run build` (`tsc -b && vite build`) each exited 0 in `verification.md`. Build printed a chunk-size warning for `dist/assets/index-CM_gEUQV.js` (651.45 kB) and still exited 0. Optional roles `architect`, `api-integration`, `ui-designer`, `test-generator`, `debugger`, and `browser-verify` were not selected. `finishing-branch` was recommended by verify and was not selected.

## Pass criteria

### Required roles were selected in order, one at a time

**Why.** Passing requires the developer to select `requirements-analyst`, `writing-plans`, `coder`, `code-reviewer`, and `verify` in that lifecycle, with a developer decision between roles.

**What.** `tasks/TASK-001/workflow-log.md` has one row per role: 12:29, 12:45, 13:05, 13:26, and 13:50 CET on 2026-11-03. Each row’s next action names the following role as not started. The manual browser check sits between review and verify. No role was skipped. No optional role was started.

**How.** The developer decision before the first role set the task id to `TASK-001`. Each decision is `accept`. The review row records that `browser-verify` was recommended and not selected. The verify row records that `finishing-branch` was recommended and not selected.

### Each required role had a bounded prompt, and the prompt was preserved

**Why.** The developer must write the prompt, answer the five onboarding questions, and keep the exact text in the workflow log.

**What.** The log stores the exact prompt for all five roles. Each prompt names the task id, the files to read, one outcome, the durable artifact or returned evidence, a boundary, and STOP.

**How.** `requirements-analyst` was limited to `requirements.md` and forbidden from production edits. `writing-plans` was limited to `implementation-plan.md` and forbidden from pasting implementations. `coder` was limited to the accepted plan and the existing `test`, `lint`, and `build` scripts. `code-reviewer` was read-only and told the developer would save the response as `review.md`. `verify` was told to write factual commands and unverified items to `verification.md` and not to repair failures. Each prompt says recommendation is not execution.

### Each role stopped before the next role started

**Why.** A role may recommend a next command. That recommendation is not permission to start it.

**What.** The log’s next-action column marks the following role as not started on the same row. Review recommended `browser-verify`; the next recorded action was the parent browser check, then `verify`. Verify recommended `finishing-branch`; the next recorded action is this summary.

**How.** Role responses were reviewed before the next prompt was issued. No correction row was needed. There is no row where one agent was asked to perform two lifecycle roles.

### Requirements, plan, review, verification, and workflow log exist

**Why.** Those five artifacts are the onboarding submission.

**What.** All five are present under `tasks/TASK-001/`.

**How.** `requirements-analyst` wrote `requirements.md`. `writing-plans` wrote `implementation-plan.md`. The developer saved the code-reviewer response verbatim as `review.md`. `verify` wrote `verification.md`. The developer owns `workflow-log.md`, started before the first role. This summary does not edit them.

### The application starts with a documented repository command

**Why.** The main flow has to be reachable from the repository `dev` script, and the command has to be the one that was run.

**What.** `npm run dev` is `vite` in `package.json`. The browser note records the exact command, Node.js `v26.13.0`, Vite v8.3.5 ready, and `http://127.0.0.1:5173/`.

**How.** Documented in `tasks/TASK-001/workflow-log.md` and cited again in `tasks/TASK-001/verification.md`. `verify` did not start `npm run dev` or `npm run preview`.

### The main list, filter, and create flow works end to end

**Why.** Passing requires that flow to work, not only to be specified.

**What.** The 13:39 CET observation covered `All`, `Scheduled`, and a successful create that stayed visible under `Scheduled`.

**How.** Browser evidence above. `review.md` verdict `PASS` against the same happy path. No happy-path blocker was sent back to `coder`.

### Loading and the recoverable request error are implemented

**Why.** Both states are required behavior. Observing them in the browser is not a separate pass criterion. Extra error and race scenarios are listed as non-blocking feedback.

**What.** Both states are in `src/sessions/SessionWorkspace.tsx`, as reviewed.

**How.** See the loading and list-error sections above. They remain unverified in the browser and in the test suite. That limitation is recorded. It does not leave the states unimplemented.

### At least one behavior-level test exists and passes

**Why.** The repository test tooling is available, so the required test has to pass when that script runs.

**What.** One passing filter test.

**How.** `npm run test` exit 0 in `tasks/TASK-001/verification.md`.

### Review findings were considered

**Why.** Happy-path blockers must be fixed or the developer must record why a finding stays. Ignored findings fail the criterion.

**What.** `review.md` verdict is `PASS`. Findings: none blocking or should-fix. Residual notes: the reviewer did not rerun test, lint, build, or a browser; only the planned filter test exists; a failed create stays silent; brand preferences such as title case, curly quotes, a skip link, and a URL-synced filter were not treated as defects.

**How.** The 13:26 CET workflow-log row accepts the verdict. It records that the coder had already run test, lint, and build at exit 0, that the browser pass was still the next parent step, that the single test and the silent create failure match the plan, and that the brand notes sit outside the accepted requirements. No coder correction was sent. The parent browser pass then happened at 13:39 CET, before `verify`.

### Verification is truthful

**Why.** Claimed commands, results, and observations have to be ones that were produced. Unverified items have to stay visible.

**What.** `verification.md` verdict is `PASS`. Commands that ran in that role: `nvm use 26.13.0` exit 11 (environment note, `.npmrc` not changed), `node -v` exit 0 printing `v26.13.0`, `npm run test` exit 0, `npm run lint` exit 0, `npm run build` exit 0. Browser evidence is labeled as the prior parent observation. Unverified items match the workflow log, plus `npm run dev` and `npm run preview` because verify did not start those servers.

**How.** The verify prompt forbade repair and forbade claiming a server command that role did not run. The developer accepted the report at 13:50 CET. No happy-path `FAIL` was returned, so no coder correction followed.

### One real manual browser observation was recorded

**Why.** The pass criteria require one real observation of the main flow.

**What.** The 13:39 CET note names the command, the URL, what was seen, and what was left unverified.

**How.** Written by the parent in `tasks/TASK-001/workflow-log.md` after the app was exercised. `browser-verify` was not used.

## Known limitations

- Claude and Codex runtime hooks remain `PENDING_ACTIVATION`. Doctor stays `DEGRADED`. Cursor does not activate those hooks. The role workflow still ran.
- `nvm use 26.13.0` exits 11 because of an `.npmrc` prefix conflict. The installed Node.js 26.13.0 binary was used instead. `.npmrc` was not changed.
- The browser pass did not show the loading message, did not trigger the list error or `Try again`, did not try validation messages, did not try a second click while save was pending, did not select `All` again after create, and did not check reload or persistence.
- Automated coverage is the one filter test. Create-under-filter, list error and retry, title and future-start validation, and duplicate submit are implemented and untested, which matches the plan’s “do not add these tests” note.
- A failed create clears the pending flag, keeps the entered values, adds no session, and shows no error.
- `npm run preview` was not run. The production bundle’s service worker was not observed.
- `workflow-log.md` still says active work is not finished, because that line was written before this summary and this summary does not edit the log.
- No deployment, pull request, CI setup, or public URL was produced. Those are outside this track.

## Evaluator output

1. **Passed**
2. The five required roles were selected separately with recorded prompts, the list, `Scheduled` filter, and create flow were observed in the browser, and test, lint, and build exited 0 with unverified paths left explicit.
3. Strengths:
   - Each role prompt in `tasks/TASK-001/workflow-log.md` names context, one outcome, a durable artifact, a boundary, and STOP, and the next role starts only on a later row.
   - The 13:39 CET browser pass at `http://127.0.0.1:5173/` showed both seed rows, the `Scheduled` filter hiding Testing Basics, and Manual check session appearing in that filtered list.
   - `review.md` is the reviewer text with verdict `PASS`, every residual note has a developer decision, and `verification.md` reports the commands that ran, including the `nvm` exit 11 environment note.
4. Improvements:
   - Exercise loading, the list error and `Try again`, and the validation messages once in the browser, and record what was seen. Those paths exist in `src/sessions/SessionWorkspace.tsx` and `src/sessions/validation.ts` and were not observed.
   - Add the plan’s deferred behavior checks for a successful create under `Scheduled`, title bounds, a non-future start, and a second submit while create is pending. The current suite only covers the filter.
   - Run `npm run preview` once so the production bundle’s MSW worker is observed, and surface a message when create fails. The plan left that failure silent, and the built app has not been served.
