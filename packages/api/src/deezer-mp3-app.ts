import type { PlaylistRepository, Song, ZipFile } from "./core";

export type DownloadedFileSubscriber = ({
  file,
  id,
}: {
  file: ZipFile;
  id: string;
}) => void;

type PubSubTopic = string;
export class DownloadedFilesPublisher {
  private subscribers = new Map<PubSubTopic, DownloadedFileSubscriber[]>();

  publishFile(
    topic: string,
    { file, id }: { file: ZipFile; id: string }
  ): void {
    // console.log(`Publishing file ${file} for topic ${topic}`);

    (this.subscribers.get(topic) || []).forEach((subscriber) =>
      subscriber({ file, id })
    );
  }

  removeTopic(topic: PubSubTopic) {
    this.subscribers.delete(topic);
  }

  subscribeToFileDownloaded(
    topic: PubSubTopic,
    newSubscriber: DownloadedFileSubscriber
  ) {
    console.log(`subscribing to topic ${topic}`);
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, [newSubscriber]);
      return;
    }

    const topicSubscribers = this.subscribers.get(topic) || [];
    topicSubscribers?.push(newSubscriber);
    this.subscribers.set(topic, topicSubscribers);
  }
}

export interface SongsDownloader {
  downloadSongs(songs: Song[]): Promise<ZipFile>;
}

type SongBatch = {
  id: string;
  songs: Song[];
};

const batches = <T>(arr: Array<T>, size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

export class Deezer2Mp3App {
  filesPublisher!: DownloadedFilesPublisher;
  playlistRepository!: PlaylistRepository;
  songsDownloader!: SongsDownloader;

  constructor(
    filesPublisher: DownloadedFilesPublisher,
    playlistRepository: PlaylistRepository,
    songsDownloader: SongsDownloader
  ) {
    this.filesPublisher = filesPublisher;
    this.playlistRepository = playlistRepository;
    this.songsDownloader = songsDownloader;
  }

  async downloadPlaylistSongs(playlistId: string, options = { batchSize: 40 }) {
    const songs = await this.playlistRepository.getPlaylistSongs(playlistId);

    console.log({ songs: songs });
    const songsBatches: SongBatch[] = batches(songs, options.batchSize).map(
      (songs) => ({
        songs,
        id: crypto.randomUUID(),
      })
    );

    const batchesCount = songsBatches.length;

    let batchesCompleted = 0;
    songsBatches.forEach((batch) =>
      this.songsDownloader.downloadSongs(batch.songs).then((zipFile) => {
        // console.log(`Published file ${zipFile} for playlist ${playlistId}`);
        this.filesPublisher.publishFile(playlistId, {
          file: zipFile,
          id: batch.id,
        });

        batchesCompleted++;

        if (batchesCompleted === batchesCount) {
          this.filesPublisher.removeTopic(playlistId);
          console.log(`Downloading all batches for playlist ${playlistId}`);
        }
      })
    );

    return songsBatches;
  }
}
