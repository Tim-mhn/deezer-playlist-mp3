/**
 *
 *
 * 1.input: deezer playlist url
 *
 * 2. fetch all songs names + artist from playlist -- DEEZER endpoint
 *
 * 3. for each song, search youtube url -- YOUTUBE API
 *
 * 4. for each youtube url, download mp3 -- YOUTUBE 2 MP3 Service
 *
 * 5. save all mp3 to zip file and return ZIP
 */

import { ofetch } from "ofetch";
import { DeezerApi } from "./deezer.types";
import { YoutubeApi } from "./youtube.types";
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from "node:fs";
import archiver from "archiver";
import youtubedl from "youtube-dl-exec";
import path from "node:path";
import { Worker } from "worker_threads";
import { fileURLToPath } from "node:url";
import { fork } from "node:child_process";
import { buildDeezerPlaylistToMp3UseCase } from "./core";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

const DEEZER_COOKIE =
  "dzr_uniq_id=dzr_uniq_id_fr980721c9311a19717253cc512c2cf81c31e950; arl=0999a44dd231d62cd8ddd09452a658d609a4d826d02eff37cf1214e63dbde11c237e35994bec3e6c1f8ca68ae76e8ff86aa5c66ab807e6b14e29c38c38a16a3bf4e7fe148e911ec130a7b534a5e64a271794c0e056f61aac3e2223af40436cb4; comeback=1; account_id=2145397302; familyUserId=2145397302; refresh-token=l3eQ4U_5ZVlM9jDvTs5djTIxNDUzOTczMDJ8VI7XH-POJyXGmtTwF4VeNCZ6DIs_tuTyfPeEYK1-YkQ7XK97TuCMnDDBRCzRedkGMxJ0gYxkYfpstJ_JLQrnLMwOXrabXH8d0O5Pumo29DFV7jxW1AsDC_N7p54XhrupeFn21o2mU9ILa7RSnD_h6K8kASENStiUZP3MpOVjnqA=; ajs_user_id=2145397302; ajs_anonymous_id=04060034-f631-4554-9184-db191e02bfae; ry_ry-m42x3nc3_realytics=eyJpZCI6InJ5X0I2NTMzMDM0LTY3RDctNDZEQS04NDM1LTg2MjhFNjZDNDhCQyIsImNpZCI6bnVsbCwiZXhwIjoxNzU1NDQ2ODAwMzI4LCJjcyI6bnVsbH0%3D; _pin_unauth=dWlkPVpqRmpNMk0wWldRdE1UVTJaUzAwTTJVNUxUaGpZbVV0TkdNM05XWTRZVGcxTW1VMQ; _gcl_au=1.1.1141261330.1723914663; sid=fr09660ba6effd7d0a7d5698581c16291874b8bf; _abck=1CCF1C3853E9BADEFE2DD95F16D4E347~0~YAAQhmndWMVW2FyRAQAAPpMgZQwNRATlyxDH2VyWPFdiC0uCM/4gM2DRHKT6TKhYd1tQA1JRO7rnvo3Q3BUk3Z7PSXhAcC/ypgOn3MVLjM2Eiov73MtHZngolERtSX3JVFIFuJCzDMUoyZbgumsUt47jfL52D5C+TUxaC02SzxNl1DPf1dqbsL99tOUcKCDZqnAPgYtgZYXVCX/JGYMEDlWBrxRVPD8ZlBRNOhFuIv+Z7DIo6vbivbCFpr6+Nmz61ssDYlk1/+uvCO1A7ND35GV7KexRjpFjwtK6ini6Ae6EDywrKS4+pJF5EAqc6VNr18bxifdM3xdlLiEMbO8w1BW+sNA7Mypl7wts5op6eBQH+W8Sr3joSDMy7PzNBrE9vFYlD6eJncaQ8qA64Ipu/57W70cRy37Rv9jahje1N/lUvbU8Xf9wV//DXWZc0XJvTyhX913b+W4/EJAiApuFRUDoog==~-1~-1~-1; bm_sz=6E9F1B54462348991735E19B621ABCF1~YAAQhmndWOhW2FyRAQAA3pYgZRhftJ4pDM3JO9bElv07X4cOQ9/xZEFg8WNVEfX1cfdbgcUENnuv2fSNJD1tmCc9cij4kLnB30e1yCxF2VO+AvLT2IzSfaNS4FPzOI0tzl1HFaAw5wp6YDFlJRTNLTxn3TTGy3/6oU4zQcd6WoppVLzw/geC0LYcFNXNcjvfFe7mXsA0mBuk1ufzkNErQlW3wt8zgy4dNW95UweJ54HxaFPZExoxNspquZjgXGRkzR8OgQsjpWZmACQ7sEmQFaJ0I4kv95Y5H1aJabpEiHsNpCPXtIb+8fqtZkF66S/QQsUfs2wxM2U4q5vhUHFSC/yLP77MTnj8DgctgcAwK+ySuHII1AlIalLfjZEq1fvkVCA6Kcc7QU5bfpaZG3B3NNyFVw==~3291461~4408885; ab.storage.deviceId.5ba97124-1b79-4acc-86b7-9547bc58cb18=g%3Ae11d2993-7b29-5286-06cd-f939dfe00544%7Ce%3Aundefined%7Cc%3A1723917087599%7Cl%3A1723978522374; ab.storage.userId.5ba97124-1b79-4acc-86b7-9547bc58cb18=g%3A2145397302%7Ce%3Aundefined%7Cc%3A1723917087603%7Cl%3A1723978522375; ab.storage.sessionId.5ba97124-1b79-4acc-86b7-9547bc58cb18=g%3Af011a4dc-eca1-b83c-8ec8-37247e2a2438%7Ce%3A1723980322378%7Cc%3A1723978522374%7Cl%3A1723978522378; pageviewCount=9; consentMarketing=1; consentStatistics=1; ry_ry-m42x3nc3_so_realytics=eyJpZCI6InJ5X0I2NTMzMDM0LTY3RDctNDZEQS04NDM1LTg2MjhFNjZDNDhCQyIsImNpZCI6bnVsbCwib3JpZ2luIjp0cnVlLCJyZWYiOm51bGwsImNvbnQiOm51bGwsIm5zIjpmYWxzZSwic2MiOm51bGwsInNwIjoiZGVlemVyIn0%3D";

