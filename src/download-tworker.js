import { parentPort, workerData } from "worker_threads";
import youtubedl from "youtube-dl-exec";

async function downloadYoutubeToMp3({ youtubeUrl, filename }) {
  await youtubedl(
    youtubeUrl,
    {
      extractAudio: true,
      output: filename,
    },
    {}
  );
}

downloadYoutubeToMp3(workerData)
  .then(() => {
    parentPort.postMessage("Download complete");
  })
  .catch((err) => {
    parentPort.postMessage(`Error: ${err.message}`);
  });
