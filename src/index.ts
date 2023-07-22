#! /usr/bin/env node

import CurseForgeClient from './v1/Client.js';
import { UpdateFileData, CurseForgeModLoaderType } from './v1/Types.js';
import { createCommand, Option } from 'commander';
import figlet from "figlet";

const commander = createCommand();

console.log(figlet.textSync("Modpack Updater"));

commander
    .name("modpackupdater")
    .description("Update a CurseForge Modpack")
    .version("1.0.0")
    .requiredOption("-d, --dir <value>", "Modules directory")
    .requiredOption("-b, --backupDir <value>", "Backup directory")
    .addOption(new Option('-l, --loader <value>', 'Mod Loader"').choices(['Forge', 'Fabric', 'Quilt', 'Cauldron', 'LiteLoader']).makeOptionMandatory())
    .requiredOption("-gv, --gameVersion <value>", "Game version, ex. 1.20.1")
    .option("-u, --update", "Update mods.")
    .option("-m, --missing", "Show unknown mod files.")
    .option("-a, --showAll", "Show all files");

commander.parse();

const options = commander.opts();
const client = new CurseForgeClient({ fetch });
const loader: CurseForgeModLoaderType = CurseForgeModLoaderType[options.loader as keyof typeof CurseForgeModLoaderType];
const missing = options.missing ? true : false;
const showAll = options.showAll ? true: false;

const updateFiles: UpdateFileData[] = await client.checkUpdates(options.dir, options.gameVersion, loader, missing, showAll);

if (options.update) {
    await client.applyUpdates(options.dir, options.backupDir, updateFiles);
}

const displayFiles = updateFiles.filter(function(record) {
    delete record.downloadUrl;
    delete record.updateAvailable;

    if (record.filename == record.updateFile) {
        record.updateFile = 'none';
    }
    if (record.modId == -1) {
        record.updateFile = 'missing';
    }

    return record;
});

console.table(displayFiles);
