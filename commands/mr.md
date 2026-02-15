Write a merge request description for the current branch's changes compared to dev.

Run `git diff dev...HEAD`, then write a clear description of what changed and why.

**Language Style:**
- Keep it conversational and natural, like talking to a teammate
- Mix prose and lists naturally
- Use simple, informal language - not corporate speak
- Write like a human, not AI
- Avoid phrases like "implemented enhancements" - say "added X" or "fixed Y"
- Be direct and specific

Save to `docs/<branch-name>/mr_<3-4 word summary>.md`