/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

import {
    CurseForgeGetFingerprintMatchesRequestBody,
    CurseForgeGetFuzzyMatchesRequestBody,
    CurseForgeModLoaderType
} from './Types.js';

export interface CurseForgeGetModFileOptions {
	/** The mod id the file belongs to. */
	modId: number,
	/** The file id. */
	fileId: number,
}

export interface CurseForgeGetModFilesOptions {
	/** Filter by game version string. */
	gameVersion?: string,
	/** ModLoaderType enumeration. */
	modLoaderType?: CurseForgeModLoaderType,
	/** Filter only files that are tagged with versions of the given gameVersionTypeId. */
	gameVersionTypeId?: number,
	/** A zero based index of the first item to include in the response,  the limit is: (index + pageSize <= 10,000). */
	index?: number,
	/** The number of items to include in the response,  the default/maximum value is 50. */
	pageSize?: number,
}

export interface CurseForgeGetModFileChangelogOptions {
	/** The mod id the file belongs to. */
	modId: number,
	/** The file id. */
	fileId: number,
}

export interface CurseForgeGetModFileDownloadURLOptions {
	/** The mod id the file belongs to. */
	modId: number,
	/** The file id. */
	fileId: number,
}

export interface CurseForgeGetFingerprintsMatchesByGameIdOptions {
	/** The game id for matching fingerprints. */
	gameId: number,
	/** The request body containing an array of fingerprints. */
	body: CurseForgeGetFingerprintMatchesRequestBody,
}

export interface CurseForgeGetFingerprintsFuzzyMatchesByGameIdOptions {
	/** The game id for matching fingerprints. */
	gameId: number,
	/** Game id and folder fingerprints options for the fuzzy matching. */
	body: CurseForgeGetFuzzyMatchesRequestBody,
}

export interface CurseForgeGetMinecraftVersionsOptions {
	sortDescending?: boolean,
}

export interface CurseForgeGetMinecraftModLoadersOptions {
	version?: string,
	includeAll?: boolean,
}
