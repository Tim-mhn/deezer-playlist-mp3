import { ofetch } from "ofetch";
import type { YoutubeApi } from "./youtube.types.js";
import youtubeDl from "youtube-dl-exec";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import archiver from "archiver";
import type { DeezerApi } from "./deezer.types.js";
import { playlistBuilder } from "./mocks.js";
import { DeezerApiPlaylistRepository } from "./deezer-playlist.repository.js";

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
  const playlistRepository = new DeezerApiPlaylistRepository();
  const youtubeSearch = new YoutubeSearchService();
  const videosDownloader = localFiles
    ? new LocalVideosDownloader()
    : new YoutubeVideosDownloader();

  return { playlistRepository, youtubeSearch, videosDownloader };
};
