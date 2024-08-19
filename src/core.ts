type Song = {
  name: string;
  artistName: string;
};

export interface PlaylistSongsRepository {
  getPlaylistSongs(playlistUrl: string): Promise<Song[]>;
}

type YoutubeUrl = string;
export interface YoutubeSearch {
  searchSongUrl(song: Song): Promise<YoutubeUrl>;
}

type ZipFile = string;
export interface VideosDownloader {
  //   downloadVideo({
  //     url,
  //     filename,
  //   }: {
  //     url: string;
  //     filename: string;
  //   }): Promise<void>;
  downloadVideosToZip(urls: YoutubeUrl[]): Promise<ZipFile>;
}

export interface FileZipper {
  zipFiles(files: string[]): Promise<void>;
}

/**
 * PlaylistSongsRepository playlistId --> list of songs
 *
 * YoutubeSearch song --> youtube url
 *
 * YoutubeDownloader youtube url --> mp3 file
 */

class Core {
  constructor(
    private playlistSongsRepository: PlaylistSongsRepository,
    private youtubeSearch: YoutubeSearch,
    private videosDownloader: VideosDownloader
  ) {}

  async downloadPlaylistSongs(playlistUrl: string) {
    const songs = await this.playlistSongsRepository.getPlaylistSongs(
      playlistUrl
    );

    const youtubeUrls = await Promise.all(
      songs.map(async (song) => {
        return this.youtubeSearch.searchSongUrl(song);
      })
    );

    await this.videosDownloader.downloadVideosToZip(youtubeUrls);
  }
}
