/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from "@/lib/ui/alert";
import { Button } from "@/lib/ui/button";
import { Input } from "@/lib/ui/input";
import { Label } from "@radix-ui/react-label";
import { FieldApi, FieldValidateFn, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { validateDeezerPlaylistUrl } from "./url.validators";

const convertFiletoBlobAndDownload = async (blob: Blob, name: string) => {
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

  const { isPending, isError, mutate } = useMutation({
    mutationKey: ["deezer-playlist", form.state.values.playlistUrl],
    
    mutationFn: ({ playlistUrl}: { playlistUrl: string}) => downloadPlaylist(playlistUrl),
  });

  const downloadPlaylist = async (playlistUrl: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_APP_API_BASE_URL}/deezer-mp3?playlistUrl=${playlistUrl}`,
      {
        method: "GET",
      },
    );

    const blob = await res.blob();

    const filename =
      res.headers
        .get("content-disposition")
        ?.split("filename=")[1]
        .split(";")[0].replace(/"/g, "") || "deezer-audios.zip";

        console.log({ filename})

    await convertFiletoBlobAndDownload(blob, filename);
  }

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
  </form>
}
