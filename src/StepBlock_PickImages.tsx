
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
import { WorkflowType } from "./WorkflowType";
import { getNumber } from "./helper";
import HelpOutline from "@mui/icons-material/HelpOutline";

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
        stepNumber,
        openedFiles,
        pickedFiles,
        setPickedFiles,
        fileOrdering,
        setFileOrdering,
        threadContext,
        workflowType,
        switchFileName,
        onSwitchClicked,
    }: {
        stepNumber: number,
        openedFiles: ImageFileMap,
        pickedFiles: Map<string, HTMLImageElement>,
        setPickedFiles: React.Dispatch<React.SetStateAction<Map<string, HTMLImageElement>>>,
        fileOrdering: Array<string>,
        setFileOrdering: React.Dispatch<React.SetStateAction<Array<string>>>,
        threadContext: ThreadContext,
        workflowType: WorkflowType,
        switchFileName: string | null,
        onSwitchClicked: (fileName: string) => void,
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

    const [showGuidelinesDialog, setShowGuidelinesDialog] = React.useState(false);

    return (
        <StepBlock
            stepNumber={stepNumber}
            stepTitle="Pick images"
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                }}
            >

                <Typography>
                    Pick which images should be shown on the collage.
                </Typography>

                <Dialog
                    open={showGuidelinesDialog}
                    onClose={() => {

                        setShowGuidelinesDialog(false);
                    }}
                >
                    <Container
                        sx={{
                            paddingTop: "4px",
                        }}
                    >
                        <Typography>
                            Guidelines:

                        </Typography>

                        <ul>
                            <li>
                                Repetition should be avoided, and similar-looking images unpicked to one image.
                            </li>
                            <li>
                                Code should be posted very rarely, preferably at most once per collage.
                            </li>
                            <li>
                                Stuff like settings, which all look the same and are boring, should mostly be excluded.
                            </li>
                            <li>
                                Stuff like sketches and other rough stuff are good candidates for inclusion.
                            </li>
                        </ul>

                    </Container>

                </Dialog>

                <Button
                    variant="contained"
                    sx={{
                        marginLeft: "10px",
                    }}
                    onClick={() => {

                        setShowGuidelinesDialog(true);
                    }}
                >

                    <HelpOutline/>

                </Button>

            </Box>


            <Typography>
                Picked: {pickedFiles.size}/{openedFiles.size}.
            </Typography>


            <Card
                sx={{
                    marginBottom: "6px",
                    paddingBottom: "6px",
                }}
            >
                <Container>

                    <Typography
                        variant="h6"
                    >

                        Extra controls

                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                        }}
                    >

                        <Button
                            variant="contained"
                            disabled={pickedFiles.size === imageDataElementMap.size}
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

                        <Button
                            variant="contained"
                            disabled={pickedFiles.size === 0}
                            onClick={() => {

                                setPickedFiles(() => {

                                    return new Map();
                                });
                            }}
                        >
                            Unpick all images
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => {

                                setFileOrdering((oldFileOrdering) => {

                                    const newFileOrdering = Array.from(oldFileOrdering);

                                    shuffle(newFileOrdering);

                                    return newFileOrdering;
                                });
                            }}
                        >
                            Shuffle open images
                        </Button>

                        {
                            workflowType === "full_control"
                                ?
                                    <>
                                        <Button
                                            variant="contained"
                                            disabled={pickedFiles.size === 0 || imageDataElementMap.size === 0 || pickedFiles.size === openedFiles.size}
                                            onClick={() => {

                                                if (pickedFiles.size !== 0) {

                                                    const imageDataFilenamesCopy = Array.from(imageDataElementMap.keys());

                                                    shuffle(imageDataFilenamesCopy);

                                                    // pickedFiles size ought to always be lower than imageDataElementMap size
                                                    const newSize = Math.min(pickedFiles.size, imageDataElementMap.size);

                                                    const newPickedFiles = new Map<string, HTMLImageElement>();

                                                    for (let i = 0; i < newSize; i++) {

                                                        const fileName = imageDataFilenamesCopy[i];

                                                        const imageData = imageDataElementMap.get(fileName);

                                                        if (imageData !== undefined) {

                                                            newPickedFiles.set(fileName, imageData);
                                                        }
                                                    }

                                                    setPickedFiles(newPickedFiles);
                                                }
                                            }}
                                        >
                                            Pick images randomly (does not change number of picked files)
                                        </Button>

                                        <Card

                                            sx={{
                                                width: "100%",
                                                marginTop: "10px",
                                            }}
                                        >
                                            <Container>

                                                <ChangePickedImagesNumber
                                                    imageDataElementMap={imageDataElementMap}
                                                    pickedFiles={pickedFiles}
                                                    setPickedFiles={setPickedFiles}
                                                    fileOrdering={fileOrdering}
                                                />
                                            </Container>
                                        </Card>
                                    </>
                                : <></>
                        }

                    </Box>

                </Container>
            </Card>

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
                Swap

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
                                        minWidth: "0px",
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



// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle<E>(a: Array<E>) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function ChangePickedImagesNumber(
    {
        imageDataElementMap,
        pickedFiles,
        setPickedFiles,
        fileOrdering,
    }: {
        imageDataElementMap: Map<string, HTMLImageElement>,
        pickedFiles: Map<string, HTMLImageElement>,
        setPickedFiles: (newPickedFiles: Map<string, HTMLImageElement>) => void,
        fileOrdering: Array<string>,
    }

) {

    const inputRef = React.createRef<HTMLInputElement>();

    return (
        <>

            <Typography variant="h6">
                Change number of picked files ({pickedFiles.size})
            </Typography>

            <input
                ref={inputRef}
                min={0}
                max={imageDataElementMap.size}
                type="number"
            />
            <Button
                variant="contained"
                sx={{
                    margin: "10px",
                }}
                onClick={() => {

                    if (inputRef.current !== null) {

                        const newNum = getNumber(0, inputRef.current.value, imageDataElementMap.size);

                        const currentNum = pickedFiles.size;

                        if (currentNum === newNum) {

                            // no change
                        }
                        else if (currentNum < newNum) {

                            // pick

                            const notCurrentlyPicked = new Array<string>();
                            fileOrdering.forEach(key => {

                                if (!pickedFiles.has(key) && imageDataElementMap.has(key)) {

                                    notCurrentlyPicked.push(key);
                                }
                            });

                            const adding = Math.min(newNum - currentNum, notCurrentlyPicked.length);

                            const newPickedFiles = new Map(pickedFiles);

                            for (let i = 0; i < adding; i++) {

                                const key = notCurrentlyPicked[i];

                                const value = imageDataElementMap.get(key);

                                if (value !== undefined) {

                                    newPickedFiles.set(key, value);
                                }
                            }

                            setPickedFiles(newPickedFiles);
                        }
                        else {

                            // unpick

                            const removing = currentNum - newNum;

                            const newPickedFiles = new Map(pickedFiles);

                            const fileOrderingLength = fileOrdering.length;

                            for (let i = 0; i < removing; i++) {

                                for (let j = fileOrderingLength - 1; j >= 0; j--) {

                                    const fileName = fileOrdering[j];

                                    if (newPickedFiles.has(fileName)) {

                                        newPickedFiles.delete(fileName);

                                        j = -1;
                                    }
                                }
                            }

                            setPickedFiles(newPickedFiles);
                        }
                    }
                }}
            >
                Change number of picked files (picks and unpicks arbitrarily)
            </Button>
        </>
    );
}
