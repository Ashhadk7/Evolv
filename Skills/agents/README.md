# Specialist agent definitions

Claude Code reads these files when agents are invoked by name. Each file is a
single agent definition: frontmatter (name + description) + scope, conventions,
definition-of-done, and don'ts.

To invoke an agent from a Claude Code session at the repo root:

    > Use the page-builder agent to build the Solutions page.

Updates to these files flow through PRs like any other code change. When you
learn something about how an agent should behave, write it down here — next
time Mayank or Maria runs that agent, the lesson carries over.
