
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import React from "react";
import { ImageFileMap } from "./ImageFileMap";
import { StepBlock } from "./StepBlock";
import { retrieveFirstFrameAsImageFromVideo } from "./VideoFirstFrameToImage";

export type LoadStatus =
    {
        aType: "loading"
    }
    |
    {
        aType: "loadcomplete",
        image: string,
    }
    |
    {
        aType: "loadfailed",
    };

const loadingFailedText = (
    <Typography>
        Loading failed.
    </Typography>
);

function getNewMap(fileName: string, loadStatus: LoadStatus, oldMap: Map<string, LoadStatus>) {

    const newMap = new Map(oldMap);

    newMap.set(
        fileName,
        loadStatus
    );

    return newMap;
}

export const imageBlockSize = 190;

export function StepBlock_PickImages(
    {
        openedFiles,
        pickedFiles,
        setPickedFiles,
    }: {
        openedFiles: ImageFileMap,
        pickedFiles: Map<string, HTMLImageElement>,
        setPickedFiles: React.Dispatch<React.SetStateAction<Map<string, HTMLImageElement>>>,
    }
) {

    const [imageDataURIMap, setImageDataURIMap] = React.useState(new Map<string, LoadStatus>());

    const openedFilesList = Array.from(openedFiles);

    React.useEffect(
        () => {

            openedFilesList.forEach(([fileName, openedFile]) => {

                const loadStatus = imageDataURIMap.get(fileName);

                if (loadStatus === undefined) {

                    // file has not been loaded yet, begin loading

                    const fileReader = new FileReader();

                    const endEventTypes = [
                        "load",
                        "error",
                        "abort",
                    ] as const;

                    const cleanUp = (theListener: (event: ProgressEvent<FileReader>) => void) => {

                        endEventTypes.forEach(eventType => {

                            fileReader.removeEventListener(eventType, theListener);
                        });
                    }

                    const listener = (event: ProgressEvent<FileReader>) => {

                        if (event.type === "load") {

                            setImageDataURIMap((oldMap) => {

                                // be aware, casting the type

                                const oldStatus = oldMap.get(fileName);

                                const didFail = oldStatus !== undefined && oldStatus.aType === "loadfailed"

                                if (!didFail) {

                                    if (fileName.endsWith(".webm")) {


                                        retrieveFirstFrameAsImageFromVideo(fileName, fileReader.result as string)
                                            .then(
                                                (imageResult) => {


                                                    setImageDataURIMap((anotherOldMap) => {

                                                        return getNewMap(
                                                            fileName,
                                                            {
                                                                aType: "loadcomplete",
                                                                image: imageResult as string,
                                                            },
                                                            anotherOldMap
                                                        );
                                                    })
                                                },
                                                () => {

                                                    setImageDataURIMap((anotherOldMap) => {

                                                        return getNewMap(
                                                            fileName,
                                                            {
                                                                aType: "loadfailed",
                                                            },
                                                            anotherOldMap
                                                        );
                                                    })
                                                }
                                            );

                                        return oldMap;
                                    }
                                    else {

                                        return getNewMap(
                                            fileName,
                                            {
                                                aType: "loadcomplete",
                                                image: fileReader.result as string,
                                            },
                                            oldMap
                                        );
                                    }
                                }
                                else {

                                    return oldMap;
                                }
                            });

                            cleanUp(listener);
                        }
                        else if (event.type === "error" || event.type === "abort") {

                            setImageDataURIMap((oldMap) => {

                                return getNewMap(
                                    fileName,
                                    {
                                        aType: "loadfailed",
                                    },
                                    oldMap
                                );
                            });

                            cleanUp(listener);
                        }
                    };

                    endEventTypes.forEach(eventType => {

                        fileReader.addEventListener(eventType, listener);
                    });

                    fileReader.readAsDataURL(openedFile);
                }
                else {

                    // loading is in progress or ended somehow
                }
            })
        },
        [openedFiles, imageDataURIMap, openedFilesList]
    );

    return (
        <StepBlock
            colorSwitch={false}
            stepNumber={3}
            stepTitle="Pick images"
        >
            <div
                style={{
                    display: "flex",
                    maxHeight: (imageBlockSize*5 + 40) + "px",
                    height: 1000,
                    overflowY: "scroll",
                    flexWrap: "wrap",
                }}
            >
                {
                    openedFilesList.map(([fileName, openedFile]) => {

                        return (
                            <ImageBlock

                                key={fileName}

                                fileName={fileName}

                                imageDataURIMap={imageDataURIMap}

                                handleImageOnError={(fileName) => {


                                    setImageDataURIMap((oldMap) => {

                                        return getNewMap(
                                            fileName,
                                            {
                                                aType: "loadfailed",
                                            },
                                            oldMap
                                        );
                                    });
                                }}

                                setIsPicked={(fileName, isPickedElement) => {


                                    setPickedFiles((oldMap) => {

                                        const newMap = new Map(oldMap);

                                        if (isPickedElement !== null) {

                                            newMap.set(fileName, isPickedElement);
                                        }
                                        else {

                                            newMap.delete(fileName);
                                        }

                                        return newMap;
                                    });
                                }}

                                pickedFiles={pickedFiles}
                            />
                        );
                    })
                }


            </div>

        </StepBlock>
    );
}

