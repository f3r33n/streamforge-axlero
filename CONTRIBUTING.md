# 🤝 Contributing to StreamForge

StreamForge is developed collaboratively using individual Git branches.

## Basic Rule

Do not develop directly on `main`.

Each member should primarily work on their assigned personal branch.

## Branches

```text
main          → Stable project
develop       → Integration/testing
<your-name>   → Your development workspace
```

## Basic Workflow

Before starting work:

```bash
git pull
git checkout <your-branch>
```

After making changes:

```bash
git status
git add .
git commit -m "Describe what you changed"
git push origin <your-branch>
```

Replace `<your-branch>` with your assigned branch name.

Example:

```bash
git checkout sehajdeep
git add .
git commit -m "Add initial Kafka consumer"
git push origin sehajdeep
```

## Commit Messages

Use short, meaningful messages.

Good:

```text
Add telemetry generator
Add Kafka consumer
Implement truck stats endpoint
Fix fuel alert calculation
Add dashboard truck cards
```

Avoid:

```text
update
changes
final
final2
workingmaybe
asdf
```

## Integration

When a component or meaningful feature is ready:

1. Push the latest code to your personal branch.
2. Inform the team lead.
3. The changes will be reviewed/tested.
4. Approved changes will be integrated into `develop`.
5. Stable integrated versions will eventually be merged into `main`.

## Before Pushing

Check:

- Does the code run?
- Did you accidentally include API keys/passwords?
- Are unnecessary generated files excluded?
- Are dependencies documented?
- Can you explain what your code does?

Never commit passwords, API keys, tokens or other secrets.
