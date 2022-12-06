

import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import grey from "@mui/material/colors/grey";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Slider from "@mui/material/Slider";
import createTheme from "@mui/material/styles/createTheme";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/system";
import React from "react";
import { getLogoWithColor } from "./Logo";
import { StepBlock } from "./StepBlock";
import Popper from "@mui/material/Popper";

const darkPaperTheme = createTheme({

    palette: {
        background: {
            paper: grey[400],
        }
    }
});

const normalTheme = createTheme({});

function getAvailableBlocks(
    columnCount: number,
    rowCount: number,
    canvasGridCutColumnStart: number,
    canvasGridCutColumnEnd: number,
    canvasGridCutRowStart: number,
    canvasGridCutRowEnd: number,
    doCanvasGridCut: boolean,
) {

    if (doCanvasGridCut) {

        // simplest to just simulate a grid

        const grid = new Array(columnCount*rowCount);

        grid.fill(1);

        for (let c = canvasGridCutColumnStart; c <= canvasGridCutColumnEnd; c++) {

            for (let r = canvasGridCutRowStart; r <= canvasGridCutRowEnd; r++) {

                if (r <= rowCount && c <= columnCount) {

                    const index = (c - 1) + (r - 1)*columnCount;

                    if (index < grid.length) {

                        grid[index] = 0;
                    }
                }
            }
        }

        return grid.reduceRight((prev, now) => prev + now);
    }
    else {

        return columnCount*rowCount;
    }
}

function getCutDrawing(
    columnNum: number,
    rowNum: number,
    pWidth: number,
    pHeight: number,
    imageBlockItemWidth: number,
    imageBlockItemHeight: number,
    doCanvasGap: boolean,
    canvasGapSize: number,
) {

    const actualImageRatio = pHeight / pWidth;

    const imageBlockItemRatio = imageBlockItemHeight / imageBlockItemWidth;

    let sx;
    let sy;

    let sWidth;
    let sHeight;

    const dx = (columnNum - 1) * imageBlockItemWidth + (doCanvasGap ? (columnNum - 1)*canvasGapSize : 0);
    const dy = (rowNum - 1) * imageBlockItemHeight + (doCanvasGap ? (rowNum - 1)*canvasGapSize : 0);

    const dWidth = imageBlockItemWidth;
    const dHeight = imageBlockItemHeight;

    const scx = pWidth / 2;
    const scy = pHeight / 2;

    if (actualImageRatio > imageBlockItemRatio) {

        sx = 0;
        sy = Math.round(scy - imageBlockItemRatio * pWidth / 2);

        sWidth = pWidth;
        sHeight = Math.round(imageBlockItemRatio * pWidth);
    }
    else {

        sx = Math.round(scx - (pHeight / 2) / imageBlockItemRatio);
        sy = 0;

        sWidth = Math.round(pHeight / imageBlockItemRatio);
        sHeight = pHeight;
    }

    return [
        sx,
        sy,
        sWidth,
        sHeight,
        dx,
        dy,
        dWidth,
        dHeight,
    ];
}

function getStretchedDrawing(
    columnNum: number,
    rowNum: number,
    pWidth: number,
    pHeight: number,
    imageBlockItemWidth: number,
    imageBlockItemHeight: number,
    doCanvasGap: boolean,
    canvasGapSize: number,
) {

    const sx = 0;
    const sy = 0;

    const sWidth = pWidth;
    const sHeight = pHeight;

    const dx = (columnNum - 1) * imageBlockItemWidth + (doCanvasGap ? (columnNum - 1)*canvasGapSize : 0);
    const dy = (rowNum - 1) * imageBlockItemHeight + (doCanvasGap ? (rowNum - 1)*canvasGapSize : 0);

    const dWidth = imageBlockItemWidth;
    const dHeight = imageBlockItemHeight;

    return [
        sx,
        sy,
        sWidth,
        sHeight,
        dx,
        dy,
        dWidth,
        dHeight,
    ];
}

