# ModpackUpdater — Project Context

## What This Is
A TypeScript CLI tool for updating mods in a CurseForge modpack directory. Checks for
mod updates, reports unknown mod files, and manages backups. Supports Forge, Fabric,
Quilt, Cauldron, and LiteLoader.

Not a Minecraft mod — no in-game component, no Gradle build, no release to
CurseForge/Modrinth.

## Project Structure
TypeScript/Node: `src/`, built to `dist/`, managed with `yarn`.

## Branch Convention
No Minecraft version branches. Single `main` branch.

## Pending Polish
This tool has not been actively maintained and needs the following before next use:
- Migrate from `yarn` to `pnpm` (workspace convention)
- Audit and update all dependencies to current versions
- Update `tsconfig.json` compiler options and Node.js version target
- Refresh README examples to reflect current CLI usage and pnpm commands

## Release Process
Build with package manager run script. No publishing pipeline.
