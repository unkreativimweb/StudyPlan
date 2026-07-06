# Future Thoughts: Revisions & Buffers

## The 2-Day Buffer Goal
The scheduler logic has been updated to subtract 2 days from the actual `deadline` when prioritizing exams. This ensures that the primary workload for an exam is planned to finish at least 48 hours before the actual test date. 

## Revisions Feature (To be implemented later)
Currently, a topic transitions straight from `TODO` -> `IN_PROGRESS` -> `COMPLETED`.
Once it is completed, it is dropped from the scheduling queue.

If we want to allow for "Revisions", we need a mechanism to pull completed topics back into the queue or create dedicated revision blocks.

### Ideas for Implementation:
1. **Status Loop:** Introduce a new status or flag on a Topic (e.g. `needsRevision = true`). When marked, it pops back into the queue but perhaps with a smaller `expectedDurationMinutes` (e.g. 50% of original) since it's just a review.
2. **Dedicated Revision Topics:** When a user creates an exam, the system could automatically inject generic "Revision" topics (e.g. "Revision 1", "Revision 2") that are locked (`notBefore = deadline - 2 days`) so they exclusively occupy those buffer days.
3. **Spaced Repetition Engine:** Once a topic is completed, automatically clone it as a new "Revision" topic and set its `notBefore` date to `Date.now() + 3 days` to force spaced repetition.

*Note: None of this is implemented yet. Stick to the core MVP rules in `AGENTS.md` before expanding.*
