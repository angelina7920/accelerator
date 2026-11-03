# TASK-001: Implementation Plan

## Current Behavior

The Application Root is `/Users/user/Desktop/acs/accelerator`. It is its own git repository and the only frontend application. `src/App.tsx` renders the Vite starter: a “Get started” heading, starter artwork, a count button, and links to Vite and React. `src/App.test.tsx` asserts that heading. `src/test/setup.ts` only loads `@testing-library/jest-dom/vitest`. `vite.config.ts` runs Vitest in jsdom with that setup file, and Vitest globals are off.

`src/` has no session feature, no `fetch` call, and no mock server. `package.json` has no HTTP mock dependency. Runtime dependencies are React and React DOM. Scripts are `dev` (`vite`), `build` (`tsc -b && vite build`), `lint` (`oxlint`), `preview` (`vite preview`), and `test` (`vitest run`).

There is no living session specification. `tasks/TASK-001/requirements.md` is the accepted behavior source. `tasks/TASK-001/workflow-log.md` already records Doctor as `DEGRADED` because runtime hooks are pending activation, and records that this does not block the role workflow.

## Intended Behavior

Replace the starter screen with one training-sessions workspace. A trainer can:

1. Open the workspace and see sessions that arrive from one replaceable HTTP client. Each visible session shows its title, its status, and its start date and time.
2. While that list request is pending, see a loading state. The session list is not presented as ready.
3. If that list request fails, see one understandable error and a retry action for the same request. A successful retry removes the error and shows the loaded sessions.
4. Choose `All` or exactly one status, `Scheduled`. `All` shows every loaded session. `Scheduled` shows only sessions with that status. The loaded set contains one scheduled session and one session of another status, so the two choices show different sessions. Filtering does not send another request.
5. Open a create form from the list. The form requires a title and a start date and time. The trainer does not enter a status.
6. Stay on the failed validation when the trimmed title is shorter than 3 characters or longer than 80, or when the date and time are missing, or when the start is equal to or earlier than the submit attempt. Each failure shows a readable message that identifies the failed rule, and no session is created.
7. Submit once when the trimmed title is 3 to 80 characters and the start is strictly later than the submit attempt. Surrounding whitespace is accepted, and the created session shows the trimmed title. A second submit while that request is pending does not create another session.
8. After a successful create, see the new session in the list with its title, status, and start date and time. This remains true when `Scheduled` was already selected. The new session’s status is `scheduled`.

Session load and session create both go through the same client. A conventional HTTP mock stands in front of that client. No backend service is added.

## Preconditions And Confirmed Decisions

Confirmed by the accepted requirements:

- The user is a trainer. There is no sign-in.
- The required flow is the list, one status filter, list loading, one recoverable list error, and the create form described above.
- UI copy is English, consistent with `index.html` (`lang="en"`).
- Date and time are compared in the trainer’s local date and time. “In the future” means strictly later than the clock time at the submit attempt.
- Length is the length of the trimmed title. 3 and 80 are valid. 2 and 81 are not.
- The list loading state is the required loading state. The pending create request only blocks a duplicate submit.
- A create that does not succeed adds no session and has no required error screen.
- One behavior-level Vitest and Testing Library test is required, for the status filter or for a successful create that appears in the list. This plan assigns that test to the status filter.
- The manual browser note is written only after a person has actually exercised the flow. This plan does not write that note.
- Non-goals stay out: session details, drawers, deep links, search, extra status filters, pagination, a complete API contract or scenario matrix, screenshot sets, exhaustive responsive or accessibility work, an empty-list design, a create-request error screen, extra race or failure scenarios, full automated coverage, CI, deployment, a public URL, authentication, editing, deletion, a strict TypeScript migration, and unrelated refactoring.

These specialist gaps are already accepted as non-blocking. No `architect`, `api-integration`, or `ui-designer` pass is required. The Vite React app can hold this flow with local component state and `fetch`. Nothing here needs a router or a state library.

Plan decisions below are implementation choices so the client, the mock, and the screen match. They are not a new product contract, a prescribed visual design, or a published API.

