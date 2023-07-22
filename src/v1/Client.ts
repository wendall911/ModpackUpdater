import CurseForgeFile from './File.js';
import {
    CurseForgeGetMinecraftModLoadersOptions,
    CurseForgeGetMinecraftVersionsOptions,
    CurseForgeGetModFilesOptions
} from './Options.js';
import {
    UpdateFileData,
    CurseForgeModLoaderType,
    CurseForgeApiResponseOfListOfMinecraftGameVersion,
    CurseForgeApiResponseOfListOfMinecraftModLoaderIndex,
    CurseForgeApiResponseOfMinecraftGameVersion,
    CurseForgeApiResponseOfMinecraftModLoaderVersion,
    CurseForgeFingerprintFuzzyMatchRaw,
    CurseForgeFingerprintMatchRaw,
    CurseForgeFingerprintsMatchesResult,
    CurseForgeGetFilesResponseRaw,
    CurseForgeGetFingerprintMatchesResponseRaw,
    CurseForgeGetFingerprintsFuzzyMatchesResponseRaw,
    CurseForgeGetFuzzyMatchesRequestBody,
    CurseForgeGetModFilesResponseRaw,
    CurseForgePagination,
    CurseForgeStringResponseRaw
} from './Types.js';
import curseforge from '@meza/curseforge-fingerprint';
import * as path from 'path';
import * as fs from 'fs';
import { mkdir } from 'fs/promises';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';
import { finished } from 'stream/promises';

export type CurseForgeClass = typeof CurseForgeFile;

export type CurseForgeFetchQuery = Record<string, boolean | number | string>;

// Temporary fetch() typing until supported by @types/node
export interface NodeJSFetchOptions {
    /** A BodyInit object or null to set request's body. */
    body?: string | null;
    /** A string indicating how the request will interact with the browser's cache to set request's cache. */
    cache?: 'default' | 'force-cache' | 'no-cache' | 'no-store' | 'only-if-cached' | 'reload';
    /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
    credentials?: 'include' | 'omit' | 'same-origin';
    /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
    headers?: string[][] | Record<string, string>;
    /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
    integrity?: string;
    /** A boolean to set request's keepalive. */
    keepalive?: boolean;
    /** A string to set request's method. */
    method?: string;
    /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
    mode?: 'cors' | 'navigate' | 'no-cors' | 'same-origin';
    /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
    redirect?: 'error' | 'follow' | 'manual';
    /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
    referrer?: string;
    /** A referrer policy to set request's referrerPolicy. */
    referrerPolicy?: '' | 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
    /** An AbortSignal to set request's signal. */
    signal?: AbortSignal | null;
}

export interface CurseForgeFetchOptions extends NodeJSFetchOptions {
    query?: CurseForgeFetchQuery;
}

export interface CurseForgeResponseErrorOptions {
    /** Request path, excluding the host name. */
    path: string,
    /** Response status code. */
    status: number,
    /** Response status code text. */
    statusText: string,
}

export class CurseForgeResponseError extends Error {
    /** Request path, excluding the host name. */
    path: string;
    /** Response status code. */
    status: number;
    /** Response status code text. */
    statusText: string;

    constructor({path, status, statusText}: CurseForgeResponseErrorOptions) {
        super(`API request to ${path} failed: ${status} (${statusText})`);

        this.path = path;
        this.status = status;
        this.statusText = statusText;
    }
}

export interface CurseForgeClientOptions {
    /** Provide a separate implementation of fetch(). */
    fetch?: (...args: any[]) => Promise<any>,
}

export interface CurseForgePaginatedResponse<T> {
    pagination: CurseForgePagination,
    data: T[],
}

export interface CurseForgeFingerprintMatch extends Omit<CurseForgeFingerprintMatchRaw, 'file' | 'latestFiles'> {
    file: CurseForgeFile,
    latestFiles: CurseForgeFile[],
}

