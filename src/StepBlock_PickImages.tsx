
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import React from "react";
import { ImageFileMap } from "./ImageFileMap";
import { StepBlock } from "./StepBlock";
import { retrieveFirstFrameAsImageFromVideo } from "./VideoFirstFrameToImage";
import RectangleIcon from '@mui/icons-material/Rectangle';
import { keyframes } from "@mui/system";

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
        fileOrdering,
        setFileOrdering,
    }: {
        openedFiles: ImageFileMap,
        pickedFiles: Map<string, HTMLImageElement>,
        setPickedFiles: React.Dispatch<React.SetStateAction<Map<string, HTMLImageElement>>>,
        fileOrdering: Array<string>,
        setFileOrdering: React.Dispatch<React.SetStateAction<Array<string>>>,
    }
) {

    const [imageDataURIMap, setImageDataURIMap] = React.useState(new Map<string, LoadStatus>());

    const [imageDataElementMap, setImageDataElementMap] = React.useState<Map<string, HTMLImageElement>>(new Map());

    React.useEffect(
        () => {

            const removeItemsWithMissingFileNames = <E,>(oldMap: Map<string, E>) => {

                const newMap = new Map(oldMap);

                for (const fileName of Array.from(oldMap.keys())) {

                    if (!openedFiles.has(fileName)) {

                        newMap.delete(fileName);
                    }
                }

                if (newMap.size === oldMap.size) {

                    return oldMap;
                }
                else {

                    return newMap;
                }
            };

            setImageDataURIMap(removeItemsWithMissingFileNames)

            setImageDataElementMap(removeItemsWithMissingFileNames)

            setFileOrdering(oldArray => {

                const newArray = new Array<string>();

                for (let fileName of oldArray) {

                    if (openedFiles.has(fileName)) {

                        newArray.push(fileName);
                    }
                }

                if (oldArray.length === newArray.length) {

                    return oldArray;
                }

                return newArray;
            });
        },
        [openedFiles, setImageDataURIMap, setImageDataElementMap, setFileOrdering]
    );

    const openedFilesList = Array.from(openedFiles);



    React.useEffect(
        () => {

            openedFilesList.forEach(([fileName, openedFile]) => {

                const loadStatus = imageDataURIMap.get(fileName);

                if (loadStatus === undefined) {

                    // file has not been loaded yet, begin loading

                    setFileOrdering((oldArray) => {


                        if (oldArray.indexOf(fileName) !== -1) {

                            return oldArray;
                        }

                        const newArray = Array.from(oldArray);

                        newArray.push(fileName);

                        return newArray;
                    })

                    setImageDataURIMap((oldMap) => {
                        return getNewMap(
                            fileName,
                            {
                                aType: "loading",
                            },
                            oldMap
                        );
                    });

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
        [openedFilesList, setFileOrdering, setImageDataURIMap, imageDataURIMap]
    );

    const [switchFileName, setSwitchFileName] = React.useState<string | null>(null);

    return (
        <StepBlock
            colorSwitch={false}
            stepNumber={3}
            stepTitle="Pick images"
        >
            <Typography>
                Picked: {pickedFiles.size}/{openedFiles.size}.
            </Typography>
            <Button
                variant="contained"
                sx={{
                    marginBottom: "6px",
                }}
                onClick={() => {

                    setPickedFiles(() => {

                        const newMap = new Map();

                        const openedFileList = Array.from(openedFiles.keys());

                        openedFileList.forEach((openedFile) => {

                            const imageElement = imageDataElementMap.get(openedFile);

                            if (imageElement !== undefined) {

                                newMap.set(openedFile, imageElement);
                            }

                        });

                        return newMap;
                    });
                }}
            >
                Pick all loaded images
            </Button>

            <div
                style={{
                    display: "grid",
                    maxWidth: "100%",
                    maxHeight: (imageBlockSize * 5 + 40) + "px",
                    height: 1000,
                    overflowY: "scroll",
                    gridTemplateColumns: `repeat(auto-fill, ${imageBlockSize}px)`,
                    gridAutoRows: "1fr",
                }}
            >
                {
                    openedFilesList.map(([fileName,]) => {

                        return (
                            <ImageBlock

                                key={fileName}

                                fileName={fileName}

                                order={fileOrdering.indexOf(fileName)}

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

                                isPicked={pickedFiles.has(fileName)}

                                setIsPicked={(fileName, isPicked) => {


                                    setPickedFiles((oldMap) => {

                                        const newMap = new Map(oldMap);

                                        const isPickedElement = imageDataElementMap.get(fileName);

                                        if (!isPicked || isPickedElement === undefined) {

                                            newMap.delete(fileName);
                                        }
                                        else {

                                            newMap.set(fileName, isPickedElement);
                                        }

                                        return newMap;
                                    });
                                }}

                                pickedFiles={pickedFiles}

                                setImageElement={(fileName, imageElement) => {

                                    setImageDataElementMap(oldMap => {

                                        const newMap = new Map(oldMap);

                                        newMap.set(fileName, imageElement);

                                        return newMap;
                                    })
                                }}

                                switchFileName={switchFileName}

                                onSwitchClicked={(fileName) => {


                                    if (switchFileName === null) {

                                        setSwitchFileName(fileName);
                                    }
                                    else if (switchFileName === fileName) {

                                        setSwitchFileName(null);
                                    }
                                    else {

                                        setFileOrdering(oldArray => {

                                            if (switchFileName !== null) {

                                                const index1 = oldArray.indexOf(fileName);
                                                const index2 = oldArray.indexOf(switchFileName);

                                                const newArray = Array.from(oldArray);

                                                if (index1 !== index2 && index1 !== -1 && index2 !== -1) {

                                                    newArray[index1] = switchFileName;
                                                    newArray[index2] = fileName;

                                                    return newArray;
                                                }

                                            }

                                            return oldArray;
                                        });

                                        setSwitchFileName(null);
                                    }
                                }}
                            />
                        );
                    })
                }


            </div>

        </StepBlock>
    );
}

const spin = keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
`;

function ImageBlock(
    {
        fileName,
        order,
        imageDataURIMap,
        handleImageOnError,
        isPicked,
        setIsPicked,
        pickedFiles,
        setImageElement,
        switchFileName,
        onSwitchClicked,
    }: {
        fileName: string,
        order: number,
        imageDataURIMap: Map<string, LoadStatus>,
        handleImageOnError: (fileName: string) => void,
        isPicked: boolean,
        setIsPicked: (fileName: string, isPicked: boolean) => void,
        pickedFiles: Map<string, HTMLImageElement>,
        setImageElement: (fileName: string, htmlImageElement: HTMLImageElement) => void,
        switchFileName: string | null,
        onSwitchClicked: (fileName: string) => void,
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
                                    maxWidth: "100%",
                                    maxHeight: (imageBlockSize - 6) + "px",
                                    objectFit: "contain",
                                    alignSelf: "center",
                                    boxSizing: "border-box",
                                }}
                                ref={imageRef}
                                onLoad={() => {

                                    if (imageRef.current !== null) {

                                        const img = imageRef.current;

                                        if (img.naturalWidth === 0 || img.naturalHeight === 0) {

                                            handleImageOnError(fileName);
                                        }
                                        else {

                                            setImageElement(fileName, img);

                                            setImageSize([
                                                img.naturalWidth,
                                                img.naturalHeight
                                            ]);
                                        }
                                    }
                                }}
                                onError={() => {

                                    handleImageOnError(fileName)
                                }}
                            >
                            </img>
                        );
                }
                case "loadfailed": {

                    return loadingFailedText;
                }
            }
        })();

    const switchPart = (() => {

        const isThisBeingSwitched = fileName === switchFileName;

        return (
            <Button
                variant="contained"
                onClick={(e) => {

                    onSwitchClicked(fileName);
                }}
            >
                Switch

                {
                    isThisBeingSwitched
                        ?
                        <RectangleIcon
                            sx={{
                                marginLeft: "10px",
                                animation: `${spin} 3s linear infinite`
                            }}
                        />
                        :
                        <></>
                }
            </Button>
        );

    })();

    return (
        <div
            key={fileName}
            style={{
                border: "2px solid #aaaaaa",
                backgroundColor: pickedFiles.has(fileName) ? "#a4a4ff" : "",
                maxWidth: imageBlockSize + "px",
                width: imageBlockSize + "px",
                height: imageBlockSize * 1.8,
                maxHeight: imageBlockSize * 1.8,
                order: "" + order,

                display: "flex",
                flexDirection: "column",
            }}
        >
            {imageToShow}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "10px",
                }}
            >
                <div>
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
                </div>
                <div>
                    <FormControlLabel
                        label="Picked"
                        control={
                            <Switch
                                checked={isPicked}
                                disabled={loadStatus === undefined || loadStatus.aType !== "loadcomplete"}
                                onChange={(changeEvent) => {

                                    setIsPicked(fileName, changeEvent.target.checked);
                                }}
                            />
                        }
                    />
                    {
                        switchPart
                    }
                </div>
            </div>

        </div>
    );
}