- **One filter status.** The filter choices are `All` and `Scheduled`. Stored status values are `scheduled` and `completed`. Row text for those values is `Scheduled` and `Completed`. `Completed` is not a filter. A created session is stored as `scheduled`, so an active `Scheduled` filter still shows it.
- **Request shape.** `GET /api/sessions` returns the full loaded set. `POST /api/sessions` creates one session. Field names are `id`, `title`, `status`, and `startsAt`. `startsAt` is an ISO-8601 string. No error schema, auth, pagination, or other resources are defined.
- **Mock.** Add `msw` 2.x as a devDependency. Browser runs use its service worker. Vitest uses its Node server. Both use the same handlers. There is no backend, so the worker starts for the `dev` server and for the production bundle served by `preview`. Tests do not boot `src/main.tsx`.
- **Module split.** New session code lives under `src/sessions/`. New mock code lives under `src/mocks/`. The workspace keeps its state in React `useState`. Validation runs in the form before the client is called. The mock does not re-check the title or the clock.
- **Date entry.** One `datetime-local` field collects the calendar date and the time of day. A blank value means both are missing. The client sends `Date.toISOString()`.
- **Title length.** Length is `String.prototype.length` of the trimmed title. The title field has no `maxLength`, so an 81-character value can be submitted and rejected with a message.
- **Visible start.** Each start is a `time` element whose `dateTime` is the stored ISO string. Its visible text uses `toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })` and is non-empty. The test binds to the `dateTime` attribute, not to a timezone-specific clock string.

Existing compiler rules the new files must follow, from `tsconfig.app.json`: relative imports use `.ts` or `.tsx` extensions, type-only imports use `import type`, and status values are a string union rather than an enum (`erasableSyntaxOnly`). `noUnusedLocals` and `noUnusedParameters` are on. Vitest globals are off, so test and setup files import their helpers from `vitest`.

Leave these in place: `index.html`, `src/index.css`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.oxlintrc.json`, `public/favicon.svg`, `public/icons.svg`, and `src/assets/`. The starter heading size and centered `#root` rule stay in `src/index.css`. The workspace wrapper sets its own left alignment in `src/App.css`. Do not add a router, a state library, a date library, a component kit, or a second test runner.

## Ordered File Changes

Steps 3, 4, and 5 may proceed in parallel once steps 1 and 2 are done. Step 6 waits on step 3. Step 7 waits on steps 3, 4, and 5. Step 8 waits on steps 6 and 7.

1. **Add the mock dependency.** Update `package.json` and the lockfile by installing `msw` 2.x as a devDependency. Generate `public/mockServiceWorker.js` with that package’s worker init into `public/`, and keep the worker-directory entry the init writes into `package.json`. Do not hand-write the worker. This is the only new dependency. It is what the browser and Vitest both intercept `fetch` with, because the scaffold has no mock mechanism.

2. **Add the shared session type.** Create `src/sessions/types.ts`. Export the session type: `id`, `title`, `status` (`scheduled` or `completed`), and `startsAt`. The client, the mock, and the screen all import this type so the field names stay in one place.

3. **Add the mock store, handlers, and entry points.** These files depend on the `msw` install and the session type.
   - `src/mocks/seed.ts` exports the two seed sessions and nothing else.
   - `src/mocks/store.ts` holds the in-memory list, starting as a copy of the seed. It can return the current list, append one created session, and reset the list to a fresh seed copy. Reset exists so Vitest does not leak a created row into another test. The browser keeps the mutated list for the page session.
   - `src/mocks/handlers.ts` maps `GET /api/sessions` and `POST /api/sessions` onto that store. GET returns the full current list. POST reads `title` and `startsAt` from the JSON body, asks the store for a new `scheduled` session with a `crypto.randomUUID()` id, and returns that session.
   - `src/mocks/browser.ts` exports the service worker built from those handlers.
   - `src/mocks/node.ts` exports the Node server built from those same handlers.

4. **Add the request boundary.** Create `src/sessions/sessionClient.ts`. It is the only module that calls `fetch`. `listSessions` performs the GET. `createSession` performs the POST. UI code calls these two functions and does not call `fetch` itself. This file can be written in parallel with the mock once the path and field names above are fixed.

5. **Add validation.** Create `src/sessions/validation.ts`. It trims the title, checks length, and checks that the `datetime-local` value is present and strictly later than the `Date` passed in by the submit handler. On success it returns the trimmed title and the ISO start. On failure it returns the field messages and no payload. It does not call `fetch`. This file can be written in parallel with steps 3 and 4.

