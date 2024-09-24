import { ofetch } from "ofetch";
import type { YoutubeApi } from "./youtube.types.js";
import youtubeDl from "youtube-dl-exec";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import archiver from "archiver";
import type { DeezerApi } from "./deezer.types.js";
import { playlistBuilder } from "./mocks.js";

export type Song = {
  title: string;
  artist: string;
};

export interface PlaylistRepository {
  getPlaylistSongs(playlistId: string): Promise<Song[]>;
}

type YoutubeUrl = string;
export interface YoutubeSearch {
  searchSongUrl(song: Song): Promise<YoutubeUrl>;
}

export type ZipFile = string;
export interface VideosDownloader {
  downloadVideosToZip(videos: YoutubeMusicVideo[]): Promise<ZipFile>;
}

export interface FileZipper {
  zipFiles(files: string[]): Promise<void>;
}

/**
 * PlaylistRepository playlistId --> list of songs
 *
 * YoutubeSearch song --> youtube url
 *
 * YoutubeDownloader youtube url --> mp3 file
 */

export class DeezerPlaylistToMp3UseCase {
  constructor(
    private playlistSongsRepository: PlaylistRepository,
    private youtubeSearch: YoutubeSearch,
    private videosDownloader: VideosDownloader
  ) {}

  async downloadPlaylistSongs(playlistId: string) {
    const songs =
      await this.playlistSongsRepository.getPlaylistSongs(playlistId);

    const youtubeVideos = await Promise.all(
      songs.map<Promise<YoutubeMusicVideo>>(async (song) => {
        const url = await this.youtubeSearch.searchSongUrl(song);
        const musicVideo: YoutubeMusicVideo = {
          url,
          artist: song.artist,
          track: song.title,
        };
        return musicVideo;
      })
    );

    console.log({ youtubeVideos });

    return await this.videosDownloader.downloadVideosToZip(youtubeVideos);
  }
}

class InvalidPlaylistUrl extends Error {
  constructor(playlistUrl: string) {
    super(`${playlistUrl} is not a valid url`);
  }
}
class DeezerPlaylistRepository implements PlaylistRepository {
  async getPlaylistSongs(playlistUrl: string): Promise<Song[]> {
    try {
      new URL(playlistUrl);
    } catch (err) {
      throw new InvalidPlaylistUrl(playlistUrl);
    }
    const response = await fetch(playlistUrl, {
      method: "GET",
    });

    const html = await response.text();

    const stringifiedState = html.match(
      /__DZR_APP_STATE__ = (.*)<\/script>/
    )?.[1];

    if (!stringifiedState) throw new Error("Could not find __DZR_APP_STATE__");

    const state = JSON.parse(stringifiedState);

    const songs = state.SONGS.data.map((song: any) => ({
      title: song.SNG_TITLE as string,
      artist: song.ART_NAME as string,
    }));

    return songs;
  }
}

export class FakeDeezerPlaylistRepository implements PlaylistRepository {
  async getPlaylistSongs(playlistId: string): Promise<Song[]> {
    return playlistBuilder();
  }
}

class DeezerApiPlaylistRepository implements PlaylistRepository {
  constructor(private cookie: string) {}

  async getPlaylistSongs(playlistId: string): Promise<Song[]> {
    console.group("DeezerApiPlaylistRepository");

    const res = await fetch(
      `https://www.deezer.com/ajax/gw-light.php?method=deezer.pagePlaylist&input=3&api_version=1.0&api_token=${process.env.DEEZER_API_TOKEN}&cid=${process.env.DEEZER_API_CID}`,
      {
        method: "POST",
        body: `{"playlist_id":${playlistId},"nb":10000,"start":0,"lang":"us","tab":0,"tags":true,"header":true}`,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          Cookie: this.cookie,
        },
      }
    );

    const data = (await res.json()) as DeezerApi.PlaylistGetResponse;

    console.log({ data: data.results });
    console.log({ error: data.error });
    console.groupEnd();
    return (
      data.results.SONGS?.data.map((song) => ({
        title: song.SNG_TITLE,
        artist: song.ART_NAME,
      })) || []
    );
  }
}

export class YoutubeSearchService implements YoutubeSearch {
  async searchSongUrl(song: Song): Promise<YoutubeUrl> {
    const query = `${song.title} ${song.artist}`;

    const searchResponse = await ofetch<YoutubeApi.SearchResponse>(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyBeo4NGA__U6Xxy-aBE6yFm19pgq8TY-TM`,
      {
        headers: {
          "x-origin": "https://explorer.apis.google.com",
        },
      }
    );

    const videoId = searchResponse.items[0].id.videoId || "";

    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}

export class LocalVideosDownloader implements VideosDownloader {
  async downloadVideosToZip(videos: YoutubeMusicVideo[]): Promise<ZipFile> {
    const localAudiosZip = "local/audios.zip";

    return localAudiosZip;
  }
}

export type YoutubeMusicVideo = {
  url: string;
  artist: string;
  track: string;
};

const isDev = process.env.DEV === "true";
console.log({ isDev });
export class YoutubeVideosDownloader implements VideosDownloader {
  private async downloadSingleVideo({
    youtubeUrl,
    filename,
  }: {
    youtubeUrl: string;
    filename: string;
  }) {
    console.log(`Downloading ${filename} ... for url ${youtubeUrl}`);

    await youtubeDl(
      youtubeUrl,
      {
        extractAudio: true,
        output: filename,
      },
      {}
    );
  }

  async downloadVideosToZip(videos: YoutubeMusicVideo[]): Promise<ZipFile> {
    const hash = Date.now().toString();
    const folder = `public/tmp/${hash}`;

    const zipPath = `${folder}/audios.zip`;

    createDirIfNotExists(folder);

    const files = await Promise.all(
      videos.map(async (video, index) => {
        const filename = `${video.artist} - ${video.track}.mp3`;
        await this.downloadSingleVideo({ youtubeUrl: video.url, filename });

        return filename;
      })
    );

    await this.zipFiles({ files, zipPath });

    const zipPathUrl = zipPath.replace("public/", "");
    return zipPathUrl;
  }

  private async zipFiles({
    files,
    zipPath,
  }: {
    files: string[];
    zipPath: string;
  }): Promise<void> {
    try {
      const output = createWriteStream(zipPath);
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Maximum compression
      });

      output.on("close", () => {
        console.log(
          `ZIP file created: ${zipPath} (${archive.pointer()} total bytes)`
        );
      });

      archive.on("error", (err) => {
        throw err;
      });

      archive.pipe(output);

      // Append all downloaded files to the ZIP archive
      for (const file of files) {
        archive.file(file, { name: file });
      }
      await archive.finalize();
    } catch (err) {
      console.log("error when downloading youtube videos to zip", err);
      console.error(err);
    } finally {
      // Clean up temporary files
      for (const file of files) {
        try {
          unlinkSync(file);
        } catch (err) {
          console.warn(`Error when removing file ${file}`);
        }
      }
    }
  }
}

const createDirIfNotExists = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

export const buildDeezerPlaylistToMp3UseCase = (
  { localFiles } = { localFiles: false }
) => {
  const deezerApiCookie = process.env.DEEZER_API_COOKIE;
  if (!deezerApiCookie)
    throw new Error("DEEZER_API_COOKIE environment variable not provided");

  const playlistRepository = new DeezerApiPlaylistRepository(deezerApiCookie);
  const youtubeSearch = new YoutubeSearchService();
  const videosDownloader = localFiles
    ? new LocalVideosDownloader()
    : new YoutubeVideosDownloader();

  return { playlistRepository, youtubeSearch, videosDownloader };
};
