import express from "express";
import { resolve } from "node:path";
import { buildDeezerPlaylistToMp3UseCase } from "./core";
import { createReadStream } from "node:fs";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to the Deezer to MP3 API");
});

const usecase = buildDeezerPlaylistToMp3UseCase();

app.get("/deezer-mp3", async (req, res) => {
  const { playlistUrl } = req.query;

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

  const relativeFile = await usecase.downloadPlaylistSongs(
    playlistUrl as string
  );

  const file = resolve(relativeFile);

  res
    .set("Content-Disposition", `attachment; filename="audios.zip"`)
    .setHeader("Content-Type", "application/zip");

  // Stream the file to the client
  const fileStream = createReadStream(file);
  fileStream.pipe(res);
});

const port = 3000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