6. **Wire the Node mock into the existing test setup.** Modify `src/test/setup.ts`. Keep the jest-dom import. Before the suite, start the Node server from `src/mocks/node.ts` with unhandled requests treated as test failures. After each test, reset the session store and reset the handlers. After the suite, close the server. Import the lifecycle helpers from `vitest`.

7. **Replace the starter screen.** Depends on the client, validation, and the browser worker entry.
   - Create `src/sessions/CreateSessionForm.tsx`. It renders the title field, the start field, the validation messages, and the submit button. It calls the validation module and then `createSession`. It owns the pending flag for that request.
   - Create `src/sessions/SessionWorkspace.tsx`. It loads sessions through `listSessions`, renders loading, the list error and retry, the two filter choices, the list, and the control that opens the form. It keeps the loaded set and the active filter.
   - Modify `src/App.tsx` so it renders that workspace and drops the starter markup, starter asset imports, and counter state.
   - Replace `src/App.css` with a small left-aligned stack for the workspace, list, and form, using the existing `index.css` variables. Remove the starter-only rules in this file.
   - Modify `src/main.tsx` so it starts the browser worker before `createRoot`, with unhandled requests bypassed, and still renders the app if worker startup throws. Leave the existing `StrictMode` render.

8. **Replace the starter test.** Modify `src/App.test.tsx` so its single test covers the status filter described under Essential Tests. Remove the “Get started” assertion. Do not add another test file.

Do not edit `tasks/TASK-001/requirements.md`. Do not edit `tasks/TASK-001/workflow-log.md` as part of implementation; the manual observation is a later human record in that file, written only after the browser pass.

## Contracts And Dependencies

**Seed.** The store starts with exactly these two sessions:

- `ses-scheduled`, title `Intro to React`, status `scheduled`, `startsAt` `2026-12-01T09:00:00.000Z`
- `ses-completed`, title `Testing Basics`, status `completed`, `startsAt` `2026-10-15T14:00:00.000Z`

**List request.** `GET /api/sessions` responds `200` with JSON `{ sessions: Session[] }`. `listSessions` returns that array when the response is OK and every item has `id`, `title`, `status`, and `startsAt`. Any other outcome throws `Error` with the message `Sessions could not be loaded.` The workspace catches that error for the list request only.

**Create request.** `POST /api/sessions` sends JSON `{ title, startsAt }` and responds `201` with JSON `{ session: Session }`. The stored session uses the sent title and `startsAt`, a new id, and status `scheduled`. `createSession` returns that session when the response is OK and `session` has the four fields. Any other outcome throws. The form catches that throw, leaves the loaded set unchanged, and does not render a create-error screen.

**Load and retry.** The workspace starts in a loading phase and does not render the session list. A successful response replaces the loaded set and shows the list. A failure shows the text `Sessions could not be loaded.` and a button named `Try again`, and does not render the list. `Try again` returns to the loading phase and calls `listSessions` again. A later success removes the error and shows the sessions. Because `StrictMode` runs the load effect twice, a successful response replaces the list and never appends to it.

**Filter.** The initial choice is `All`. The two controls are buttons named `All` and `Scheduled`, with `aria-pressed` set on the active one. `All` shows every session in the loaded set. `Scheduled` shows only sessions whose status is `scheduled`. Changing the filter does not call `fetch`. Opening or closing the form does not change the filter.

**List row.** Render the visible sessions in a `ul`. Each session is an `li` containing an `h2` with the title, the status text `Scheduled` or `Completed`, and a `time` element whose `dateTime` is the stored `startsAt` and whose text is the non-empty formatted start. The page heading is an `h1` named `Training sessions`.

**Form.** A button named `Create session` opens the form. The list stays mounted. The title control’s accessible name is `Title`. The start control’s accessible name is `Start` and its type is `datetime-local`. The submit button’s accessible name is `Save session`.

**Validation messages.** Judge the draft only when the trainer submits. Trim before measuring. When the trimmed length is outside 3 to 80 inclusive, show `Title must be between 3 and 80 characters.` When the start value is blank, show `A date and time are required.` When the parsed local start is missing, invalid, or less than or equal to the `Date` captured at the start of that submit, show `Start must be in the future.` Show every failed message. Do not call `createSession` when any message is shown. When the trimmed length is inside the range, send the trimmed title, not the raw field value.

