
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Container from "@mui/system/Container";
import React from "react";
import { StepBlock } from "./StepBlock";

export function StepBlock_GenerateImage(
    {
        canvasElement,
    }: {
        canvasElement: HTMLCanvasElement | null,
    }
) {

    const aRef = React.useRef<HTMLAnchorElement>(null);

    const [outputFileName, setOutputFileName] = React.useState("collage.png");

    const [generatedImageDataURL, setGeneratedImageDataURL] = React.useState<string | null>(null);

    const [timestamp, setTimestamp] = React.useState<Date | null>(null);

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

    return (
        <StepBlock
            stepNumber={6}
            stepTitle="Generate image"
        >

            <Container>

                <Card
                    sx={{
                        padding: "6px",
                    }}
                >

                    <Container>

                        <Typography variant="h6">

                            Generate image

                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() => {

                                if (canvasElement !== null) {

                                    const aGeneratedImageDataURL = canvasElement.toDataURL("image/png");

                                    setGeneratedImageDataURL(aGeneratedImageDataURL);

                                    setFileSizeInBytes(window.atob(aGeneratedImageDataURL.split(",")[1]).length);

                                    setTimestamp(new Date());
                                }
                            }}
                        >

                            Generate image

                        </Button>

                        <Typography>

                            {
                                generatedImageDataURL === null || timestamp === null
                                    ? "The most recent drawn image has not been generated."
                                    : "Image was generated at: " + timestamp.toLocaleTimeString()
                            }

                        </Typography>

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
                            generatedImageDataURL === null
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
