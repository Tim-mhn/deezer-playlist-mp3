import { ofetch } from "ofetch";
import { YoutubeApi } from "./youtube.types";
import youtubeDl from "youtube-dl-exec";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import archiver from "archiver";

type Song = {
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

type ZipFile = string;
export interface VideosDownloader {
  downloadVideosToZip(urls: YoutubeUrl[]): Promise<ZipFile>;
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

    const youtubeUrls = await Promise.all(
      songs.map(async (song) => {
        return this.youtubeSearch.searchSongUrl(song);
      })
    );

    console.log({ youtubeUrls });

    return await this.videosDownloader.downloadVideosToZip(youtubeUrls);
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
  async downloadVideosToZip(urls: YoutubeUrl[]): Promise<ZipFile> {
    const localAudiosZip = "local/audios.zip";

    return localAudiosZip;
  }
}

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

  async downloadVideosToZip(urls: YoutubeUrl[]): Promise<ZipFile> {
    const hash = Date.now().toString();
    const folder = `tmp/${hash}`;

    const zipPath = `${folder}/audios.zip`;

    createDirIfNotExists(folder);

    const files = await Promise.all(
      urls.slice(0, 2).map(async (url, index) => {
        const filename = `${hash}-audio-${index}.mp3`;
        await this.downloadSingleVideo({ youtubeUrl: url, filename });

        return filename;
      })
    );

    await this.zipFiles({ files, zipPath });

    return zipPath;
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
  const playlistRepository = new DeezerPlaylistRepository();
  const youtubeSearch = new YoutubeSearchService();
  const videosDownloader = localFiles
    ? new LocalVideosDownloader()
    : new YoutubeVideosDownloader();

  return new DeezerPlaylistToMp3UseCase(
    playlistRepository,
    youtubeSearch,
    videosDownloader
  );
};