export function StepBlock_AdjustGeneratedImage(
    {
        pickedFiles,
        fileOrdering,
        setGeneratedImageDataURL,
    }: {
        pickedFiles: Map<string, HTMLImageElement>;
        fileOrdering: Array<string>,
        setGeneratedImageDataURL: React.Dispatch<React.SetStateAction<string | null>>,
    }
) {

    const [pickedImageBitmaps, setPickedImageBitmaps] = React.useState<Map<string, ImageBitmap | Promise<ImageBitmap>>>(new Map());

    const canvasRef = React.createRef<HTMLCanvasElement>();

    const [imageBlockItemWidth, setImageBlockItemWidth] = React.useState(256);
    const [imageBlockItemHeight, setImageBlockItemHeight] = React.useState(256);

    const [columnCount, setColumnCount] = React.useState(4);
    const [rowCount, setRowCount] = React.useState(4);

    const [cutOrStretched, setCutOrStretched] = React.useState(0);

    const logoRef = React.useRef<HTMLImageElement>(null);

    const [showLogo, setShowLogo] = React.useState(true);

    const [logoOpacity, setLogoOpacity] = React.useState(1.0);

    const [logoColor, setLogoColor] = React.useState("#000000");

    const [belatedLogoSrc, setBelatedLogoSrc] = React.useState("");

    const [logoSize, setLogoSize] = React.useState(1);

    const [canvasBackgroundColor, setCanvasBackgroundColor] = React.useState("#aaaaaa");

    const [showCanvasBackground, setShowCanvasBackground] = React.useState(true);

    const [canvasGridCutColumnStart, setCanvasGridCutColumnStart] = React.useState(2);

    const [canvasGridCutRowStart, setCanvasGridCutRowStart] = React.useState(2);

    const [canvasGridCutColumnWidth, setCanvasGridCutColumnWidth] = React.useState(1);

    const canvasGridCutColumnEnd = canvasGridCutColumnStart + canvasGridCutColumnWidth - 1;

    const [canvasGridCutRowHeight, setCanvasGridCutRowHeight] = React.useState(1);

    const canvasGridCutRowEnd = canvasGridCutRowStart + canvasGridCutRowHeight - 1;

    const [doCanvasGridCut, setDoCanvasGridCut] = React.useState(false);

    const [doCanvasGap, setDoCanvasGap] = React.useState(true);

    const [canvasGapSize, setCanvasGapSize] = React.useState(2);



    const fittingDimensionX = (imageBlockItemWidth * columnCount + (doCanvasGap ? canvasGapSize*(columnCount - 1) : 0));
    const fittingDimensionY = (imageBlockItemHeight * rowCount + (doCanvasGap ? canvasGapSize*(rowCount - 1) : 0));

    const [canvasWidth, setCanvasWidth] = React.useState(fittingDimensionX);
    const [canvasHeight, setCanvasHeight] = React.useState(fittingDimensionY);

    const fittingDimensions =
        fittingDimensionX*fittingDimensionY === canvasWidth * canvasHeight;

    React.useEffect(
        () => {


            const fileNames = Array.from(pickedFiles.keys());

            for (let fileName of fileNames) {

                const htmlElement = pickedFiles.get(fileName);

                if (htmlElement !== undefined) {

                    const existingPickedImageBitmap = pickedImageBitmaps.get(fileName);

                    if (existingPickedImageBitmap === undefined) {

                        const newPickedImageBitmap = createImageBitmap(htmlElement);

                        newPickedImageBitmap.then((bitmap) => {

                            setPickedImageBitmaps(oldM => {

                                const newM = new Map(oldM);

                                newM.set(fileName, bitmap);

                                return newM;
                            });
                        });
                    }
                }
            }
        },
        [pickedFiles, pickedImageBitmaps]
    );

    React.useEffect(
        () => {

            const pickedImageBitmapsArrays = Array.from(pickedImageBitmaps);

            for (const [fileName, ] of pickedImageBitmapsArrays) {

                if (!pickedFiles.has(fileName)) {

                    setPickedImageBitmaps((oldM) => {

                        const newM = new Map(oldM);

                        newM.delete(fileName);

                        return newM;
                    });
                }
            }
        },
        [pickedFiles, pickedImageBitmaps]
    );

    React.useEffect(
        () => {

            if (canvasRef.current !== null) {

                const canvas = canvasRef.current;

                const ctx = canvas.getContext('2d');

                if (ctx !== null) {

                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                    if (showCanvasBackground) {
                        ctx.save();

                        ctx.fillStyle = canvasBackgroundColor;
                        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                        ctx.restore();
                    }

                    let pickedFileIndex = 0;

                    for (let rowNum = 1; rowNum <= rowCount; rowNum++) {

                        for (let columnNum = 1; columnNum <= columnCount; columnNum++) {

                            let shouldCutOutOfGrid =
                                doCanvasGridCut &&
                                (canvasGridCutColumnStart <= columnNum && columnNum <= canvasGridCutColumnEnd) &&
                                (canvasGridCutRowStart <= rowNum && rowNum <= canvasGridCutRowEnd);

                            if (!shouldCutOutOfGrid) {

                                while (pickedFileIndex < fileOrdering.length && pickedImageBitmaps.get(fileOrdering[pickedFileIndex]) === undefined) {

                                    pickedFileIndex++;
                                }

                                const pickedFile = fileOrdering[pickedFileIndex];

                                const pickedImageBitmap = pickedImageBitmaps.get(pickedFile);

                                if (pickedImageBitmap instanceof ImageBitmap) {

                                    const p = pickedImageBitmap;

                                    const methodToUse = cutOrStretched === 0
                                        ? getCutDrawing
                                        : getStretchedDrawing;

                                    const [
                                        sx,
                                        sy,
                                        sWidth,
                                        sHeight,
                                        dx,
                                        dy,
                                        dWidth,
                                        dHeight,
                                    ] = methodToUse(
                                        columnNum,
                                        rowNum,
                                        p.width,
                                        p.height,
                                        imageBlockItemWidth,
                                        imageBlockItemHeight,
                                        doCanvasGap,
                                        canvasGapSize,
                                    );

                                    ctx.drawImage(
                                        p,
                                        sx,
                                        sy,
                                        sWidth,
                                        sHeight,
                                        dx,
                                        dy,
                                        dWidth,
                                        dHeight
                                    );
                                }

                                pickedFileIndex++;
                            }
                        }
                    }

                    if (logoRef.current !== null && showLogo) {

                        const logo = logoRef.current;

                        ctx.globalAlpha = logoOpacity;
                        ctx.translate(Math.round(canvasWidth/2), Math.round(canvasHeight/2));
                        ctx.scale(logoSize, logoSize);

                        ctx.drawImage(
                            logo,
                            Math.round(-logo.naturalWidth/2),
                            Math.round(-logo.naturalHeight/2),
                        );

                        ctx.globalAlpha = 1;
                        // reset scale
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                    }


                    const image = canvas.toDataURL("image/png");

                    setGeneratedImageDataURL(image);
                }

            }
        },
        [
            pickedImageBitmaps, canvasWidth, canvasHeight, imageBlockItemWidth, imageBlockItemHeight, columnCount, rowCount, cutOrStretched,
            logoRef, showLogo, logoOpacity, logoColor, belatedLogoSrc, logoSize, canvasRef, setGeneratedImageDataURL, canvasBackgroundColor, showCanvasBackground,
            canvasGridCutColumnStart, canvasGridCutColumnEnd, canvasGridCutRowStart, canvasGridCutRowEnd, doCanvasGridCut,
            doCanvasGap, canvasGapSize, fileOrdering,
        ]
    );

    const pickedFilesCount = pickedFiles.size;

    const availableBlocks = getAvailableBlocks(columnCount, rowCount, canvasGridCutColumnStart, canvasGridCutColumnEnd, canvasGridCutRowStart, canvasGridCutRowEnd, doCanvasGridCut);

    const insufficientBlocks = pickedFilesCount > availableBlocks;

    const checks = [
        {
            checkFailedShouldWarn: insufficientBlocks,
            warningString:
                `
                Grid size is smaller than picked images, not all images are included.
                Please increase column or row count, or pick fewer images. Picked files/grid cells: ${pickedFilesCount}/${availableBlocks}.
                `,
        },
        {
            checkFailedShouldWarn: !fittingDimensions,
            warningString: "Canvas dimensions does not fit with column & row count and image block item size."
        },
    ] as const;

    const warnings = checks.flatMap(check => {

        if (check.checkFailedShouldWarn) {

            return [check.warningString];
        }
        else {

            return [];
        }
    });

    const fitCanvasSizeButton = (
        <Button
            variant="contained"
            sx={{
                marginBottom: "10px",
            }}
            disabled={fittingDimensions}
            onClick={() => {

                setCanvasWidth(fittingDimensionX);
                setCanvasHeight(fittingDimensionY);

            }}
        >
            Fit canvas size to column & row count and image block item size (new size: {fittingDimensionX}x{fittingDimensionY})

        </Button>
    );

    const attemptedFitForColumnsRowsAndCut = (() => {

        for (let i = 3; i <= 20; i++) {

            const fits: Array<{
                cutColumnStart: number,
                cutColumnWidth: number,
                cutRowStart: number,
                cutRowHeight: number,
                columnCount: number,
                rowCount: number,
            }> = [];

            {
                const uncutAvailableBlocks = i*i;

                const cutLength = i % 2 === 0 ? 2 : 1;

                const cutAvailableBlocks = uncutAvailableBlocks - cutLength*cutLength;

                if (cutAvailableBlocks >= pickedFilesCount) {

                    const cutColumnRowStart = Math.ceil(i/2);

                    const firstFit = {
                        cutColumnStart: cutColumnRowStart,
                        cutColumnWidth: cutLength,
                        cutRowStart: cutColumnRowStart,
                        cutRowHeight: cutLength,
                        columnCount: i,
                        rowCount: i,
                    } as const;

                    fits.push(firstFit);
                }
            }

            {
                // try to see if we can cut off one row and still fit

                const c = i;

                const r = i - 1;

                const uncutAvailableBlocks = c*r;

                const cutColumnWidth = c % 2 === 0 ? 2 : 1;
                const cutRowHeight = r % 2 === 0 ? 2 : 1;

                const cutAvailableBlocks = uncutAvailableBlocks - cutColumnWidth*cutRowHeight;

                if (cutAvailableBlocks >= pickedFilesCount) {

                    const firstFit = {
                        cutColumnStart:  Math.ceil(c/2),
                        cutColumnWidth,
                        cutRowStart:  Math.ceil(r/2),
                        cutRowHeight,
                        columnCount: c,
                        rowCount: r,
                    } as const;

                    fits.push(firstFit);
                }
            }

            if (fits.length > 0) {

                return fits[fits.length - 1];
            }
        }

        return null;

    })();

    const attemptFitColumnsRowsAndCutButton = (
        <Button
            variant="contained"
            sx={{
                marginBottom: "10px",
            }}
            disabled={
                attemptedFitForColumnsRowsAndCut === null ||
                (() => {

                    const {
                        cutColumnStart,
                        cutColumnWidth,
                        cutRowStart,
                        cutRowHeight,
                    } = attemptedFitForColumnsRowsAndCut;

                    return (
                        attemptedFitForColumnsRowsAndCut.columnCount === columnCount &&
                        attemptedFitForColumnsRowsAndCut.rowCount === rowCount &&
                        cutColumnStart === canvasGridCutColumnStart &&
                        cutColumnWidth === canvasGridCutColumnWidth &&
                        cutRowStart === canvasGridCutRowStart &&
                        cutRowHeight === canvasGridCutRowHeight &&
                        doCanvasGridCut
                    );
                })()
            }
            onClick={() => {

                if (attemptedFitForColumnsRowsAndCut !== null) {

                    const {
                        cutColumnStart,
                        cutColumnWidth,
                        cutRowStart,
                        cutRowHeight,
                    } = attemptedFitForColumnsRowsAndCut;

                    setColumnCount(attemptedFitForColumnsRowsAndCut.columnCount);
                    setRowCount(attemptedFitForColumnsRowsAndCut.rowCount);

                    setCanvasGridCutColumnStart(cutColumnStart);
                    setCanvasGridCutColumnWidth(cutColumnWidth);

                    setCanvasGridCutRowStart(cutRowStart);
                    setCanvasGridCutRowHeight(cutRowHeight);

                    setDoCanvasGridCut(true);
                }
            }}
        >
            {
                (() => {

                    const innerText =
                        attemptedFitForColumnsRowsAndCut === null
                            ? ""
                            : `new grid size: ${attemptedFitForColumnsRowsAndCut.columnCount}x${attemptedFitForColumnsRowsAndCut.rowCount}`


                    return `Set column & row count and cutout to include all images (${innerText})`;
                })()
            }

        </Button>
    );

    const columnRowCutAttempt_notPresentOrNeeded = !insufficientBlocks || attemptedFitForColumnsRowsAndCut === null;

    const logoSrc = getLogoWithColor(logoColor);

    const belowCanvasElementRef = React.useRef<HTMLDivElement>(null);

    const [canvasElementAnchor, setCanvasElementAnchor] = React.useState<HTMLDivElement | null>(null);

    React.useEffect(
        () => {

            setCanvasElementAnchor(belowCanvasElementRef.current);
        }
    );

    return (
        <StepBlock
            stepNumber={5}
            stepTitle="Adjust generation"
        >
            <Typography>
                Preview the generated image and adjust it (preview may be stretched and blurrier than saved image).
            </Typography>
            <Container
                sx={{
                    maxWidth: 800,
                }}
            >
                <canvas
                    style={{
                        border: "2px solid black",
                        width: "100%",
                        maxHeight: "800px",
                    }}
                    width={canvasWidth}
                    height={canvasHeight}
                    ref={canvasRef}
                />

                <Box
                    ref={belowCanvasElementRef}
                >
                </Box>

                <Popper
                    open={warnings.length !== 0}
                    anchorEl={canvasElementAnchor}
                    sx={{
                        visibility: canvasElementAnchor !== null ? "visible" : "hidden",
                        opacity: 0.95,
                    }}
                    placement="top"
                    modifiers={[
                        {
                            name: 'flip',
                            enabled: false,
                        },
                    ]}
                >
                    <Warnings
                        warnings={warnings}
                        fittingDimensions={fittingDimensions}
                        fitCanvasSizeButton={fitCanvasSizeButton}
                        columnRowCutAttempt_notPresentOrNeeded={columnRowCutAttempt_notPresentOrNeeded}
                        attemptFitColumnsRowsAndCutButton={attemptFitColumnsRowsAndCutButton}
                    />
                </Popper>

                <MainCard
                    title={`Canvas size (${canvasWidth}x${canvasHeight})`}
                    collapsible={true}
                    defaultCollapsed={true}
                >

                    <CanvasDimensionControl
                        canvasDimension={canvasWidth}
                        canvasDimensionDescription="Width"
                        onUpdateDimension={setCanvasWidth}
                    />

                    <CanvasDimensionControl
                        canvasDimension={canvasHeight}
                        canvasDimensionDescription="Height"
                        onUpdateDimension={setCanvasHeight}
                    />

                    {
                        fitCanvasSizeButton
                    }


                </MainCard>

                <MainCard
                    title={`Columns and rows (${columnCount}x${rowCount})`}
                    collapsible={true}
                >

                    <DimensionControl
                        theDimension={columnCount}
                        theDimensionDescription="Column count"
                        min={1}
                        max={50}
                        onUpdateDimension={setColumnCount}
                    />

                    <DimensionControl
                        theDimension={rowCount}
                        theDimensionDescription="Row count"
                        min={1}
                        max={50}
                        onUpdateDimension={setRowCount}
                    />

                    {
                        fitCanvasSizeButton
                    }

                    {
                        attemptFitColumnsRowsAndCutButton
                    }

                </MainCard>


                <MainCard
                    title="Logo"
                    collapsible={true}
                    switchedOnTheme={showLogo}
                >
                    <img
                        ref={logoRef}
                        style={{
                            visibility: "hidden",
                            display: "none",
                        }}
                        src={logoSrc}
                        onLoad={() => {

                            setBelatedLogoSrc(logoSrc);
                        }}
                    >
                    </img>


                    <FormControlLabel
                        sx={{
                            marginTop: "6px",
                            marginBottom: "14px",
                        }}
                        label="Show logo"
                        control={
                            <Switch
                                checked={showLogo}
                                onChange={(event) => {

                                    setShowLogo(event.target.checked)
                                }}
                            />
                        }
                    />

                    <Card
                        sx={{
                            marginBottom: "10px",
                            paddingBottom: "6px",
                        }}
                    >
                        <Container>

                            <Typography>

                                Logo opacity: {logoOpacity}

                            </Typography>

                            <Slider
                                min={0}
                                max={1}
                                step={0.01}
                                value={logoOpacity}
                                onChange={(event) => {

                                    const value = (event.target as any).value;

                                    if (value !== undefined && value !== null) {

                                        setLogoOpacity(value);
                                    }
                                }}
                            />

                        </Container>

                    </Card>

                    <Card
                        sx={{
                            marginBottom: "10px",
                            paddingBottom: "6px",
                        }}
                    >
                        <Container>

                            <Typography>

                                Logo color: {logoColor}

                            </Typography>

                            <input
                                type="color"
                                value={logoColor}
                                onChange={(event) => {

                                    setLogoColor(event.target.value);
                                }}
                            />

                        </Container>

                    </Card>

                    <Card
                        sx={{
                            marginBottom: "10px",
                            paddingBottom: "6px",
                        }}
                    >
                        <Container>

                            <Typography>

                                Logo size: {logoSize}

                            </Typography>

                            <Slider
                                min={0.1}
                                max={20}
                                step={0.1}
                                value={logoSize}
                                onChange={(event) => {

                                    const value = (event.target as any).value;

                                    if (value !== undefined && value !== null) {

                                        setLogoSize(value);
                                    }
                                }}
                            />

                        </Container>

                    </Card>

                </MainCard>

                <MainCard
                    title="Canvas background"
                    collapsible={true}
                    switchedOnTheme={showCanvasBackground}
                >

                    <FormControlLabel
                        sx={{
                            marginTop: "6px",
                            marginBottom: "14px",
                        }}
                        label="Draw canvas background color"
                        control={
                            <Switch
                                checked={showCanvasBackground}
                                onChange={(event) => {

                                    setShowCanvasBackground(event.target.checked)
                                }}
                            />
                        }
                    />

                    <Card
                        sx={{
                            marginBottom: "10px",
                            paddingBottom: "6px",
                        }}
                    >
                        <Container>

                            <Typography>
                                Color: {canvasBackgroundColor}
                            </Typography>

                            <input
                                type="color"
                                value={canvasBackgroundColor}
                                onChange={(event) => {

                                    setCanvasBackgroundColor(event.target.value);
                                }}
                            />

                        </Container>
                    </Card>
                </MainCard>


                <MainCard
                    title="Canvas grid cutout"
                    collapsible={true}
                    switchedOnTheme={doCanvasGridCut}
                >
                    <FormControlLabel
                        sx={{
                            marginTop: "6px",
                            marginBottom: "14px",
                        }}
                        label="Cut out part of canvas grid"
                        control={
                            <Switch
                                checked={doCanvasGridCut}
                                onChange={(event) => {

                                    setDoCanvasGridCut(event.target.checked)
                                }}
                            />
                        }
                    />

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                            }}
                        >

                            <DimensionControl
                                theDimension={canvasGridCutColumnStart}
                                theDimensionDescription="Column start"
                                min={1}
                                max={50}
                                onUpdateDimension={setCanvasGridCutColumnStart}
                            />

                            <DimensionControl
                                theDimension={canvasGridCutColumnWidth}
                                theDimensionDescription="Width"
                                min={1}
                                max={50}
                                onUpdateDimension={setCanvasGridCutColumnWidth}
                            />

                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                                marginLeft: "16px",
                            }}
                        >

                            <DimensionControl
                                theDimension={canvasGridCutRowStart}
                                theDimensionDescription="Row start"
                                min={1}
                                max={50}
                                onUpdateDimension={setCanvasGridCutRowStart}
                            />

                            <DimensionControl
                                theDimension={canvasGridCutRowHeight}
                                theDimensionDescription="Height"
                                min={1}
                                max={50}
                                onUpdateDimension={setCanvasGridCutRowHeight}
                            />

                        </Box>

                    </Box>

                    {
                        attemptFitColumnsRowsAndCutButton
                    }
                </MainCard>

                <MainCard
                    title="Canvas gap"
                    collapsible={true}
                    switchedOnTheme={doCanvasGap}
                >

                    <FormControlLabel
                        sx={{
                            marginTop: "6px",
                            marginBottom: "14px",
                        }}
                        label="Have gaps between image block items"
                        control={
                            <Switch
                                checked={doCanvasGap}
                                onChange={(event) => {

                                    setDoCanvasGap(event.target.checked)
                                }}
                            />
                        }
                    />

                    <DimensionControl
                        theDimension={canvasGapSize}
                        theDimensionDescription="Gap size"
                        min={1}
                        max={20}
                        onUpdateDimension={setCanvasGapSize}
                    />
                </MainCard>

                <MainCard
                    title="Image block/image source fitting method"
                    collapsible={true}
                    defaultCollapsed={true}
                >
                    <Card
                        sx={{
                            marginBottom: "10px",
                            paddingBottom: "6px",
                        }}
                    >
                        <Container>

                            <RadioGroup
                                value={cutOrStretched}
                                onChange={(event) => {


                                    const value = event.target.value;

                                    let num = Number.parseInt(value);

                                    if (Number.isNaN(num)) {

                                        num = 0;
                                    }

                                    setCutOrStretched(clamp(0, num, 1));
                                }}
                            >
                                <FormControlLabel value={0} control={<Radio />} label="Cut (preserves aspect ratio, but may cut part of the image)"></FormControlLabel>
                                <FormControlLabel value={1} control={<Radio />} label="Stretched (may change aspect ratio)"></FormControlLabel>
                            </RadioGroup>

                        </Container>
                    </Card>
                </MainCard>

                <MainCard
                    title="Image block item size (not the whole image)"
                    collapsible={true}
                    defaultCollapsed={true}
                >

                    <DimensionControl
                        theDimension={imageBlockItemWidth}
                        theDimensionDescription="Width"
                        min={10}
                        max={1000}
                        onUpdateDimension={setImageBlockItemWidth}
                    />

                    <DimensionControl
                        theDimension={imageBlockItemHeight}
                        theDimensionDescription="Height"
                        min={10}
                        max={1000}
                        onUpdateDimension={setImageBlockItemHeight}
                    />

                    {
                        fitCanvasSizeButton
                    }
                </MainCard>

                <MainCard
                    title="Misc"
                    collapsible={false}
                    switchedOnTheme={true}
                >

                    <Card
                        sx={{
                            marginBottom: "10px",
                            paddingBottom: "6px",
                        }}
                    >
                        <Container>

                            <Typography>
                                Number of picked images: {Array.from(pickedFiles.keys()).length}
                            </Typography>

                        </Container>
                    </Card>
                </MainCard>

                <Warnings
                    warnings={warnings}
                    fittingDimensions={fittingDimensions}
                    fitCanvasSizeButton={fitCanvasSizeButton}
                    columnRowCutAttempt_notPresentOrNeeded={columnRowCutAttempt_notPresentOrNeeded}
                    attemptFitColumnsRowsAndCutButton={attemptFitColumnsRowsAndCutButton}
                />
            </Container>
        </StepBlock>
    );
}

