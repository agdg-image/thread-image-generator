
import TextField from "@mui/material/TextField";
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

    return (
        <StepBlock
            colorSwitch={false}
            stepNumber={5}
            stepTitle="Generate image"
        >

            <Container>

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
                >
                    Save generated image.
                </a>

            </Container>
        </StepBlock>
    );
}
