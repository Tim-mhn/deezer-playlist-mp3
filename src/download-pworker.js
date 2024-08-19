import youtubedl from "youtube-dl-exec";

const [_, __, youtubeUrl, filename] = process.argv;

async function downloadyoutubeMp3({ youtubeUrl, filename }) {
  console.time(`Downloading ${youtubeUrl} to ${filename}`);
  await youtubedl(
    youtubeUrl,
    {
      extractAudio: true,
      output: filename,
    },
    {}
  );

  console.timeEnd();
}

downloadyoutubeMp3({ youtubeUrl, filename })
  .then(() => {
    process.send("Download complete");
    process.exit(0);
  })
  .catch((err) => {
    process.send(`Error: ${err.message}`);
    process.exit(1);
  });

// downloadyoutubeMp3(workerData)
//   .then(() => {
//     parentPort.postMessage("Download complete");
//   })
//   .catch((err) => {
//     parentPort.postMessage(`Error: ${err.message}`);
//   });
