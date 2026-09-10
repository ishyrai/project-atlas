# Case rules

- Pin the exact upstream revision; never benchmark a moving branch.
- Preserve upstream license and attribution files.
- Keep `upstream/` pristine. Make all mutations in a case `workspace/`.
- Introduce one primary bug per case.
- Every case must have a deterministic reproduction command.
- Avoid requiring credentials, paid services, or uncontrolled network access.
- Store evaluator secrets, expected fixes, and hidden tests only in `oracle/`.
- Never point the evaluated AI at the whole `bug-benchmark/` directory.
- Record the model, tool, prompt, duration, outcome, and run date under `results/`.
- Review third-party code before execution; an open-source label is not a safety guarantee.
