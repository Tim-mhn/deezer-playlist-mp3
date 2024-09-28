const downloadFile = async (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = name; // add custom extension here
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);

  // Remove "a" tag from the body
  a.remove();
};

export async function downloadFileFromUrl(
  url: string,
  options = { filename: "" },
) {
  const res = await fetch(url, { method: "GET" });

  const blob = await res.blob();

  const filename =
    options.filename ||
    res.headers
      .get("content-disposition")
      ?.split("filename=")[1]
      .split(";")[0]
      .replace(/"/g, "") ||
    "deezer-audios.zip";

  console.log({ filename });

  await downloadFile(blob, filename);
}
