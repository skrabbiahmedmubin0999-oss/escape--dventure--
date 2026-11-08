# Combined repository ZIP

This folder contains a script to create one archive with the files from `main`
and `copilot/backend-phase2-security` combined. Files unique to either ref are
included; if a path differs between the two refs, the `main` version is used.

From the repository root, run:

```bash
bash zip/create-combined-zip.sh
```

The script writes `zip/escape-adventure-combined.zip`. It requires Git and the
standard `zip` command. You can override refs if needed:

```bash
MAIN_REF=main PHASE_BRANCH_REF=copilot/backend-phase2-security bash zip/create-combined-zip.sh
```

The generated ZIP is an output artifact and is not committed automatically.