export interface CurseForgeFingerprintsMatches extends Omit<CurseForgeFingerprintsMatchesResult, 'exactMatches' | 'partialMatches'> {
    exactMatches: CurseForgeFingerprintMatch[],
    partialMatches: CurseForgeFingerprintMatch[],
}

export interface CurseForgeFingerprintFuzzyMatch extends Omit<CurseForgeFingerprintFuzzyMatchRaw, 'file' | 'latestFiles'> {
    file: CurseForgeFile,
    latestFiles: CurseForgeFile[],
}

/**
 * The main class to interact with the CurseForge Core API.
 */
export default class CurseForgeClient {
    #apiHost = 'https://api.curse.tools/v1/cf';
    #fetch: (...args: any[]) => Promise<any>;
    static #dateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

    /**
     * Constructs a new client to interact with the CurseForge Core API.
     * @param options Additional options to define how the client works
     */
    constructor(options?: CurseForgeClientOptions) {
        if (options?.fetch) {
            this.#fetch = options.fetch;
        } else {
            try {
                this.#fetch = fetch;
            } catch {}
        }

        // @ts-ignore Allow #fetch to be undefined, but throw
        if (typeof this.#fetch === 'undefined') {
            throw new TypeError('fetch() is not available in this environment. Please provide an implementation of fetch.');
        }
    }

    /**
     * Does an in place conversion of date string values into [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) objects.
     * @param object - The object to convert
     * @returns The object
     */
    static #upgrade(object: any) {
        if (object === null || typeof object !== 'object') {
            return object;
        }

        const entries = Object.entries(object);

        for (const [key, value] of entries) {
            if (typeof value === 'string' && value.match(CurseForgeClient.#dateRegex)) {
                object[key] = new Date(value);
            } else if (typeof value === 'object') {
                object[key] = CurseForgeClient.#upgrade(value);
            }
        }

        return object;
    }

    /**
     * Sends a request to the given API endpoint.
     * @internal
     * @param path - The endpoint, excluding the protocol and hostname
     * @param options - Any options to use in the request
     * @returns A JSON object containing the API response
     * @throws {@link CurseForgeResponseError} when the request fails
     */
    async fetchUrl(path: string, options: CurseForgeFetchOptions = {}) {
        options.headers = {
            ...options.headers
        };

        let url = `${this.#apiHost}${path}`;

        if (options.body && options.method === undefined) {
            options.method = 'POST';
            options.headers = {
                ...options.headers,
                'Content-Type': 'application/json',
            };
        }

        if (options.query) {
            const entries = Object.entries(options.query);

            if (entries.length > 0) {
                url = `${url}?${entries.map(([key, value]) => {
                    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
                }).join('&')}`;
            }
        }

        const response = await this.#fetch(url, options);

        if (response.status === 200) {
            const data = await response.json();
            return CurseForgeClient.#upgrade(data) as Record<string, any>;
        } else {
            throw new CurseForgeResponseError({
                path,
                status: response.status,
                statusText: response.statusText,
            });
        }
    }

