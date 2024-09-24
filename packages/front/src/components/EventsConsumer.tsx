import { downloadFileFromUrl } from "@/utils/downloadFile"
import { useEffect } from "react"

export function EventsConsumer() {

    
    console.log('events consumer')





    useEffect(() => {

        console.log('building Event Source')
        const source = new EventSource("//localhost:3000/events?playlistUrl=https://www.deezer.com/us/playlist/12885423303", )

        source.onmessage = async (event) => {
            // const filename = event.data
            // const fileUrl = `http://localhost:3000/${filename}`
            // await downloadFileFromUrl(fileUrl)
            const audiosFile = event.data;

            const audiosFileUrl = `http://localhost:3000/${audiosFile}`;
            downloadFileFromUrl(audiosFileUrl)
    
        }
    
        source.onerror = () => {
            source.close()
            console.error("an error occurred when connecting to SSE")
        }

        
    
        source.onopen = () => {
            console.log('Opening connections ...')
        }
    }, [])

   



  


    return <div>listening to events</div>
}