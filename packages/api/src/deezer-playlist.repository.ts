import type { PlaylistRepository, Song } from "./core.js";
import type { DeezerApi } from "./deezer.types.js";
import { playlistBuilder } from "./mocks.js";
import { execSync } from "child_process";

class InvalidPlaylistUrl extends Error {
  constructor(playlistUrl: string) {
    super(`${playlistUrl} is not a valid url`);
  }
}

class CouldNotRetrieveDeezerApiToken extends Error {
  constructor(originalError?: Error) {
    super("Could not retrieve Deezer API token");
    this.name = "CouldNotRetrieveDeezerApiToken";
    if (originalError) this.stack = originalError.stack;
  }
}

class CouldNotFetchDeezerPlaylist extends Error {
  constructor(playlistId: string, originalError?: Error | string) {
    super(`Could not fetch Deezer playlist ${playlistId}`);
    this.name = "CouldNotFetchDeezerPlaylist";
    if (originalError)
      this.stack =
        typeof originalError === "string" ? originalError : originalError.stack;
  }
}

class CouldNotFetchDeezerCookie extends Error {
  constructor(playlistId: string, originalError?: Error | string) {
    super(`Could not fetch Deezer cookie for playlist ${playlistId}`);
    this.name = "CouldNotFetchDeezerCookie";
    if (originalError)
      this.stack =
        typeof originalError === "string" ? originalError : originalError.stack;
  }
}

class DeezerPlaylistRepository implements PlaylistRepository {
  async getPlaylistSongs(playlistUrl: string): Promise<Song[]> {
    try {
      new URL(playlistUrl);
    } catch (err) {
      throw new InvalidPlaylistUrl(playlistUrl);
    }
    const response = await fetch(playlistUrl, {
      method: "GET",
    });

    const html = await response.text();

    const stringifiedState = html.match(
      /__DZR_APP_STATE__ = (.*)<\/script>/
    )?.[1];

    if (!stringifiedState) throw new Error("Could not find __DZR_APP_STATE__");

    const state = JSON.parse(stringifiedState);

    const songs = state.SONGS.data.map((song: any) => ({
      title: song.SNG_TITLE as string,
      artist: song.ART_NAME as string,
    }));

    return songs;
  }
}

export class FakeDeezerPlaylistRepository implements PlaylistRepository {
  async getPlaylistSongs(playlistId: string): Promise<Song[]> {
    return playlistBuilder();
  }
}

export class DeezerApiPlaylistRepository implements PlaylistRepository {
  private async getApiCredentials(): Promise<{
    apiToken: string;
    cookie: string;
  }> {
    try {
      const res = await fetch(
        "https://www.deezer.com/ajax/gw-light.php?method=deezer.getUserData&input=3&api_version=1.0&api_token=",
        { method: "GET" }
      );

      const cookie = res.headers.get("Set-Cookie") || "";

      const json = (await res.json()) as {
        results: { checkForm: string };
        error: [];
      };

      if (json.error?.length < 0) throw new CouldNotRetrieveDeezerApiToken();

      return { cookie, apiToken: json.results?.checkForm };
    } catch (err) {
      throw new CouldNotRetrieveDeezerApiToken(err as Error);
    }
  }

  async getPlaylistSongs(playlistId: string): Promise<Song[]> {
    try {
      const { apiToken, cookie } = await this.getApiCredentials();

      const res = await fetch(
        `https://www.deezer.com/ajax/gw-light.php?method=deezer.pagePlaylist&input=3&api_version=1.0&api_token=${apiToken}&cid=`,
        {
          method: "POST",
          body: `{"playlist_id":${playlistId},"nb":10000,"start":0,"lang":"us","tab":0,"tags":true,"header":true}`,
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            Cookie: cookie,
          },
        }
      );

      const data = (await res.json()) as DeezerApi.PlaylistGetResponse;

      console.log({ data: data.results });
      console.log({ error: data.error });

      const hasError = Object.keys(data.error).length > 0;
      if (hasError) {
        throw new CouldNotFetchDeezerPlaylist(
          playlistId,
          JSON.stringify(data.error)
        );
      }
      console.groupEnd();
      return (
        data.results.SONGS?.data.map((song) => ({
          title: song.SNG_TITLE,
          artist: song.ART_NAME,
        })) || []
      );
    } catch (err) {
      throw new CouldNotFetchDeezerPlaylist(playlistId, err as Error);
    }
  }
}