    /**
     * Creates an array of the given class.
     * @param CurseForgeType The class of objects to create
     * @param data The raw API response array data
     * @returns An array of `CurseForgeType` objects
     */
    #getArrayResponse<T>(CurseForgeType: CurseForgeClass, data: Record<string, any>): T[] {
        return data.map((rawResponse: any) => {
            return new CurseForgeType(this, rawResponse);
        });
    }

    /**
     * Creates a paginated response of the given class.
     * @param CurseForgeType The class of objects to create
     * @param data The raw paginated API response data
     * @returns The paginated object containing `CurseForgeType` objects
     */
    #getPaginatedResponse<T>(CurseForgeType: CurseForgeClass, data: Record<string, any>): CurseForgePaginatedResponse<T> {
        return {
            pagination: data.pagination,
            data: this.#getArrayResponse<T>(CurseForgeType, data.data),
        };
    }

    /**
     * Get all files of the specified mod.
     * @param modId The mod id the files belong to
     * @param options Additional search criteria
     * @returns A list of mods
     * @throws {@link CurseForgeResponseError} when the request fails
     */
    async getModFiles(modId: number, options?: CurseForgeGetModFilesOptions) {
        const data = await this.fetchUrl(`/mods/${modId}/files`, {query: options as CurseForgeFetchQuery}) as CurseForgeGetModFilesResponseRaw;

        return this.#getPaginatedResponse<CurseForgeFile>(CurseForgeFile, data);
    }

    /**
     * Get a list of files.
     * @param fileIds A list of file ids to fetch
     * @returns A list of files
     * @throws {@link CurseForgeResponseError} when the request fails
     */
    async getFiles(fileIds: number[]) {
        const {data} = await this.fetchUrl('/mods/files', {
            body: JSON.stringify({fileIds}),
        }) as CurseForgeGetFilesResponseRaw;

        return this.#getArrayResponse<CurseForgeFile>(CurseForgeFile, data);
    }

    /**
     * Get the changelog of a file in HTML format.
     * @param modId The mod id the file belongs to
     * @param fileId The file id
     * @returns The HTML changelog
     * @throws {@link CurseForgeResponseError} when the request fails
     */
    async getModFileChangelog(modId: number, fileId: number) {
        const {data} = await this.fetchUrl(`/mods/${modId}/files/${fileId}/changelog`) as CurseForgeStringResponseRaw;

        return data;
    }

    /**
     * Get a download URL for a specific file.
     * @param modId The mod id the file belongs to
     * @param fileId The file id
     * @returns The URL
     * @throws {@link CurseForgeResponseError} when the request fails
     */
    async getModFileDownloadURL(modId: number, fileId: number) {
        const {data} = await this.fetchUrl(`/mods/${modId}/files/${fileId}/download-url`) as CurseForgeStringResponseRaw;

        return data;
    }

    /**
     *
     * @param fingerprints An array of fingerprints
     * @returns A list of mod files
     * @throws {@link CurseForgeResponseError} when the request fails
     */
    async getFingerprintsMatches(fingerprints: number[]): Promise<CurseForgeFingerprintsMatches> {
        const {data} = await this.fetchUrl('/fingerprints', {
            body: JSON.stringify({fingerprints}),
        }) as CurseForgeGetFingerprintMatchesResponseRaw;

        return {
            ...data,
            exactMatches: data.exactMatches.map((exactMatchRaw) => {
                return {
                    ...exactMatchRaw,
                    file: new CurseForgeFile(this, exactMatchRaw.file),
                    latestFiles: this.#getArrayResponse<CurseForgeFile>(CurseForgeFile, exactMatchRaw.latestFiles),
                };
            }),
            partialMatches: data.partialMatches.map((partialMatchRaw) => {
                return {
                    ...partialMatchRaw,
                    file: new CurseForgeFile(this, partialMatchRaw.file),
                    latestFiles: this.#getArrayResponse<CurseForgeFile>(CurseForgeFile, partialMatchRaw.latestFiles),
                };
            }),
        };
    }

    /**
     * Get mod files that match a list of fingerprints using fuzzy matching.
     * @param options Game id and folder fingerprints options for the fuzzy matching
     * @returns A list of mod files
     * @throws {@link CurseForgeResponseError} when the request fails
     */
    async getFingerprintsFuzzyMatches(options: CurseForgeGetFuzzyMatchesRequestBody): Promise<CurseForgeFingerprintFuzzyMatch[]> {
        const {data} = await this.fetchUrl('/fingerprints/fuzzy', {
            body: JSON.stringify(options),
        }) as CurseForgeGetFingerprintsFuzzyMatchesResponseRaw;

        return data.fuzzyMatches.map((fuzzyMatchRaw) => {
            return {
                ...fuzzyMatchRaw,
                file: new CurseForgeFile(this, fuzzyMatchRaw.file),
                latestFiles: this.#getArrayResponse<CurseForgeFile>(CurseForgeFile, fuzzyMatchRaw.latestFiles),
            };
        });
    }

    /**
     *
     * @param options Sort options
     * @returns A list of Minecraft game versions
     * @throws {@link CurseForgeResponseError} when the request fails
     */
    async getMinecraftVersions(options?: CurseForgeGetMinecraftVersionsOptions) {
        const {data} = await this.fetchUrl('/minecraft/version', {query: options as CurseForgeFetchQuery}) as CurseForgeApiResponseOfListOfMinecraftGameVersion;

        return data;
    }

    /**
     *
     * @param gameVersionString
     * @returns A Minecraft game version
     * @throws {@link CurseForgeResponseError} when the request fails
     */
    async getSpecificMinecraftVersion(gameVersionString: string) {
        const {data} = await this.fetchUrl(`/minecraft/version/${gameVersionString}`) as CurseForgeApiResponseOfMinecraftGameVersion;

        return data;
    }

    /**
     *
     * @param options Filter options
     * @returns A list of Minecraft mod loaders
     */
    async getMinecraftModLoaders(options?: CurseForgeGetMinecraftModLoadersOptions) {
        const {data} = await this.fetchUrl('/minecraft/modloader', {query: options as CurseForgeFetchQuery}) as CurseForgeApiResponseOfListOfMinecraftModLoaderIndex;

        return data;
    }

    /**
     *
     * @param modLoaderName
     * @returns A Minecraft mod loader
     */
    async getSpecificMinecraftModLoader(modLoaderName: string) {
        const {data} = await this.fetchUrl(`/minecraft/modloader/${modLoaderName}`) as CurseForgeApiResponseOfMinecraftModLoaderVersion;

        return data;
    }

    async checkUpdates(filepath: string, gameVersion: string, loader: CurseForgeModLoaderType, missing: boolean, showAll: boolean) {
        try {
            const files = await fs.promises.readdir(filepath);
            const checkFiles = files.map(async (file: string) => {
                const fingerprint = curseforge.fingerprint(path.resolve(filepath, file));
                const matchesResult = await this.getFingerprintsMatches([fingerprint]);
                let modId = -1;
                let updateAvailable = false;
                let onCurseforge = false;
                let updateFile = '';
                let downloadUrl = '';

                if (matchesResult.exactMatches.length > 0) {
                    modId = matchesResult.exactMatches[0].file.modId;

                    const updateFiles = await this.getModFiles(modId, {
                        gameVersion: gameVersion,
                        modLoaderType: loader,
                        pageSize: 1,
                    });

                    if (updateFiles.data.length > 0) {
                        onCurseforge = true;
                        updateFile = updateFiles.data[0].fileName;
                        updateAvailable = updateFile != file;
                    }

                    if (updateAvailable) {
                        downloadUrl = updateFiles.data[0].downloadUrl;
                    }
                }

                const record: UpdateFileData = {
                    filename: file,
                    modId: modId,
                    updateFile: updateFile,
                    downloadUrl: downloadUrl,
                    updateAvailable: updateAvailable
                };

                return record;
            });

            const checkedFiles = await Promise.all(checkFiles);
            const filteredFiles = checkedFiles.filter(function(record) {
                if ((missing && record.modId == -1) || record.updateAvailable || showAll) {
                    return record;
                }
            });

            return filteredFiles;
        } catch (error) {
            console.error("Error occurred while reading the directory!", error);
        }

        return [];
    }

    async applyUpdates(filepath: string, backupPath: string, updateFilesData: UpdateFileData[]) {
        const updateFiles = updateFilesData.map(async (fileData: UpdateFileData) => {
            if (fileData.updateAvailable) {
                if (!fs.existsSync(backupPath)) await mkdir(backupPath);

                const filePath = path.join(filepath, fileData.updateFile);
                const stream = fs.createWriteStream(filePath);
                const { body } = await fetch(fileData.downloadUrl as RequestInfo);

                await finished(Readable.fromWeb(body as ReadableStream<any>).pipe(stream));

                fs.rename(path.resolve(filepath, fileData.filename), path.resolve(backupPath, fileData.filename), function(err) {
                    if (err) throw err
                });
            }
        });

        const updateFilesPromises = await Promise.all(updateFiles);
    }

}
