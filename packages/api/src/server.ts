import express from "express";
import { resolve } from "node:path";
import { buildDeezerPlaylistToMp3UseCase } from "./core.js";
import { createReadStream } from "node:fs";
import cors from "cors";

const app = express();
app.use(
  cors({
    allowedHeaders: ["Content-Type", "Content-Disposition"],
    exposedHeaders: ["Content-Type", "Content-Disposition"],
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the Deezer to MP3 API");
});

const usecase = buildDeezerPlaylistToMp3UseCase({ localFiles: true });

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

  try {
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
  } catch (err) {
    res.status(500).send({
      error:
        err && typeof err === "object" && "message" in err
          ? err?.message
          : "Unexpected error",
    });
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
