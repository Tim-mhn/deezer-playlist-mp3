import assert from "node:assert";
import { describe, it, mock } from "node:test";
import type { PlaylistRepository, Song, ZipFile } from "./core";
import {
  Deezer2Mp3App,
  DownloadedFilesPublisher,
  type SongsDownloader,
} from "./deezer-mp3-app.ts";

function flushPromises() {
  return new Promise(function (resolve) {
    setImmediate(resolve);
  });
}

describe("Download playlist", () => {
  it("downloads the songs of a playlist by batch", async () => {
    const downloadedFilesPublisher = new DownloadedFilesPublisher();

    const deezerPlaylistRepository: PlaylistRepository = {
      getPlaylistSongs: async (playlistId) => [
        {
          artist: "MJ",
          title: "Beat it",
        },
        {
          artist: "U2",
          title: "With or without you",
        },
        {
          artist: "U2",
          title: "Vertigo",
        },
        {
          artist: "Green Day",
          title: "Basket Case",
        },
        {
          artist: "Keane",
          title: "Somewhere only we know",
        },
        {
          artist: "Kid Cudi",
          title: "Erase me",
        },
        {
          artist: "Muse",
          title: "Uprising",
        },
      ],
    };

    const songsDownloader: SongsDownloader = (() => {
      let index = 0;
      return {
        downloadSongs: async (songs) => {
          const filename = `https://deezer-api/songs-${index}.zip`;
          index++;
          return filename;
        },
      };
    })();

    const app = new Deezer2Mp3App(
      downloadedFilesPublisher,
      deezerPlaylistRepository,
      songsDownloader
    );

    app.downloadPlaylistSongs("some-playlist-id", { batchSize: 3 });

    const zipFiles: ZipFile[] = [];
    downloadedFilesPublisher.subscribeToFileDownloaded(
      "some-playlist-id",
      ({ file }) => {
        zipFiles.push(file);
      }
    );

    await flushPromises();

    assert.deepEqual(zipFiles, [
      "https://deezer-api/songs-0.zip",
      "https://deezer-api/songs-1.zip",
      "https://deezer-api/songs-2.zip",
    ]);
  });

  it("downloads the songs for the right playlist, even though songs from other playlists are downloaded at the same time", async () => {
    const downloadedFilesPublisher = new DownloadedFilesPublisher();

    const playlistA: Song[] = [
      {
        artist: "MJ",
        title: "Beat it",
      },
      {
        artist: "U2",
        title: "With or without you",
      },
      {
        artist: "U2",
        title: "Vertigo",
      },
      {
        artist: "Green Day",
        title: "Basket Case",
      },
      {
        artist: "Keane",
        title: "Somewhere only we know",
      },
      {
        artist: "Kid Cudi",
        title: "Erase me",
      },
      {
        artist: "Muse",
        title: "Uprising",
      },
    ];

    const playlistB: Song[] = [
      {
        artist: "Nirvana",
        title: "Smells like teen spirit",
      },
    ];
    const deezerPlaylistRepository: PlaylistRepository = {
      getPlaylistSongs: async (playlistId) => {
        return playlistId === "playlistA" ? playlistA : playlistB;
      },
    };

    const songsDownloader: SongsDownloader = (() => {
      let index = 0;
      return {
        downloadSongs: async (songs) => {
          const filename = `https://deezer-api/songs-${songs[0].title}.zip`;
          index++;
          return filename;
        },
      };
    })();

    const app = new Deezer2Mp3App(
      downloadedFilesPublisher,
      deezerPlaylistRepository,
      songsDownloader
    );

    app.downloadPlaylistSongs("playlistA", { batchSize: 3 });
    app.downloadPlaylistSongs("playlistB");

    const zipFiles: ZipFile[] = [];
    downloadedFilesPublisher.subscribeToFileDownloaded(
      "playlistA",
      ({ file }) => {
        zipFiles.push(file);
      }
    );

    await flushPromises();

    assert.deepEqual(zipFiles, [
      "https://deezer-api/songs-Beat it.zip",
      "https://deezer-api/songs-Basket Case.zip",
      "https://deezer-api/songs-Uprising.zip",
    ]);
  });

  it("unsubscribes the subscribers once all zip files have been published", async () => {
    const downloadedFilesPublisher = new DownloadedFilesPublisher();

    const deezerPlaylistRepository: PlaylistRepository = {
      getPlaylistSongs: async (playlistId) => [
        {
          artist: "MJ",
          title: "Beat it",
        },
        {
          artist: "U2",
          title: "With or without you",
        },
        {
          artist: "U2",
          title: "Vertigo",
        },
        {
          artist: "Green Day",
          title: "Basket Case",
        },
        {
          artist: "Keane",
          title: "Somewhere only we know",
        },
        {
          artist: "Kid Cudi",
          title: "Erase me",
        },
        {
          artist: "Muse",
          title: "Uprising",
        },
      ],
    };

    const songsDownloader: SongsDownloader = (() => {
      let index = 0;
      return {
        downloadSongs: async (songs) => {
          const filename = `https://deezer-api/songs-${index}.zip`;
          index++;
          return filename;
        },
      };
    })();

    const app = new Deezer2Mp3App(
      downloadedFilesPublisher,
      deezerPlaylistRepository,
      songsDownloader
    );

    const removeTopicMock = mock.method(
      downloadedFilesPublisher,
      "removeTopic"
    );

    app.downloadPlaylistSongs("some-playlist-id", { batchSize: 3 });

    downloadedFilesPublisher.subscribeToFileDownloaded(
      "some-playlist-id",
      (zipFile) => {
        // do nothing
      }
    );

    await flushPromises();

    assert.equal(removeTopicMock.mock.callCount(), 1);
  });
});