**Pending create.** If a create request is already pending, a further submit returns immediately and does not call `createSession` again. The submit button is disabled for that interval. On success, append the session returned by `createSession` to the loaded set, clear the pending flag, close the form, and clear its fields. Do not refetch the list. On failure, clear the pending flag, keep the form open with the entered values, and add no session.

**Mock lifetime.** Handlers read the store on each request. `resetSessions` restores the two seed rows. The test setup calls it after every test. The browser worker does not reset after a successful create.

**Screen dependency.** `src/App.tsx` renders the workspace. `src/main.tsx` starts the worker and then renders `App`. The behavior test renders `App` and relies on `src/test/setup.ts` for interception, so it does not start the service worker.

## Essential Tests

Modify `src/App.test.tsx`. Keep one test, and use the existing Vitest imports plus `@testing-library/react` and `@testing-library/user-event`. The setup file starts the mock, so this test does not start its own server and does not mock `fetch` by hand.

The test protects the filter and the loaded row contract:

- Render `App`.
- Wait until the headings `Intro to React` and `Testing Basics` are present, so the assertion happens after the list request resolves rather than during loading.
- Within the `Intro to React` row, expect the status text `Scheduled` and a `time` element whose `dateTime` is `2026-12-01T09:00:00.000Z` and whose text is not empty.
- Within the `Testing Basics` row, expect the status text `Completed` and a `time` element whose `dateTime` is `2026-10-15T14:00:00.000Z` and whose text is not empty.
- Activate the button named `Scheduled`.
- Expect `Intro to React` to remain and `Testing Basics` to be absent.
- Activate the button named `All`.
- Expect both titles to be present again.

Query the filter by button role so the `Scheduled` button is not confused with the `Scheduled` status text inside a row. Do not freeze the clock. This test does not open the create form.

## Additional Risk-Based Tests

Do not add these tests for this task. The required delivery is the one behavior-level test above. They are recorded only so a later failure has an obvious place to look:

- A valid trimmed title and a future start create one row through the client, the row’s title is the trimmed title, and the row is visible while `Scheduled` is selected. A second submit while the first create is still pending does not add another row.
- A list response that is not OK shows `Sessions could not be loaded.` and `Try again`. After the handler succeeds, `Try again` removes the error and shows the seed sessions.
- A trimmed title of 2 characters, a trimmed title of 81 characters, a blank start, and a start equal to the submit time each show the matching message and leave the seed list unchanged.

## Verification Commands

Run these from `/Users/user/Desktop/acs/accelerator`. They are the scripts already in `package.json`. Do not add a script, a runner, or a coverage command.

- `npm run test` — runs `vitest run` and must pass the filter test in `src/App.test.tsx`.
- `npm run lint` — runs `oxlint` and must pass for the touched files.
- `npm run build` — runs `tsc -b && vite build` and must succeed with the existing TypeScript settings.
- `npm run dev` — starts the Vite dev server used for the manual pass below.
- `npm run preview` — serves the production build. The worker starts from `src/main.tsx` in that bundle, so the same mock boundary is available there. This command checks that the built app serves; it is not a substitute for the `dev` observation.

Manual record, after the screen works, and not before it has been exercised: start `npm run dev`, use the list, switch `All` and `Scheduled`, create one valid session, and write what was actually seen in `tasks/TASK-001/workflow-log.md`. Record an incomplete or unrun pass as incomplete. The `browser-verify` role and screenshots are not required.

Installing `msw` and generating the worker are implementation steps, not extra verification commands.

## Risks And Rollback

No feature flag. This workspace is the screen the starter is being replaced with, and there is no separate session backend to switch on.

The real risks are narrow:

- A load effect that appends instead of replacing will duplicate rows under `StrictMode`. The success path replaces the loaded set from the response.
- The browser mock works only when `public/mockServiceWorker.js` is the generated worker and the page is served by `dev` or `preview`. If the worker fails to start, still render the app; the list request then fails into the existing error and retry.
- A created session with any status other than `scheduled` would stay hidden when that filter was selected before the form opened. The create handler assigns `scheduled`.

Rollback is to restore `src/App.tsx`, `src/App.css`, `src/App.test.tsx`, `src/main.tsx`, and `src/test/setup.ts`; remove `src/sessions/`, `src/mocks/`, and `public/mockServiceWorker.js`; and remove the `msw` dependency and its `package.json` worker-directory entry. Starter assets and `src/index.css` are untouched, so they do not need to be reconstructed.
