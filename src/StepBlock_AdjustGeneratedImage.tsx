
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import React from "react";
import { getLogoWithColor } from "./Logo";
import { StepBlock } from "./StepBlock";

function getCutDrawing(
    columnNum: number,
    rowNum: number,
    pWidth: number,
    pHeight: number,
    imageBlockItemWidth: number,
    imageBlockItemHeight: number,
) {

    const actualImageRatio = pHeight / pWidth;

    const imageBlockItemRatio = imageBlockItemHeight / imageBlockItemWidth;

    let sx;
    let sy;

    let sWidth;
    let sHeight;

    const dx = (columnNum - 1) * imageBlockItemWidth;
    const dy = (rowNum - 1) * imageBlockItemHeight;

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
) {

    const sx = 0;
    const sy = 0;

    const sWidth = pWidth;
    const sHeight = pHeight;

    const dx = (columnNum - 1) * imageBlockItemWidth;
    const dy = (rowNum - 1) * imageBlockItemHeight;

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
        setGeneratedImageDataURL,
    }: {
        pickedFiles: Map<string, HTMLImageElement>;
        setGeneratedImageDataURL: React.Dispatch<React.SetStateAction<string | null>>,
    }
) {

    const [pickedImageBitmaps, setPickedImageBitmaps] = React.useState<Map<string, ImageBitmap | Promise<ImageBitmap>>>(new Map());

    const canvasRef = React.createRef<HTMLCanvasElement>();

    const [canvasWidth, setCanvasWidth] = React.useState(800);
    const [canvasHeight, setCanvasHeight] = React.useState(600);

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

                    const pickedFiles = Array.from(pickedImageBitmaps.keys());

                    pickedFiles.sort();

                    let columnNum = 1;
                    let rowNum = 1;

                    for (const pickedFile of pickedFiles) {

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

                            columnNum++;

                            if (columnNum > columnCount) {

                                columnNum = 1;
                                rowNum++;
                            }

                            if (rowNum > rowCount) {

                                break;
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
            pickedFiles, pickedImageBitmaps, canvasWidth, canvasHeight, imageBlockItemWidth, imageBlockItemHeight, columnCount, rowCount, cutOrStretched,
            logoRef, showLogo, logoOpacity, logoColor, belatedLogoSrc, logoSize, canvasRef, setGeneratedImageDataURL, canvasBackgroundColor, showCanvasBackground,
        ]
    );

    const fittingDimensions = imageBlockItemWidth * columnCount * imageBlockItemHeight * rowCount === canvasWidth * canvasHeight;

    const checks = [
        {
            checkFailedShouldWarn: Array.from(pickedFiles.keys()).length > columnCount * rowCount,
            warningString: "Grid size is smaller than picked images, not all images are included. Please increase column or row count, or pick fewer images.",
        },
        {
            checkFailedShouldWarn: !fittingDimensions,
            warningString: "Canvas dimensions does not fit with column & row count and image block item size."
        }
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

                setCanvasWidth(columnCount * imageBlockItemWidth);
                setCanvasHeight(rowCount * imageBlockItemHeight);

            }}
        >
            Fit canvas size to column & row count and image block item size

        </Button>
    );

    const logoSrc = getLogoWithColor(logoColor);

    return (
        <StepBlock
            colorSwitch={true}
            stepNumber={4}
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

                <Card>

                    <Container>

                        <CanvasControlTitle
                            text="Canvas size"
                        />

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

                    </Container>

                </Card>

                <Card
                    sx={{
                        marginTop: "20px",
                    }}
                >
                    <Container>


                        <CanvasControlTitle
                            text="Image block item size (not the whole image)"
                        />

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

                    </Container>
                </Card>

                <Card
                    sx={{
                        marginTop: "20px",
                    }}
                >
                    <Container>


                        <CanvasControlTitle
                            text="Columns and rows"
                        />

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

                    </Container>
                </Card>

                <Card
                    sx={{
                        marginTop: "20px",
                    }}
                >
                    <Container>

                        <CanvasControlTitle
                            text="Image block/image source fitting method"
                        />

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
                    </Container>
                </Card>

                <Card
                    sx={{
                        marginTop: "20px"
                    }}
                >
                    <Container>

                        <CanvasControlTitle
                            text="Logo"
                        />

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

                        <Card
                            sx={{
                                marginBottom: "10px",
                                paddingBottom: "6px",
                            }}
                        >
                            <Container>

                                <FormControlLabel
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

                    </Container>

                </Card>

                <Card
                    sx={{
                        marginTop: "20px",
                    }}
                >
                    <Container>

                        <CanvasControlTitle
                            text="Canvas background"
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

                        <Card
                            sx={{
                                marginBottom: "10px",
                                paddingBottom: "6px",
                            }}
                        >
                            <Container>

                                <FormControlLabel
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

                            </Container>
                        </Card>
                    </Container>
                </Card>

                <Card
                    sx={{
                        marginTop: "20px",
                    }}
                >
                    <Container>

                        <CanvasControlTitle
                            text="Misc"
                        />

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
                    </Container>
                </Card>

                <Card
                    sx={{
                        marginTop: "20px",

                        height: "200px",
                        maxHeight: "200px",
                        overflowY: "scroll",
                    }}
                >
                    <Container>

                        <CanvasControlTitle
                            text="Warnings"
                        />

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
                    </Container>
                </Card>
            </Container>
        </StepBlock>
    );
}

function CanvasControlTitle(
    { text }: { text: string }
) {

    return (
        <Typography variant="h6">
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
