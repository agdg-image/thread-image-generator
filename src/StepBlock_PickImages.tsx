
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
import { ThreadContext } from "./ThreadContext";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";

export type LoadStatus =
    {
        aType: "loadingimage"
    }
    |
    {
        aType: "loadingwebm"
    }
    |
    {
        aType: "loadcomplete",
        image: string,
    }
    |
    {
        aType: "loadwebmcomplete",
        webm: string,
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

export const imageBlockSize = 190;

function imageDataURIMapReducer(
    previousMap: Map<string, LoadStatus>,
    action:
        {
            aType: "removeItemsWithMissingFileNames",
            openedFiles: ImageFileMap,
        } |
        {
            aType: "loadingHasBegun",
            fileName: string,
            loadingKind: "loadingimage" | "loadingwebm"
        } |
        {
            aType: "loadingFailed",
            fileName: string,
        } |
        {
            aType: "didLoad",
            fileName: string,
            fileReaderResult: string,
        } |
        {
            aType: "didLoadImageFromWebm",
            fileName: string,
            image: string,
        }
) {


    switch (action.aType) {

        case "removeItemsWithMissingFileNames": {

            const newMap = new Map(previousMap);

            for (const fileName of Array.from(previousMap.keys())) {

                if (!action.openedFiles.has(fileName)) {

                    newMap.delete(fileName);
                }
            }

            if (newMap.size === previousMap.size) {

                return previousMap;
            }
            else {

                return newMap;
            }
        }
        case "loadingHasBegun": {

            if (previousMap.has(action.fileName)) {

                return previousMap;
            }

            const aType = action.loadingKind;

            const newMap = new Map(previousMap);

            newMap.set(action.fileName, {aType});

            return newMap;

        }
        case "loadingFailed": {

            const newMap = new Map(previousMap);

            newMap.set(action.fileName, {aType: "loadfailed"});

            return newMap;

        }
        case "didLoad": {

            const previous = previousMap.get(action.fileName);

            if (previous !== undefined) {

                if (previous.aType !== "loadfailed") {

                    const newResult =
                        previous.aType === "loadingwebm"
                            ?
                                {aType: "loadwebmcomplete", webm: action.fileReaderResult} as const
                            :
                                {aType: "loadcomplete", image: action.fileReaderResult} as const;

                    const newMap = new Map(previousMap);

                    newMap.set(action.fileName, newResult);

                    return newMap;

                }
                else {

                    return previousMap;
                }
            }
            else {

                // should not happen

                return previousMap;
            }
        }
        case "didLoadImageFromWebm": {

            const newMap = new Map(previousMap);

            newMap.set(action.fileName, {aType: "loadcomplete", image: action.image});

            return newMap;

        }
    }
}

export function StepBlock_PickImages(
    {
        openedFiles,
        pickedFiles,
        setPickedFiles,
        fileOrdering,
        setFileOrdering,
        threadContext,
    }: {
        openedFiles: ImageFileMap,
        pickedFiles: Map<string, HTMLImageElement>,
        setPickedFiles: React.Dispatch<React.SetStateAction<Map<string, HTMLImageElement>>>,
        fileOrdering: Array<string>,
        setFileOrdering: React.Dispatch<React.SetStateAction<Array<string>>>,
        threadContext: ThreadContext,
    }
) {

    const [imageDataURIMap, imageDataURIMapDispatch] = React.useReducer(imageDataURIMapReducer, new Map<string, LoadStatus>());

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

            imageDataURIMapDispatch({
                aType: "removeItemsWithMissingFileNames",
                openedFiles: openedFiles,
            });

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
        [openedFiles, imageDataURIMapDispatch, setImageDataElementMap, setFileOrdering]
    );

    React.useEffect(
        () => {

            imageDataURIMap.forEach((oldStatus, fileName) => {

                switch (oldStatus.aType) {

                    case "loadfailed":
                    case "loadcomplete":
                    case "loadingimage":
                    case "loadingwebm": {

                        break;
                    }
                    case "loadwebmcomplete": {

                        const webm = oldStatus.webm;

                        imageDataURIMapDispatch(
                            {
                                aType: "loadingHasBegun",
                                fileName,
                                loadingKind: "loadingimage",
                            }
                        );

                        retrieveFirstFrameAsImageFromVideo(fileName, webm)
                            .then(
                                (imageResult) => {

                                    imageDataURIMapDispatch(
                                        {
                                            aType: "didLoadImageFromWebm",
                                            fileName,
                                            image: imageResult as string,
                                        }
                                    );
                                },
                                () => {

                                    imageDataURIMapDispatch(
                                        {
                                            aType: "loadingFailed",
                                            fileName,
                                        }
                                    );
                                }
                            );

                        break;
                    }

                }
            });
        },
        [imageDataURIMapDispatch, imageDataURIMap]
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

                    imageDataURIMapDispatch(
                        {
                            aType: "loadingHasBegun",
                            fileName,
                            loadingKind: fileName.endsWith(".webm")
                                ? "loadingwebm"
                                : "loadingimage"
                        }
                    );

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

                            imageDataURIMapDispatch(
                                {
                                    aType: "didLoad",
                                    fileName,
                                    fileReaderResult: fileReader.result as string,
                                }
                            );

                            cleanUp(listener);
                        }
                        else if (event.type === "error" || event.type === "abort") {

                            imageDataURIMapDispatch(
                                {
                                    aType: "loadingFailed",
                                    fileName,
                                }
                            );

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
        [openedFilesList, setFileOrdering, imageDataURIMapDispatch, imageDataURIMap]
    );

    const [switchFileName, setSwitchFileName] = React.useState<string | null>(null);

    const onSwitchClicked = React.useCallback(
        (fileName: string) => {


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
        },
        [switchFileName, setFileOrdering]
    );

    const setImageElementCallback = React.useCallback(
        (fileName: string, imageElement: HTMLImageElement) => {

            setImageDataElementMap(oldMap => {

                const newMap = new Map(oldMap);

                newMap.set(fileName, imageElement);

                return newMap;
            })
        },
        [setImageDataElementMap]
    );

    const setIsPickedCallback = React.useCallback(
        (fileName: string, isPicked: boolean) => {


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
        },
        [imageDataElementMap, setPickedFiles]
    );

    const handleImageOnError = React.useCallback(
        (fileName: string) => {

            imageDataURIMapDispatch(
                {
                    aType: "loadingFailed",
                    fileName,
                }
            );
        },
        [imageDataURIMapDispatch]
    );

    return (
        <StepBlock
            stepNumber={4}
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
                Pick all loaded images ({imageDataElementMap.size})
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

                                loadStatus={imageDataURIMap.get(fileName)}

                                handleImageOnError={handleImageOnError}

                                isPicked={pickedFiles.has(fileName)}

                                setIsPicked={setIsPickedCallback}

                                setImageElement={setImageElementCallback}

                                switchFileName={switchFileName}

                                onSwitchClicked={onSwitchClicked}

                                threadContext={threadContext}
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
        loadStatus,
        handleImageOnError,
        isPicked,
        setIsPicked,
        setImageElement,
        switchFileName,
        onSwitchClicked,
        threadContext,
    }: {
        fileName: string,
        order: number,
        loadStatus: LoadStatus | undefined,
        handleImageOnError: (fileName: string) => void,
        isPicked: boolean,
        setIsPicked: (fileName: string, isPicked: boolean) => void,
        setImageElement: (fileName: string, htmlImageElement: HTMLImageElement) => void,
        switchFileName: string | null,
        onSwitchClicked: (fileName: string) => void,
        threadContext: ThreadContext,
    }
) {

    const imageRef = React.useRef<HTMLImageElement | null>(null);

    const [imageSize, setImageSize] = React.useState<[number, number] | null>(null);

    const [showContextDialog, setShowContextDialog] = React.useState(false);

    const imageToShow = loadStatus === undefined
        ?
        <CircularProgress />
        :
        (() => {
            switch (loadStatus.aType) {

                case "loadingimage":
                case "loadingwebm":
                case "loadwebmcomplete": {
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

                                onClick={() => {

                                    setShowContextDialog(true);
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

    const threadContextContentAndOriginalFileName = threadContext.get(fileName);

    const threadContextElement = (() => {

        if (threadContextContentAndOriginalFileName !== undefined) {

            const [content, originalFileName] = threadContextContentAndOriginalFileName;

            const splitContent = content.split("<br>");

            return (

                <Container>

                    <Typography
                        variant="h6"
                        sx={{
                            marginTop: "10px",
                        }}
                    >
                        Source content of post (where &lt;br&gt; has been replaced with newlines)
                    </Typography>

                    <Card>

                        <Container>

                            <Typography
                            >
                                {
                                    splitContent.map((spl, index) => {

                                        return (
                                            <React.Fragment
                                                key={index + ": " + spl}
                                            >
                                                {
                                                    spl
                                                }
                                                <br/>
                                            </React.Fragment>
                                        );
                                    })
                                }
                            </Typography>
                        </Container>

                    </Card>

                    <Typography
                        variant="h6"
                        sx={{
                            marginTop: "10px",
                        }}
                    >
                        Original file name
                    </Typography>

                    <Card>

                        <Container>

                            <Typography>
                                {originalFileName}
                            </Typography>
                        </Container>

                    </Card>

                </Container>
            );
        }
        else {

            return (
                <></>
            );
        }

    })();


    return (
        <div
            key={fileName}
            style={{
                border: "2px solid #aaaaaa",
                backgroundColor: isPicked ? "#a4a4ff" : "",
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

            <Dialog
                open={showContextDialog}
                fullWidth={true}
                maxWidth={false}
                onClose={() => {

                    setShowContextDialog(false);
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                    }}
                >

                    {
                        loadStatus?.aType === "loadcomplete"
                            ?
                                <img
                                    style={{
                                        flex: "1",
                                        maxWidth: "90vw",
                                        maxHeight: "90vh",
                                        objectFit: "contain",
                                    }}
                                    src={loadStatus.image}
                                >
                                </img>
                            :
                                <></>
                    }

                    <Box
                        sx={{
                            flex: "1",
                        }}
                    >
                        {
                            threadContextElement
                        }
                    </Box>

                </Box>

            </Dialog>

        </div>
    );
}
