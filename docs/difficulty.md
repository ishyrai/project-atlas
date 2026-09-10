# Difficulty rubric

Difficulty describes the expected debugging effort, not the size of the patch.

| Level | Expected characteristics |
| --- | --- |
| `easy` | Failure is local, reproducible, and points near the faulty code. |
| `medium` | Requires tracing across multiple functions or understanding one subsystem. |
| `hard` | Symptom is distant from the cause, intermittent, or requires cross-module reasoning. |
| `expert` | Requires subtle domain knowledge, concurrency reasoning, or resolving several plausible causes. |

Record why the case earns its level in the private oracle notes. Do not expose
that reasoning to the system being evaluated.
