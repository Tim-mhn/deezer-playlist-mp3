import { describe, it, expect } from "vitest";
import { validateDeezerPlaylistUrl } from "./url.validators";

describe("Validate url", () => {
  it("invalidates an empty url", () => {
    const { valid, errorMessage } = validateDeezerPlaylistUrl("");

    expect(valid).toBeFalsy();
    expect(errorMessage).toEqual("Please enter a url");
  });

  it("invalidates an invalid url", () => {
    const { valid, errorMessage } =
      validateDeezerPlaylistUrl("not-a-valid-url");

    expect(valid).toBeFalsy();
    expect(errorMessage).toContain("Please enter a valid url");
  });

  it("invalidates a non-Deezer url", () => {
    const { valid, errorMessage } = validateDeezerPlaylistUrl(
      "https://google.com/xyz",
    );

    expect(valid).toBeFalsy();
    expect(errorMessage).toContain("Please enter a Deezer playlist url");
  });

  it("validates a US Deezer playlist url", () => {
    const { valid } = validateDeezerPlaylistUrl(
      "https://www.deezer.com/us/playlist/12885423303",
    );

    expect(valid).toBeTruthy();
  });

  it("validates a FR Deezer playlist url", () => {
    const { valid } = validateDeezerPlaylistUrl(
      "https://www.deezer.fr/fr/playlist/12885423303",
    );

    expect(valid).toBeTruthy();
  });
});
