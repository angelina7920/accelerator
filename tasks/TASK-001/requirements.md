# TASK-001: Training Sessions Workspace

## Goal

A trainer can open one small workspace, see training sessions loaded through a mock request boundary, filter that list by one status, and create a session with a title and a future start date and time. After a successful create, the new session is visible in the list.

## Users And Outcome

**User:** A trainer.

**Problem:** The current screen is the Vite starter. It does not show training sessions, filter them, or create one.

**Desired outcome:** The trainer opens the workspace and sees sessions supplied by a mock HTTP request. The trainer can show every session or only sessions of one status, open a create form, submit a valid title and future start, and see the created session in the list. Invalid input is explained and is not saved. A failed list request is explained and can be retried.

## Acceptance Criteria

- [ ] Opening the workspace requests sessions through a replaceable HTTP client or equivalent request boundary, and the sessions on screen come from that response.
- [ ] While the list request is pending, the workspace shows a loading state and does not present the session list as ready.
- [ ] When the list request succeeds, every visible session shows its title, its status, and its start date and time.
- [ ] When the list request fails, the workspace shows one understandable error message and a retry action for that same request. A successful retry removes the error and shows the loaded sessions.
- [ ] The list has exactly two choices: `All`, and one status.
- [ ] `All` shows every session in the loaded set.
- [ ] The status choice shows only sessions with that status and hides sessions with any other status.
- [ ] The loaded set includes at least one session with the filter status and at least one session with a different status, so the two choices show different sessions.
- [ ] The trainer starts from the session list and opens the create form with a user action.
- [ ] The form requires a title and a start date and time. The trainer does not have to type a status.
- [ ] A trimmed title of 3 characters is valid. A trimmed title of 80 characters is valid. A trimmed title of 2 characters or fewer, or 81 characters or more, does not create a session and shows a validation message that identifies the title problem.
- [ ] A title is judged only after trimming. When the trimmed title is 3 to 80 characters, surrounding whitespace is accepted, and the created session shows the trimmed title.
- [ ] A missing date or a missing time does not create a session and shows a validation message that a date and time are required.
- [ ] A start that is equal to or earlier than the time of the submit attempt does not create a session and shows a validation message that the start must be in the future.
- [ ] A trimmed title of 3 to 80 characters and a start strictly later than the submit attempt create exactly one session through the same replaceable request boundary.
- [ ] While that create request is pending, another submit does not create a second session.
- [ ] After the create request succeeds, the new session is in the loaded set and is visible on screen with its title, status, and start date and time, including when a filter was selected before the form was opened.
- [ ] The automated suite, run with the repository test script, includes at least one passing behavior-level test of either the status filter or a successful create that appears in the list. The test uses the existing Vitest and Testing Library setup.
- [ ] A person starts the app with the repository `dev` script and records one real browser observation of the list, the status filter, and a successful create in `tasks/TASK-001/workflow-log.md`. The record describes what was actually seen.

## Constraints

- Use the repository React, TypeScript, Vite, npm, Oxlint, and Vitest stack and the existing `dev`, `build`, `lint`, `preview`, and `test` scripts.
- Keep session loading and session creation behind one replaceable HTTP client or equivalent request boundary.
- The scaffold has no mock mechanism. A conventional HTTP mock, such as MSW or another library of the same kind, is acceptable. This requirements document does not choose the library, the paths, or the JSON field names.
- Do not implement a backend service.
- Leave unrelated scaffold configuration and code in place. Replacing the starter screen, starter-only styles, and the starter test assertion is required because that screen is what this workspace replaces.
- UI copy for this flow is English, consistent with `index.html` (`lang="en"`).
- Validation messages and the list error are readable text.
- The manual browser note is written only after the flow has actually been exercised.
- Dependencies for implementation are the existing frontend toolchain, a mock in front of the request boundary, and the task file `frontend-accelerator-onboarding/TASK.md`. There is no session API, design system, or living session specification to depend on.

## Non-Goals

