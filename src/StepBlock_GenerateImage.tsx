
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
        generatedImageDataURL,
    }: {
        generatedImageDataURL: string | null,
    }
) {

    const aRef = React.useRef<HTMLAnchorElement>(null);

    const [outputFileName, setOutputFileName] = React.useState("collage.png");

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

    const [fileSizeInBytes, setFileSizeInBytes] = React.useState<number | null>(null);

    React.useEffect(
        () => {

            setFileSizeInBytes(null);
        },
        [generatedImageDataURL]
    )

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
                    <Container
                        sx={{
                            minHeight: "140px",
                        }}
                    >

                        <Typography variant="h6">

                            Check final collage image file size

                        </Typography>

                        <Button
                            variant="contained"
                            sx={{
                                marginBottom: "10px",
                            }}
                            onClick={() => {

                                if (generatedImageDataURL !== null) {


                                    setFileSizeInBytes(window.atob(generatedImageDataURL.split(",")[1]).length);
                                }
                            }}
                        >
                            Calculate and check file size
                        </Button>

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

                        <a
                            ref={aRef}
                            download={outputFileName}
                            style={{
                                marginLeft: "10px",
                            }}
                        >
                            Save generated image.
                        </a>

                    </Container>
                </Card>

            </Container>
        </StepBlock>
    );
}