function ImageBlock(
    {
        fileName,
        imageDataURIMap,
        handleImageOnError,
        setIsPicked,
        pickedFiles,
    }: {
        fileName: string,
        imageDataURIMap: Map<string, LoadStatus>,
        handleImageOnError: (fileName: string) => void,
        setIsPicked: (fileName: string, pickedHTMLImageElement: HTMLImageElement | null) => void,
        pickedFiles: Map<string, HTMLImageElement>,
    }
) {

    const loadStatus = imageDataURIMap.get(fileName);

    const imageRef = React.useRef<HTMLImageElement | null>(null);

    const [imageSize, setImageSize] = React.useState<[number, number] | null>(null);

    const imageToShow = loadStatus === undefined
        ?
            <CircularProgress />
        :
            (() => {
                switch (loadStatus.aType) {

                    case "loading": {
                        return <CircularProgress />;
                    }
                    case "loadcomplete": {

                        return loadStatus.image === null
                            ? loadingFailedText
                            : (
                                <img
                                    src={loadStatus.image}
                                    style={{
                                        maxWidth: imageBlockSize + "px",
                                        maxHeight: imageBlockSize + "px",
                                        objectFit: "contain",
                                        alignSelf: "center",
                                    }}
                                    ref={imageRef}
                                    onLoad={() => {

                                        if (imageRef.current !== null) {

                                            const img = imageRef.current;

                                            if (img.naturalWidth === 0 || img.naturalHeight === 0) {

                                                handleImageOnError(fileName);
                                            }
                                            else {

                                                setImageSize([
                                                    img.naturalWidth,
                                                    img.naturalHeight
                                                ]);
                                            }
                                        }
                                    }}
                                    onError={() => handleImageOnError(fileName)}
                                >
                                </img>
                            );
                    }
                    case "loadfailed": {

                        return loadingFailedText;
                    }
                }
            })();

    return (
        <div
            key={fileName}
            style={{
                border: "2px solid #aaaaaa",
                backgroundColor: pickedFiles.has(fileName) ? "#a4a4ff" : "",
                maxWidth: imageBlockSize + "px",
                width: imageBlockSize + "px",
            }}
        >
            {imageToShow}
            <div
                style={{
                    padding: "4px",
                }}
            >
                <Typography
                    title={fileName}
                    sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: "10px",
                    }}
                >
                    Filename: {fileName}
                </Typography>
                {
                    imageSize === null
                        ?
                            <></>
                        :
                            <Typography
                                sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontSize: "10px",
                                }}
                            >
                                Size: {imageSize[0] + "x" + imageSize[1]}
                            </Typography>
                }
                <FormControlLabel
                    label="Picked"
                    control={
                        <Switch
                            disabled={loadStatus === undefined || loadStatus.aType !== "loadcomplete" }
                            onChange={(changeEvent) => {

                                if (changeEvent.target.checked) {

                                    setIsPicked(fileName, imageRef.current);
                                }
                                else {

                                    setIsPicked(fileName, null);
                                }
                            }}
                        />
                    }
                />
            </div>

        </div>
    );
}
