
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Container from "@mui/system/Container";
import React from "react";
import { lastDrawnCountSingleton } from "./LastDrawnCountSingleton";
import { StepBlock } from "./StepBlock";

export function StepBlock_GenerateImage(
    {
        stepNumber,
        canvasElement,
    }: {
        stepNumber: number,
        canvasElement: HTMLCanvasElement | null,
    }
) {

    const aRef = React.useRef<HTMLAnchorElement>(null);

    const [outputFileName, setOutputFileName] = React.useState("collage.png");

    const [generatedImageDataURL, setGeneratedImageDataURL] = React.useState<string | null>(null);

    const [imageGeneratedCount, setImageGeneratedCount] = React.useState<number | null>(null);

    const [fileSizeInBytes, setFileSizeInBytes] = React.useState<number | null>(null);

    React.useEffect(
        () => {

            if (aRef.current !== null) {

                if (generatedImageDataURL !== null) {

                    const a = aRef.current;

                    a.href = generatedImageDataURL;
                }
            }
        },
        [aRef, generatedImageDataURL]
    );

    const [lastDrawnCount, setLastDrawnCount] = React.useState<number | null>(null);

    React.useEffect(
        () => {

            const listener = (newCount: number) => {

                setLastDrawnCount(newCount);
            };

            lastDrawnCountSingleton.addListener(listener);

            return () => {

                lastDrawnCountSingleton.removeListener(listener);
            };
        },
        []
    )

    return (
        <StepBlock
            stepNumber={stepNumber}
            stepTitle="Generate image"
        >

            <Container>

                <Card
                    sx={{
                        padding: "6px",
                    }}
                >

                    <Container
                        sx={{
                            minHeight: "140px",
                        }}
                    >

                        <Typography variant="h6">

                            Generate image

                        </Typography>

                        <Button
                            variant="contained"
                            sx={{
                                marginBottom: "10px",
                            }}
                            disabled={imageGeneratedCount !== null && lastDrawnCount !== null && imageGeneratedCount === lastDrawnCount}
                            onClick={() => {

                                if (canvasElement !== null) {

                                    const aGeneratedImageDataURL = canvasElement.toDataURL("image/png");

                                    setGeneratedImageDataURL(aGeneratedImageDataURL);

                                    setFileSizeInBytes(window.atob(aGeneratedImageDataURL.split(",")[1]).length);

                                    setImageGeneratedCount(lastDrawnCount);
                                }
                            }}
                        >

                            Generate image

                        </Button>

                        {
                            imageGeneratedCount !== null && lastDrawnCount !== null && imageGeneratedCount !== lastDrawnCount
                                ?
                                    <Alert
                                        severity="warning"
                                    >
                                        The generated image is not the latest drawn image, please generate it again.
                                    </Alert>
                                : <></>

                        }

                    </Container>

                </Card>

                <Card
                    sx={{
                        padding: "6px",
                        marginTop: "10px",
                    }}
                >
                    <Container
                        sx={{
                            minHeight: "110px",
                        }}
                    >

                        <Typography variant="h6">

                            Check final collage image file size

                        </Typography>

                        {
                            fileSizeInBytes === null
                                ?
                                <></>
                                : (
                                    fileSizeInBytes > 3_990_000
                                        ?
                                        <Alert severity="warning"
                                            sx={{
                                                marginBottom: "6px",
                                            }}
                                        >
                                            {`Output file image size is approximately ${fileSizeInBytes / 1_000_000} MB, and the file upload limit size may be 4 MB.`}
                                        </Alert>
                                        :
                                        <Typography>
                                            File size is approximately {fileSizeInBytes / 1_000_000} MB.
                                        </Typography>
                                )
                        }

                    </Container>
                </Card>

                <Card
                    sx={{
                        padding: "6px",
                        marginTop: "10px",
                    }}
                >
                    <Container>

                        <Typography variant="h6">

                            Save generated collage image

                        </Typography>


                        <TextField
                            variant="standard"
                            defaultValue={outputFileName}
                            onChange={(event) => {

                                setOutputFileName(event.target.value);
                            }}
                        />

                        {
                            generatedImageDataURL === null || imageGeneratedCount === null || lastDrawnCount === null || imageGeneratedCount !== lastDrawnCount
                                ?
                                    <></>
                                :
                                    <a
                                        ref={aRef}
                                        download={outputFileName}
                                        style={{
                                            marginLeft: "10px",
                                        }}
                                    >
                                        Save generated image.
                                    </a>
                        }

                    </Container>
                </Card>

            </Container>
        </StepBlock>
    );
}