function CanvasControlTitle(
    { text }: { text: string }
) {

    return (
        <Typography
            variant="h6"
            sx={{
                userSelect: "none",
            }}
        >
            {text}
        </Typography>
    );
}

function CanvasDimensionControl(
    {
        canvasDimension,
        canvasDimensionDescription,
        onUpdateDimension,
    }: {
        canvasDimension: number,
        canvasDimensionDescription: string,
        onUpdateDimension: (newValue: number) => void,
    }
) {

    const inputRef = React.createRef<HTMLInputElement>();

    const min = 50;

    const max = 10000;

    return (
        <Card
            sx={{
                marginBottom: "10px",
                paddingBottom: "6px",
            }}
        >

            <Container>
                <Typography>
                    {canvasDimensionDescription}: {canvasDimension}
                </Typography>
                <input
                    ref={inputRef}
                    min={min}
                    max={max}
                    type="number"
                />
                <Button
                    variant="contained"
                    sx={{
                        marginLeft: "10px",
                    }}
                    onClick={() => {

                        if (inputRef.current !== null) {

                            onUpdateDimension(getNumber(min, inputRef.current.value, max));
                        }
                    }}
                >
                    Change canvas {canvasDimensionDescription.toLowerCase()}
                </Button>
            </Container>

        </Card>
    );
}

