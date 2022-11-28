
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
            logoRef, showLogo, logoOpacity, logoColor, belatedLogoSrc, logoSize, canvasRef, setGeneratedImageDataURL,
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

    const logoSrc = `
    data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'
    style='opacity:1; fill:%23${logoColor.substring(1)};fill-opacity:1;stroke:none;stroke-width:10;stroke-linecap:butt;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1'
    %3E%3Cg%3E%3Cpath d='m 0,50 c 8.2191767,8.21918 16.438353,16.43836 24.65753,24.65754 2.739727,-2.739727 5.479453,-5.479453 8.21918,-8.21918 -2.39726,-2.39726
    -4.79452,-4.79452 -7.19178,-7.19178 2.739727,-2.739727 5.479453,-5.479453 8.21918,-8.21918 2.39726,2.39726 4.79452,4.79452 7.19178,7.19178 C 43.835617,55.479453
    46.575343,52.739727 49.31507,50 41.09589,41.780823 32.87671,33.561647 24.65753,25.34247 16.438353,33.561647 8.2191767,41.780823 0,50 Z m 14.72603,-1.71233
    c 2.739727,-2.739727 5.479453,-5.479453 8.21918,-8.21918 1.484017,1.48402 2.968033,2.96804 4.45205,4.45206 -2.739727,2.739727 -5.479453,5.479453 -8.21918,8.21918
    -1.484017,-1.48402 -2.968033,-2.96804 -4.45205,-4.45206 z' id='Amateur' /%3E%3Cpath d='M 25.34247,24.65754 C 33.561647,32.876717 41.780823,41.095893 50,49.31507
    58.219177,41.095893 66.438353,32.876717 74.65753,24.65754 69.520547,19.520553 64.383563,14.383567 59.24658,9.24658 c -2.739727,2.739723 -5.479453,5.479447
    -8.21918,8.21917 2.39726,2.397263 4.79452,4.794527 7.19178,7.19179 C 55.479453,27.397263 52.739727,30.136987 50,32.87671 47.260273,30.136987 44.520547,27.397263
    41.78082,24.65754 47.260273,19.178087 52.739727,13.698633 58.21918,8.21918 55.479453,5.4794533 52.739727,2.7397267 50,0 41.780823,8.21918 33.561647,16.43836
    25.34247,24.65754 Z' id='Game' /%3E%3Cpath d='M 25.34247,75.34247 C 33.561647,83.561647 41.780823,91.780823 50,100 58.219177,91.780823 66.438353,83.561647
    74.65753,75.34247 69.17808,69.863017 63.69863,64.383563 58.21918,58.90411 c -5.479453,0 -10.958907,0 -16.43836,0 -5.479444,5.479451 -10.958934,10.958921
    -16.43835,16.43836 z m 16.43835,0 C 44.520547,72.602743 47.260273,69.863017 50,67.12329 c 2.739727,2.739727 5.479453,5.479453 8.21918,8.21918
    C 55.479453,78.082193 52.739727,80.821917 50,83.56164 47.260273,80.821917 44.520547,78.082193 41.78082,75.34247 Z' id='Development' /%3E%3Cpath
    d='M 50.68493,50 C 58.904107,58.21918 67.123283,66.43836 75.34246,74.65754 83.56164,66.43836 91.78082,58.21918 100,50 94.863013,44.863013 89.726027,39.726027
    84.58904,34.58904 c -2.739727,2.739727 -5.479453,5.479453 -8.21918,8.21918 2.39726,2.39726 4.79452,4.79452 7.19178,7.19178 -2.739727,2.739727 -5.479453,5.479453
    -8.21918,8.21918 C 72.602737,55.479453 69.863013,52.739727 67.12329,50 72.60274,44.520547 78.08219,39.041093 83.56164,33.56164 80.821913,30.821917
    78.082187,28.082193 75.34246,25.34247 67.123283,33.561647 58.904107,41.780823 50.68493,50 Z' id='General' /%3E%3C/g%3E%3C/svg%3E
    `;

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
