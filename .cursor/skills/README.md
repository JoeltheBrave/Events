# Workspace skills

## database-skills (PlanetScale)

Copied from the [PlanetScale Database Skills](https://github.com/planetscale/database-skills) plugin so they are part of this workspace and can be version-controlled.

- **mysql/** — MySQL/InnoDB schema, indexing, query tuning, migrations, replication.
- **postgres/** — PostgreSQL best practices, optimization, PlanetScale Postgres.
- **vitess/** — Vitess sharding, VSchema, keyspaces, VReplication.
- **neki/** — Neki sharded Postgres guidance.

The workspace rule `.cursor/rules/database-skills.mdc` tells the agent to use these skills when working with SQL/migrations/schema or database-related files.

## superpowers

Copied from the [Superpowers](https://github.com/obra/superpowers) plugin (TDD, debugging, collaboration, planning).

- **brainstorming/** — Before creative work; explore requirements and design.
- **dispatching-parallel-agents/** — Independent tasks in parallel.
- **executing-plans/** — Run implementation plans with review checkpoints.
- **finishing-a-development-branch/** — Merge/PR/cleanup when implementation is done.
- **receiving-code-review/** — Act on code review feedback with verification.
- **requesting-code-review/** — Get a review after major steps.
- **subagent-driven-development/** — Execute plans with independent tasks.
- **systematic-debugging/** — Structured debugging for bugs and test failures.
- **test-driven-development/** — Tests before implementation.
- **using-git-worktrees/** — Isolated worktrees for features or plans.
- **using-superpowers/** — How to find and use skills.
- **verification-before-completion/** — Verify before claiming done.
- **writing-plans/** — Turn specs into implementation plans.
- **writing-skills/** — Create or edit skills.

The workspace rule `.cursor/rules/superpowers.mdc` tells the agent to use these skills when the situation matches (always applied).