function DimensionControl(
    {
        theDimension,
        theDimensionDescription,
        min,
        max,
        onUpdateDimension,
    }: {
        theDimension: number,
        theDimensionDescription: string,
        min: number,
        max: number,
        onUpdateDimension: (newValue: number) => void,
    }
) {

    const inputRef = React.createRef<HTMLInputElement>();

    React.useEffect(
        () => {

            if (inputRef.current !== null) {

                const input = inputRef.current;

                const number = getNumber(min, input.value, max);

                if (number !== theDimension) {

                    input.value = "" + theDimension;
                }
            }
        },
        [inputRef, theDimension, min, max]
    );

    return (
        <Card
            sx={{
                marginBottom: "10px",
                paddingBottom: "6px",
            }}
        >

            <Container>

                <Typography>
                    {theDimensionDescription}: {theDimension}
                </Typography>

                <Slider
                    min={min}
                    max={max}
                    value={theDimension}
                    onChange={(event) => {

                        const value = (event.target as any).value;

                        if (value !== undefined && value !== null) {

                            onUpdateDimension(value);
                        }
                    }}
                />

                <input
                    ref={inputRef}
                    min={min}
                    max={max}
                    type="number"
                    onChange={(event) => {

                        onUpdateDimension(getNumber(min, event.target.value, max));
                    }}
                />

            </Container>

        </Card>
    );
}

