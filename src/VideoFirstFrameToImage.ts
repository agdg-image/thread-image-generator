
export function retrieveFirstFrameAsImageFromVideo(
    videoFileName: string,
    fileReaderResult: string
) {

    return new Promise(
        (
            onFulfilled: (imageResult: string) => void,
            onRejected: () => void,
        ) => {

            let didEnd: boolean = false;

            const video = document.createElement("video");
            video.autoplay = true;

            video.addEventListener("loadeddata", (loadedDataEvent) => {

                if (!didEnd) {

                    const canvas = document.createElement("canvas");

                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    const ctx = canvas.getContext("2d");

                    if (ctx !== null) {

                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        didEnd = true;

                        onFulfilled(canvas.toDataURL());

                        video.pause();
                        video.removeAttribute("src");
                        video.load();
                    }
                }
            });

            video.addEventListener("error", () => {

                if (!didEnd) {

                    onRejected();
                }
            });

            video.src = fileReaderResult;
        }
    );
}
