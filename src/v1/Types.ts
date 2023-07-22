/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

export interface CurseForgeApiResponseOfListOfMinecraftGameVersion {
	/** The response data. */
	data: CurseForgeMinecraftGameVersion[],
}

export interface CurseForgeApiResponseOfListOfMinecraftModLoaderIndex {
	/** The response data. */
	data: CurseForgeMinecraftModLoaderIndex[],
}

export interface CurseForgeApiResponseOfMinecraftGameVersion {
	/** The response data. */
	data: CurseForgeMinecraftGameVersion,
}

export interface CurseForgeApiResponseOfMinecraftModLoaderVersion {
	/** The response data. */
	data: CurseForgeMinecraftModLoaderVersion,
}

export enum CurseForgeCoreApiStatus {
	Private = 1,
	Public = 2,
}

export enum CurseForgeCoreStatus {
	Draft = 1,
	Test = 2,
	PendingReview = 3,
	Rejected = 4,
	Approved = 5,
	Live = 6,
}

export interface CurseForgeFileRaw {
	/** The file id. */
	id: number,
	/** The game id related to the mod that this file belongs to. */
	gameId: number,
	/** The mod id. */
	modId: number,
	/** Whether the file is available to download. */
	isAvailable: boolean,
	/** Display name of the file. */
	displayName: string,
	/** Exact file name. */
	fileName: string,
	/** The file release type. */
	releaseType: CurseForgeFileReleaseType,
	/** Status of the file. */
	fileStatus: CurseForgeFileStatus,
	/** The file hash (i.e. md5 or sha1). */
	hashes: CurseForgeFileHash[],
	/** The file timestamp. */
	fileDate: Date,
	/** The file length in bytes. */
	fileLength: number,
	/** The number of downloads for the file. */
	downloadCount: number,
	/** The file download URL. */
	downloadUrl: string,
	/** List of game versions this file is relevant for. */
	gameVersions: string[],
	/** Metadata used for sorting by game versions. */
	sortableGameVersions: CurseForgeSortableGameVersion[],
	/** List of dependencies files. */
	dependencies: CurseForgeFileDependency[],
	exposeAsAlternative?: boolean,
	parentProjectFileId?: number,
	alternateFileId?: number,
	isServerPack?: boolean,
	serverPackFileId?: number,
	isEarlyAccessContent?: boolean,
	earlyAccessEndDate?: Date,
	fileFingerprint: number,
	modules: CurseForgeFileModule[],
}

export interface CurseForgeFileDependency {
	modId: number,
	relationType: CurseForgeFileRelationType,
}

export interface CurseForgeFileHash {
	value: string,
	algo: CurseForgeHashAlgo,
}

export interface CurseForgeFileIndex {
	gameVersion: string,
	fileId: number,
	filename: string,
	releaseType: CurseForgeFileReleaseType,
	gameVersionTypeId?: number,
	modLoader: CurseForgeModLoaderType,
}

export interface CurseForgeFileModule {
	name: string,
	fingerprint: number,
}

export enum CurseForgeFileRelationType {
	EmbeddedLibrary = 1,
	OptionalDependency = 2,
	RequiredDependency = 3,
	Tool = 4,
	Incompatible = 5,
	Include = 6,
}

export enum CurseForgeFileReleaseType {
	Release = 1,
	Beta = 2,
	Alpha = 3,
}

export enum CurseForgeFileStatus {
	Processing = 1,
	ChangesRequired = 2,
	UnderReview = 3,
	Approved = 4,
	Rejected = 5,
	MalwareDetected = 6,
	Deleted = 7,
	Archived = 8,
	Testing = 9,
	Released = 10,
	ReadyForReview = 11,
	Deprecated = 12,
	Baking = 13,
	AwaitingPublishing = 14,
	FailedPublishing = 15,
}

export interface CurseForgeFingerprintFuzzyMatchRaw {
	id: number,
	file: CurseForgeFileRaw,
	latestFiles: CurseForgeFileRaw[],
	fingerprints: number[],
}

export interface CurseForgeFingerprintFuzzyMatchResult {
	fuzzyMatches: CurseForgeFingerprintFuzzyMatchRaw[],
}

export interface CurseForgeFingerprintMatchRaw {
	id: number,
	file: CurseForgeFileRaw,
	latestFiles: CurseForgeFileRaw[],
}

export interface CurseForgeFingerprintsMatchesResult {
	isCacheBuilt: boolean,
	exactMatches: CurseForgeFingerprintMatchRaw[],
	exactFingerprints: number[],
	partialMatches: CurseForgeFingerprintMatchRaw[],
	partialMatchFingerprints: object,
	additionalProperties: number[],
	installedFingerprints: number[],
	unmatchedFingerprints: number[],
}

