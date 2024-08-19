export declare namespace DeezerApi {
  export interface PlaylistGetResponse {
    error: any[];
    results: Results;
  }

  export interface Results {
    DATA: Data;
    COMMENTS: Comments;
    CURATOR: boolean;
    SONGS: Songs;
  }

  export interface Data {
    PLAYLIST_ID: string;
    TITLE: string;
    TITLE_SEO: string;
    TYPE: string;
    STATUS: number;
    PARENT_PLAYLIST_ID: string;
    PARENT_USER_ID: string;
    PARENT_USERNAME: string;
    PARENT_USER_PICTURE: string;
    DESCRIPTION: string;
    PLAYLIST_PICTURE: string;
    PICTURE_TYPE: string;
    DURATION: number;
    NB_SONG: number;
    CHECKSUM: string;
    NB_FAN: number;
    DATE_ADD: string;
    DATE_MOD: string;
    HAS_ARTIST_LINKED: boolean;
    IS_SPONSORED: boolean;
    __TYPE__: string;
    COLLAB_KEY: string;
    IS_FAVORITE: boolean;
  }

  export interface Comments {
    data: any[];
    count: number;
    total: number;
  }

  export interface Songs {
    data: Daum[];
    total: number;
    count: number;
    checksum: string;
    filtered_count: number;
  }

  export interface Daum {
    SNG_ID: string;
    PRODUCT_TRACK_ID: string;
    UPLOAD_ID: number;
    SNG_TITLE: string;
    ART_ID: string;
    PROVIDER_ID: string;
    ART_NAME: string;
    ARTIST_IS_DUMMY: boolean;
    ARTISTS: Artists[];
    ALB_ID: string;
    ALB_TITLE: string;
    TYPE: number;
    MD5_ORIGIN: string;
    VIDEO: boolean;
    DURATION: string;
    ALB_PICTURE: string;
    ART_PICTURE: string;
    RANK_SNG: string;
    FILESIZE_AAC_64: string;
    FILESIZE_MP3_64: string;
    FILESIZE_MP3_128: string;
    FILESIZE_MP3_256: string;
    FILESIZE_MP3_320: string;
    FILESIZE_FLAC: string;
    FILESIZE: string;
    GAIN: string;
    MEDIA_VERSION: string;
    DISK_NUMBER: string;
    TRACK_NUMBER: string;
    TRACK_TOKEN: string;
    TRACK_TOKEN_EXPIRE: number;
    VERSION?: string;
    MEDIA: Media[];
    EXPLICIT_LYRICS: string;
    RIGHTS: Rights;
    ISRC: string;
    DATE_ADD: number;
    HIERARCHICAL_TITLE: string;
    SNG_CONTRIBUTORS: SngContributors;
    LYRICS_ID: number;
    EXPLICIT_TRACK_CONTENT: ExplicitTrackContent;
    __TYPE__: string;
    FALLBACK?: Fallback;
  }

  export interface Artists {
    ART_ID: string;
    ROLE_ID: string;
    ARTISTS_SONGS_ORDER: string;
    ART_NAME: string;
    ARTIST_IS_DUMMY: boolean;
    ART_PICTURE: string;
    RANK: string;
    LOCALES: any;
    __TYPE__: string;
    SMARTRADIO?: number;
  }

  export interface Media {
    TYPE: string;
    HREF: string;
  }

  export interface Rights {
    STREAM_ADS_AVAILABLE?: boolean;
    STREAM_ADS?: string;
    STREAM_SUB_AVAILABLE?: boolean;
    STREAM_SUB?: string;
  }

  export interface SngContributors {
    main_artist?: string[];
    author?: string[];
    composer?: string[];
    artist?: string[];
    remixer?: string[];
    mixingengineer?: string[];
    masteringengineer?: string[];
    "music publisher"?: string[];
    featuring?: string[];
    mainartist?: string[];
    musicpublisher?: string[];
    "original mixer"?: string[];
    "keyboards programmer"?: string[];
  }

  export interface ExplicitTrackContent {
    EXPLICIT_LYRICS_STATUS: number;
    EXPLICIT_COVER_STATUS: number;
  }

  export interface Fallback {
    SNG_ID: string;
    PRODUCT_TRACK_ID: string;
    UPLOAD_ID: number;
    SNG_TITLE: string;
    ART_ID: string;
    PROVIDER_ID: string;
    ART_NAME: string;
    ARTIST_IS_DUMMY: boolean;
    ARTISTS: Artists2[];
    ALB_ID: string;
    ALB_TITLE: string;
    TYPE: number;
    MD5_ORIGIN: string;
    VIDEO: boolean;
    DURATION: string;
    ALB_PICTURE: string;
    ART_PICTURE: string;
    RANK_SNG: string;
    FILESIZE_AAC_64: string;
    FILESIZE_MP3_64: string;
    FILESIZE_MP3_128: string;
    FILESIZE_MP3_256: string;
    FILESIZE_MP3_320: string;
    FILESIZE_FLAC: string;
    FILESIZE: string;
    GAIN: string;
    MEDIA_VERSION: string;
    DISK_NUMBER: string;
    TRACK_NUMBER: string;
    TRACK_TOKEN: string;
    TRACK_TOKEN_EXPIRE: number;
    VERSION: string;
    MEDIA: Media2[];
    EXPLICIT_LYRICS: string;
    RIGHTS: Rights2;
    ISRC: string;
    HIERARCHICAL_TITLE: string;
    SNG_CONTRIBUTORS: SngContributors2;
    LYRICS_ID: number;
    EXPLICIT_TRACK_CONTENT: ExplicitTrackContent2;
    __TYPE__: string;
    FILESIZE_AC4_IMS?: string;
    FILESIZE_DD_JOC?: string;
  }

  export interface Artists2 {
    ART_ID: string;
    ROLE_ID: string;
    ARTISTS_SONGS_ORDER: string;
    ART_NAME: string;
    ARTIST_IS_DUMMY: boolean;
    ART_PICTURE: string;
    RANK: string;
    LOCALES: any;
    SMARTRADIO?: number;
    __TYPE__: string;
  }

  export interface Media2 {
    TYPE: string;
    HREF: string;
  }

  export interface Rights2 {
    STREAM_ADS_AVAILABLE: boolean;
    STREAM_ADS: string;
    STREAM_SUB_AVAILABLE: boolean;
    STREAM_SUB: string;
  }

  export interface SngContributors2 {
    main_artist: string[];
    composer?: string[];
    author?: string[];
    remixer?: string[];
    "music publisher"?: string[];
  }

  export interface ExplicitTrackContent2 {
    EXPLICIT_LYRICS_STATUS: number;
    EXPLICIT_COVER_STATUS: number;
  }
}