const createDirIfNotExists = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};
async function searchYoutubeVideo(track: { title: string; artist: string }) {
  const query = `${track.title} ${track.artist}`;

  const searchResponse = await ofetch<YoutubeApi.SearchResponse>(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyBeo4NGA__U6Xxy-aBE6yFm19pgq8TY-TM`,
    {
      headers: {
        "x-origin": "https://explorer.apis.google.com",
      },
    }
  );

  return searchResponse.items[0].id.videoId || "";
}

async function downloadYoutubeToMp3({
  youtubeUrl,
  filename,
}: {
  youtubeUrl: string;
  filename: string;
}) {
  console.log(`Downloading ${filename} ...`);
  await youtubedl(
    youtubeUrl,
    {
      extractAudio: true,
      output: filename,
    },
    {}
  );

  // WORKER_THREADS
  //   return new Promise<void>((resolve, reject) => {
  //     const worker = new Worker(path.resolve(__dirname, "download-tworker.js"), {
  //       workerData: { youtubeUrl, filename },
  //     });

  //     worker.on("message", resolve);
  //     worker.on("error", reject);

  //     worker.on("exit", (code) => {
  //       if (code !== 0) {
  //         reject(new Error(`Worker stopped with exit code ${code}`));
  //       }
  //     });
  //   });

  // CHILD PROCESSES (not sure it's worth it tbh)
  return new Promise<void>((resolve, reject) => {
    const child = fork(path.resolve(__dirname, "download-pworker.js"), [
      youtubeUrl,
      filename,
    ]);

    child.on("message", (message) => {
      if (message === "Download complete") {
        resolve();
      } else {
        reject(new Error(message.toString()));
      }
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Process stopped with exit code ${code}`));
      }
    });
  });

  //   const { dlink } = await ofetch<Youtube2Mp3Api.Response>(
  //     `https://youtube-mp3-downloader2.p.rapidapi.com/ytmp3/ytmp3/custom/?url=${youtubeUrl}&quality=320`,
  //     {
  //       headers: {
  //         "x-rapidapi-key": "50465d5b21mshea46ea8d7f5b548p100c76jsnbb09dfa5ac1c",
  //         "x-rapidapi-host": "youtube-mp3-downloader2.p.rapidapi.com",
  //       },
  //     }
  //   );

  //   console.log({ dlink });

  //   const res = await fetch(dlink, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "audio/mpeg",
  //     },
  //   });

  //   const file = createWriteStream(filename, {
  //     encoding: "utf8",
  //   });

  //   if (!res.ok) {
  //     throw new Error("error when fetching mp3 file");
  //   }

  //   if (!res.body) {
  //     throw new Error("error when fetching mp3 file: no body");
  //   }

  //   await streamPipeline(res.body as unknown as NodeJS.ReadableStream, file);

  //   console.log(`Successfully downloaded ${filename}`);
}

async function downloadYoutubeVideosToZip(youtubeUrls: string[]) {
  const hash = Date.now().toString();
  const folder = `tmp/${hash}`;

  const zipPath = `${folder}/audios.zip`;

  createDirIfNotExists(folder);

  console.log(`Created temporaryy ${folder} folder`);
  const tempFiles: string[] = [];

  try {
    // Download all MP3 files

    await Promise.all(
      youtubeUrls.map(async (url, i) => {
        const outputPath = `${hash}-audio${i}.mp3`;
        tempFiles.push(outputPath);
        await downloadYoutubeToMp3({
          filename: outputPath,
          youtubeUrl: url,
        });
      })
    );

    // Create a ZIP archive
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
    for (const file of tempFiles) {
      archive.file(file, { name: file });
    }

    await archive.finalize();
  } catch (err) {
    console.log("error when downloading youtube videos to zip", err);
    console.error(err);
  } finally {
    // Clean up temporary files
    for (const file of tempFiles) {
      try {
        unlinkSync(file);
      } catch (err) {
        console.warn(`Error when removing file ${file}`);
      }
    }
  }
}
async function main() {
  const playlistUrl = "https://www.deezer.com/us/playlist/12818235201";

  const usecase = buildDeezerPlaylistToMp3UseCase();

  await usecase.downloadPlaylistSongs(playlistUrl);
}

main();
