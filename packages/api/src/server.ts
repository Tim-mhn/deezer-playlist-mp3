import express from "express";
import path, { resolve } from "node:path";
import {
  buildDeezerPlaylistToMp3UseCase,
  FakeDeezerPlaylistRepository,
  type YoutubeMusicVideo,
} from "./core.js";
import { createReadStream } from "node:fs";
import cors from "cors";
import {
  Deezer2Mp3App,
  DownloadedFilesPublisher,
  type SongsDownloader,
} from "./deezer-mp3-app.js";

const app = express();
app.use(
  cors({
    origin: "*", // specify your frontend origin
    allowedHeaders: ["Content-Type", "Content-Disposition"],
    exposedHeaders: ["Content-Type", "Content-Disposition"],
  })
);

app.use(express.static(path.join(import.meta.dirname, "../public")));

app.options("*");

app.get("/", (req, res) => {
  res.send("Welcome to the Deezer to MP3 API");
});

const { playlistRepository, videosDownloader, youtubeSearch } =
  buildDeezerPlaylistToMp3UseCase({
    localFiles: false,
  });

const filesPublisher = new DownloadedFilesPublisher();

const songsDownloader: SongsDownloader = {
  downloadSongs: async (songs) => {
    const youtubeVideos = await Promise.all(
      songs.map<Promise<YoutubeMusicVideo>>(async (song) => {
        const url = await youtubeSearch.searchSongUrl(song);
        const musicVideo: YoutubeMusicVideo = {
          url,
          artist: song.artist,
          track: song.title,
        };
        return musicVideo;
      })
    );

    console.log({ youtubeVideos });

    return await videosDownloader.downloadVideosToZip(youtubeVideos);
  },
};

const sleep = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

const randomInt = ({ min, max }: { min: number; max: number }) =>
  Math.floor(Math.random() * (max - min)) + min;
const fakeSongsDownloader: SongsDownloader = {
  downloadSongs: async (songs) => {
    await sleep(randomInt({ min: 1500, max: 15000 }));
    return "/audios1.zip";
  },
};

const deezerMp3App = new Deezer2Mp3App(
  filesPublisher,
  playlistRepository,
  songsDownloader
);

app.get("/deezer-mp3", async (req, res) => {
  const { playlistUrl } = req.query;

  console.group("/deezer-mp3 called");
  console.log({ playlistUrl });

  if (!playlistUrl) {
    res.status(400).send({
      error: "Missing query parameter 'playlistUrl'",
    });
  }

  if (typeof playlistUrl !== "string") {
    res.status(400).send({
      error:
        "Invalid type for query parameter 'playlistUrl'. Must be a string ",
    });
  }

  const playlistId = playlistUrl?.toString()?.split("/playlist/")[1];

  console.log({ playlistId });
  if (!playlistId)
    throw new Error(`Could not retrieve playlistId from url ${playlistUrl}`);

  try {
    const songsBatches = await deezerMp3App.downloadPlaylistSongs(playlistId, {
      batchSize: 15,
    });

    console.log({ songsBatches });
    res.status(200).send(songsBatches);
    return;

    // const relativeFile = await usecase.downloadPlaylistSongs(
    //   playlistUrl as string
    // );

    // const file = resolve(relativeFile);

    // res
    //   .set("Content-Disposition", `attachment; filename="audios.zip"`)
    //   .setHeader("Content-Type", "application/zip");

    // // Stream the file to the client
    // const fileStream = createReadStream(file);
    // fileStream.pipe(res);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error:
        err && typeof err === "object" && "message" in err
          ? err?.message
          : "Unexpected error",
    });
  }
});

app.get("/events", (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE with client

  const { playlistUrl } = req.query;

  console.log({ playlistUrl });

  if (!playlistUrl) {
    res.status(400).send({
      error: "Missing query parameter 'playlistUrl'",
    });
  }

  if (typeof playlistUrl !== "string") {
    res.status(400).send({
      error:
        "Invalid type for query parameter 'playlistUrl'. Must be a string ",
    });
  }

  const playlistId = playlistUrl?.toString()?.split("/playlist/")[1];
  if (!playlistId)
    throw new Error(`Could not retrieve playlistId from url ${playlistUrl}`);

  deezerMp3App.filesPublisher.subscribeToFileDownloaded(
    playlistId,
    ({ file, id }) => {
      console.log(`[SSE] Sending file ${file} to client`);
      res.write(`data: file=${file};id=${id};\n\n`);
    }
  );

  res.on("close", () => {
    console.log("client dropped connection");
    res.end();
  });
});

app.get("/test", (req, res) => {
  res.send("hello world");
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
