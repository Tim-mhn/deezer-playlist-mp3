export function HelpNote() {
  return (
    <div className="flex items-center justify-center text-justify">
    <div className="flex flex-col gap-4 text-slate-800 m-auto ">
      <div className="text-xl font-medium text-center">Deezer to MP3 Downloader</div>

      <div className="text-md">
        This Deezer to MP3 Downloader allows you to convert your favorite Deezer
        playlists to MP3 (audio). It will generate multiple zip files of 20 songs maximum each.
      </div>

      <div className="text-lg font-medium text-center mt-4">How to download a Deezer playlist ?</div>


      <ol className="list-decimal flex flex-col gap-1 text-sm mx-4">
        <li>Go to Deezer.com and search for the playlist you would like to download</li>
        <li>Copy the playlist URL from the browser address bar (https://deezer.com/us/playlist/xyz). </li>
        <li>Paste the playlist URL in this Deezer to MP3 Downloader and click on the "Download" button</li>
        <li>The download of the playlist will start. It may take a few minutes</li>
      
      </ol>
    </div>
    </div>
  );
}
