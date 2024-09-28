/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from "@/lib/ui/alert";
import { Button } from "@/lib/ui/button";
import { Input } from "@/lib/ui/input";
import { Label } from "@radix-ui/react-label";
import { FieldApi, FieldValidateFn, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { validateDeezerPlaylistUrl } from "./url.validators";
import { downloadFileFromUrl } from "@/utils/downloadFile";
import { useRef, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { IconCheckCircle } from "./CheckIcon";


type Song = { title: string; artist: string}
type ApiSongsBatch = { id: string; songs: Array<Song>}
type ApiSongsBatches = Array<ApiSongsBatch>

type SongsBatches = Array<ApiSongsBatch & { pending: boolean}>

  
  
  
  const fieldHasError = (field: FieldApi<any, any, any, any>) => field.state.meta.isTouched && !!field.state.meta.errors?.length
   
  function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
    return (
      <>
        {fieldHasError(field) ? (
          <em className="text-red-600 text-md">{field.state.meta.errors.join(", ")}</em>
        ) : null}
        {field.state.meta.isValidating ? "Validating..." : null}
      </>
    );
  }
  
  
  
  
  
  const urlValidator : FieldValidateFn<any, any,any, any , string> = (field) => {
      const { valid, errorMessage } = validateDeezerPlaylistUrl(field.value)
  
      return valid ? undefined : errorMessage
  }


  export function DeezerDownloaderForm () {

  const form = useForm({
    defaultValues: {
      playlistUrl: "",
    },
    onSubmit: async ({ value }) => {
      const playlistUrl = value.playlistUrl

      await mutate({ playlistUrl}, {
        onSuccess: () => form.reset()
      })
    },
  });


  const [_songsBatches, _setSongsBatches] = useState<SongsBatches>([])



  const songsBatches = useRef(_songsBatches);

  const setSongsBatches = (newSongsBatches: SongsBatches) => {
    songsBatches.current = newSongsBatches
    _setSongsBatches(newSongsBatches)
  }



  const { isPending, isError, mutate } = useMutation({
    mutationKey: ["deezer-playlist", form.state.values.playlistUrl],
    
    mutationFn: async ({ playlistUrl}: { playlistUrl: string}) => {
   



      

      const source = new EventSource(`//localhost:3000/events?playlistUrl=${playlistUrl}`, )

      source.onmessage = async function (event)  {

        console.group('Received batch audio file')
          const data = event.data as string;

          const file = data.match(/file=(.*?);/)?.[1]
          const batchId = data.match(/id=(.*?);/)?.[1]

          if (!file || !batchId) {
            console.groupEnd()
            throw new Error('Invalid data received from server')
          }

            console.log({ file  , batchId})



          const completedBatch = songsBatches.current.find(b => b.id === batchId)

          if (!completedBatch) {
            console.groupEnd()

            throw new Error('Batch not found')
          }



          


          const audiosFileUrl = `${import.meta.env.VITE_APP_API_BASE_URL}/${file}`;
          await downloadFileFromUrl(audiosFileUrl)

          completedBatch.pending = false


          setSongsBatches([...songsBatches.current])


          console.groupEnd()

  
      }
  
      source.onerror = () => {
          source.close()
          console.error("an error occurred when connecting to SSE")
      }

      
  
      source.onopen = () => {
          console.log('Opening connections ...')
      }

      const r = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/deezer-mp3?playlistUrl=${playlistUrl}`,{ method: 'GET'})
      const songsBatchesData  = await r.json() as ApiSongsBatches


      

      const songsBatchesWithPendingStatus = songsBatchesData.map(batch => ({ ...batch, pending: true}))
      console.log({ songsBatchesWithPendingStatus})

      setSongsBatches([...songsBatchesWithPendingStatus])

      


    },
  });


  return  <form
  className="flex flex-col gap-4"
    onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}
  >
    <form.Field
      name="playlistUrl"
      validators={{
        onChange: urlValidator
      }}
      children={(field) => (
        <div className="flex flex-col gap-2">
          <Label className="text-left" htmlFor={field.name}>Playlist URL</Label>
          <Input
             error={fieldHasError(field)}
            id={field.name}
            
            value={field.state.value}
            onBlur={field.handleBlur}
            placeholder="https://deezer.com/us/playlist/12345"
            onChange={(e) => {
              field.handleChange(e.target.value);
            }}
          />

          <FieldInfo field={field} />
        </div>
      )}
    />

    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => (
        <Button className="w-full" type="submit" disabled={!canSubmit || isPending}>
          {isSubmitting ? "..." : "Submit"}
        </Button>
      )}
    />


    { isError && <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>We were unable to download songs from your Deezer playlist. Are you sure the url is correct ? </AlertDescription>
    </Alert> }

      <ol>
    { _songsBatches.map((batch, index) => <li key={batch.id} className="flex flex-row justify-between gap-2"> 
      <div className="text-md font-semibold">
      Batch {index + 1}
      </div>

      <div className="flex flex-col text-xs font-extralight">
      { batch.songs.map(song => <div className="flex flex-row gap-2"> <div> { song.title } - {song.artist}</div></div>
    )}





      </div>

      { batch.pending  ? <LoadingSpinner  /> : <IconCheckCircle /> }



      </li>)}


    </ol>



  </form>
}