function getNumber(min: number, value: string, max: number) {

    let valueNum = Number.parseInt(value);

    if (Number.isNaN(valueNum)) {
        valueNum = min;
    }

    return clamp(min, valueNum, max);
}

function clamp(min: number, value: number, max: number) {

    return Math.max(min, Math.min(value, max));
}

function MainCard(
    {
        title,
        collapsible,
        defaultCollapsed = false,
        children,
        switchedOnTheme = true,
    }: {
        title: string,
        collapsible: boolean,
        defaultCollapsed?: boolean,
        switchedOnTheme?: boolean,
    } & React.PropsWithChildren
) {

    const [collapseMainCard, setCollapseMainCard] = React.useState(defaultCollapsed);

    const aTitle = (
        <CanvasControlTitle
            text={title}
        />
    );

    return (

        <ThemeProvider
            theme={switchedOnTheme ? normalTheme : darkPaperTheme}
        >
            <Card
                sx={{
                    marginTop: "20px",
                }}
            >

                <Container>

                    {
                        collapsible
                            ?
                                <Button
                                    sx={{
                                        justifyContent: "space-between",
                                        flex: "1",
                                        width: "100%",
                                        textTransform: "none",
                                    }}
                                    onClick={() => {

                                        setCollapseMainCard(previous => !previous);
                                    }}
                                >
                                    {
                                        aTitle
                                    }
                                    {
                                        collapseMainCard
                                            ? <ExpandMore/>
                                            : <ExpandLess/>
                                    }
                                </Button>
                            : aTitle
                    }

                    <Collapse
                        in={!collapseMainCard || !collapsible}
                    >

                        {
                            children
                        }

                    </Collapse>
                </Container>

            </Card>

        </ThemeProvider>
    );
}

