import { HelpNote } from "./HelpNote";
import { DeezerDownloaderForm } from "./DeezerDownloaderForm";

export function DeezerDownloaderPage() {
  return (
    <div className=" h-screen">
      <div className="flex flex-col gap-16 h-full m-auto max-w-[600px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-6xl text-slate-800">Deezer Downloader</h1>

          <h2 className="text-2xl text-slate-600">
            Download Deezer playlists to MP3
          </h2>
        </div>

        <DeezerDownloaderForm />

        <HelpNote />
      </div>
    </div>
  );
}
