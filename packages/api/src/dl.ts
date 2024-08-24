import youtubedl from "youtube-dl-exec";

async function main() {
  await youtubedl(
    "https://www.youtube.com/watch?v=Cl6Rz1Uvi2M",
    {
      extractAudio: true,
      output: "tmp/audio.mp3",
    },
    {}
  );
}

main().then();
