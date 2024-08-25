const isValidUrlFn = (maybeUrl: string) => {
  try {
    new URL(maybeUrl);
    return true;
  } catch {
    return false;
  }
};

export function validateDeezerPlaylistUrl(playlistUrl: string) {
  if (!playlistUrl) return { valid: false, errorMessage: "Please enter a url" };

  const isValidUrl = isValidUrlFn(playlistUrl);

  if (!isValidUrl)
    return {
      valid: false,
      errorMessage:
        "Please enter a valid url. Make sure it starts with https://",
    };

  const matches = playlistUrl.match(/^https?:\/\/(www\.)?deezer/);

  if (!matches)
    return {
      valid: false,
      errorMessage:
        "Please enter a Deezer playlist url. Make sure it starts with https://deezer.com or https://deezer.fr",
    };

  return { valid: true, errorMessage: "" };
}