export interface CurseForgeFolderFingerprint {
	foldername: string,
	fingerprints: number[],
}

export interface CurseForgeGameVersion {
	id: number,
	slug: string,
	name: string,
}

export enum CurseForgeGameVersionStatus {
	Approved = 1,
	Deleted = 2,
	New = 3,
}

export enum CurseForgeGameVersionTypeStatus {
	Normal = 1,
	Deleted = 2,
}

export interface CurseForgeGetFilesResponseRaw {
	/** The response data. */
	data: CurseForgeFileRaw[],
}

export interface CurseForgeGetFingerprintMatchesResponseRaw {
	/** The response data. */
	data: CurseForgeFingerprintsMatchesResult,
}

export interface CurseForgeGetFingerprintsFuzzyMatchesResponseRaw {
	/** The response data. */
	data: CurseForgeFingerprintFuzzyMatchResult,
}

export interface CurseForgeGetModFilesResponseRaw {
	/** The response data. */
	data: CurseForgeFileRaw[],
	/** The response pagination information. */
	pagination: CurseForgePagination,
}

export interface CurseForgeGetFingerprintMatchesRequestBody {
	fingerprints: number[],
}

export interface CurseForgeGetFuzzyMatchesRequestBody {
	gameId: number,
	fingerprints: CurseForgeFolderFingerprint[],
}

export interface CurseForgeGetModFilesRequestBody {
	fileIds: number[],
}

export interface CurseForgeGetModsByIdsListRequestBody {
	modIds: number[],
}

export enum CurseForgeHashAlgo {
	Sha1 = 1,
	Md5 = 2,
}

export interface CurseForgeMinecraftGameVersion {
	id: number,
	gameVersionId: number,
	versionString: string,
	jarDownloadUrl: string,
	jsonDownloadUrl: string,
	approved: boolean,
	dateModified: Date,
	gameVersionTypeId: number,
	gameVersionStatus: CurseForgeGameVersionStatus,
	gameVersionTypeStatus: CurseForgeGameVersionTypeStatus,
}

export interface CurseForgeMinecraftModLoaderIndex {
	name: string,
	gameVersion: string,
	latest: boolean,
	recommended: boolean,
	dateModified: Date,
	type: CurseForgeModLoaderType,
}

export interface CurseForgeMinecraftModLoaderVersion {
	id: number,
	gameVersionId: number,
	minecraftGameVersionId: number,
	forgeVersion: string,
	name: string,
	type: CurseForgeModLoaderType,
	downloadUrl: string,
	filename: string,
	installMethod: CurseForgeModLoaderInstallMethod,
	latest: boolean,
	recommended: boolean,
	approved: boolean,
	dateModified: Date,
	mavenVersionString: string,
	versionJson: string,
	librariesInstallLocation: string,
	minecraftVersion: string,
	additionalFilesJson: string,
	modLoaderGameVersionId: number,
	modLoaderGameVersionTypeId: number,
	modLoaderGameVersionStatus: CurseForgeGameVersionStatus,
	modLoaderGameVersionTypeStatus: CurseForgeGameVersionTypeStatus,
	mcGameVersionId: number,
	mcGameVersionTypeId: number,
	mcGameVersionStatus: CurseForgeGameVersionStatus,
	mcGameVersionTypeStatus: CurseForgeGameVersionTypeStatus,
	installProfileJson: string,
}

export enum CurseForgeModLoaderInstallMethod {
	ForgeInstaller = 1,
	ForgeJarInstall = 2,
	ForgeInstaller_v2 = 3,
}

export enum CurseForgeModLoaderType {
	Any = 0,
	Forge = 1,
	Cauldron = 2,
	LiteLoader = 3,
	Fabric = 4,
	Quilt = 5,
}

export interface CurseForgePagination {
	/** A zero based index of the first item that is included in the response. */
	index: number,
	/** The requested number of items to be included in the response. */
	pageSize: number,
	/** The actual number of items that were included in the response. */
	resultCount: number,
	/** The total number of items available by the request. */
	totalCount: number,
}

export interface CurseForgeSortableGameVersion {
	/** Original version name (e.g. 1.5b). */
	gameVersionName: string,
	/** Used for sorting (e.g. 0000000001.0000000005). */
	gameVersionPadded: string,
	/** Game version clean name (e.g. 1.5). */
	gameVersion: string,
	/** Game version release date. */
	gameVersionReleaseDate: Date,
	/** Game version type id. */
	gameVersionTypeId?: number,
}

export interface CurseForgeStringResponseRaw {
	/** The response data. */
	data: string,
}

export interface UpdateFileData {
    filename: string;
    modId: number;
    updateFile: string;
    downloadUrl?: string;
    updateAvailable?: boolean;
};
