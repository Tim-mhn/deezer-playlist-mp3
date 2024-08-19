import { DEEZER_PLAYLIST_HTML } from "./deezer-page-html";

function parseDeezerPlaylistHtml(html: string) {
  const stringifiedState = html
    .split("window.__DZR_APP_STATE__ = ")[1]
    .split("</script>")[0];

  console.log(stringifiedState);

  const state = JSON.parse(stringifiedState);

  console.log(state);
}

parseDeezerPlaylistHtml(DEEZER_PLAYLIST_HTML);

const a = "</script>";
