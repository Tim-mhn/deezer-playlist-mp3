async function main() {
  const response = await fetch(
    "https://www.deezer.com/us/playlist/12818235201",
    {
      method: "GET",
    }
  );

  const html = await response.text();

  const stringifiedState = html.match(
    /__DZR_APP_STATE__ = (.*)<\/script>/
  )?.[1];

  if (!stringifiedState) throw new Error("Could not find __DZR_APP_STATE__");

  const state = JSON.parse(stringifiedState);

  console.log(state);
  const songs = state.SONGS.data.map((song) => ({
    title: song.SNG_TITLE,
    artist: song.ART_NAME,
  }));

  console.log(songs);
}

main().then();