- Session details, drawers, and deep links
- Search, extra status filters, and pagination
- A complete API contract or scenario matrix
- Desktop and mobile screenshot sets
- Exhaustive responsive layout and accessibility validation
- An empty-list design, a create-request error screen, and extra race or failure scenarios
- Full automated coverage beyond the one required behavior-level test
- CI, deployment, and a public URL
- Authentication, permissions, editing, and deletion
- A strict TypeScript migration and unrelated refactoring
- A prescribed visual design, component structure, router, or state library

## Facts

- The task identifier is `TASK-001`. The product request is `frontend-accelerator-onboarding/TASK.md`.
- The request asks for a trainer workspace that loads sessions from a mock API, filters by one status, opens a create form, creates a session with a title and a future date and time, and shows the created session in the list.
- Required list behavior is title, status, and start date and time; an `All` choice plus one status filter; a loading state while the list request is pending; and one understandable, recoverable request-error state.
- Required create behavior is a trimmed title of 3 to 80 characters, a future date and time, no duplicate submit while the request is pending, a useful validation message, and the created session added to the visible list.
- Required delivery also includes one behavior-level automated test for filtering or successful creation, and one recorded manual browser pass of list, filter, and create. The `browser-verify` role is optional.
- The application root is `/Users/user/Desktop/acs/accelerator`. `package.json` defines `dev` as Vite, `test` as `vitest run`, and also `build`, `lint`, and `preview`. Runtime dependencies are React and React DOM. The test stack is Vitest, jsdom, and Testing Library, with setup in `src/test/setup.ts`.
- `src/App.tsx` renders the Vite starter, including the heading “Get started” and a counter. `src/App.test.tsx` asserts that heading. `src/` contains no session feature, no `fetch` call, and no mock server. `package.json` has no HTTP mock dependency.
- No living session specification exists in the repository. `frontend-accelerator-assessment/` was not used.
- `tasks/TASK-001/workflow-log.md` already exists and was not changed. It records Doctor as `DEGRADED` because runtime hooks are pending activation, and it records that this status does not block the role workflow.

## Assumptions

- The trainer is the only user, and the workspace has no sign-in.
- “Between 3 and 80 characters” includes 3 and 80 and excludes 2 and 81. Length is the length of the trimmed title.
- “In the future” means strictly later than the clock time at the submit attempt, compared in the trainer’s local date and time.
- The task does not name statuses. One stable status label is enough for the single filter. A created session receives a status from that same small set, without the trainer typing it.
- Recovery from the list error is a retry of the list request.
- The create request is not given its own required error screen. A create that does not succeed adds no session.
- The list loading state is the required loading state. The pending create request only has to block a duplicate submit.
- After a successful create, the screen the trainer is looking at includes the new session, so an active status filter does not leave the new session hidden.
- Date and time may be collected as one value or as separate inputs, provided both a calendar date and a time of day are required before create.
- Exact validation wording can vary. The message has to identify the rule that failed.
- Paths, payload names, and the mock library can be chosen during planning and implementation. Those choices are not a confirmed API contract.
- English text is sufficient. No translation behavior is required.

## Open Questions

- **Status labels — non-blocking.** The task does not name the filter status or the status given to a new session. Any one consistent label satisfies the request. `brainstorm` would own this only if a prescribed vocabulary is wanted.
- **Visual direction — non-blocking.** No layout, color, or component appearance is specified. `ui-designer` would own a prescribed visual direction. The onboarding task does not require one.
- **API contract — non-blocking.** No URL, payload, or error schema is specified, and a complete contract is an explicit non-goal. `api-integration` would own a real contract. The required boundary is only replaceable list and create requests.
- **Architecture — non-blocking.** No module split, router, or state library is specified. `architect` would own that decision if planning finds a boundary this Vite React app cannot meet. The request does not require that decision before planning.

## Readiness

Ready for `writing-plans`. The trainer, problem, outcome, observable behavior, constraints, dependencies, non-goals, and acceptance criteria are specific enough to plan the workspace. Unspecified labels, request shape, visual treatment, and code structure are recorded as assumptions or non-blocking specialist gaps, not as confirmed product decisions.
