import type { Song } from "./core";

export const songBuilder = ({
  title = "Nevermind",
  artist = "Nirvana",
}: {
  title?: string;
  artist?: string;
} = {}): Song => ({
  artist,
  title,
});

export const playlistBuilder = ({
  songsCount = 60,
}: { songsCount?: number } = {}): Song[] => {
  return Array.from({ length: songsCount })
    .fill("")
    .map(() => songBuilder());
};