function Warnings(
    {
        warnings,
        fittingDimensions,
        fitCanvasSizeButton,
        columnRowCutAttempt_notPresentOrNeeded,
        attemptFitColumnsRowsAndCutButton,
    }: {
        warnings: Array<string>,
        fittingDimensions: boolean,
        fitCanvasSizeButton: JSX.Element,
        columnRowCutAttempt_notPresentOrNeeded: boolean,
        attemptFitColumnsRowsAndCutButton: JSX.Element,
    }
) {

    return (
        <MainCard
            title="Warnings"
            collapsible={false}
            switchedOnTheme={true}
        >
            <Box
                sx={{
                    overflowY: "scroll",
                    width: "400px",
                    maxWidth: "400px",
                }}
            >

                {
                    warnings.length > 0
                        ?
                        warnings.map(warning => {

                            return (
                                <Alert key={warning} severity="warning"
                                    sx={{
                                        marginBottom: "6px",
                                    }}
                                >
                                    {warning}
                                </Alert>
                            )
                        })
                        : <></>
                }

                {
                    fittingDimensions
                        ? <></>
                        : fitCanvasSizeButton
                }

                {
                    columnRowCutAttempt_notPresentOrNeeded
                        ? <></>
                        : attemptFitColumnsRowsAndCutButton
                }

            </Box>
        </MainCard>
    );
}
