
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/system/Container";
import React from "react";
import { StepBlock } from "./StepBlock";
import { parseThreadHTML, ThreadContext } from "./ThreadContext";

export function StepBlock_AddThreadContext(
    {
        stepNumber,
        setThreadContext,
    }: {
        stepNumber: number,
        setThreadContext: React.Dispatch<React.SetStateAction<ThreadContext>>
    }
) {

    return (
        <StepBlock
            stepNumber={stepNumber}
            stepTitle="Add thread context (optional)"
        >

            <Container>

                <Typography>

                    When looking through opened files to determine which to include, it can be useful
                    to know which post included which image or video. By adding thread context,
                    you can click on the image or video when picking images and videos to see
                    the source of the original post, including text.

                </Typography>

                <Typography>

                    The thread context is simply the "*.html" gotten when saving the thread page
                    in the browser to some file.

                </Typography>


                <Button
                    variant="contained"
                    component="label"
                >

                    Open thread context ("*.html" file)
                    <input
                        type="file"
                        hidden
                        accept=".html"
                        onChange={(changeEvent) => {

                            const files = (changeEvent.target as HTMLInputElement).files;

                            if (files !== null && files.length === 1) {

                                const file = files.item(0);

                                if (file !== null) {

                                    file.text().then((text) => {

                                        setThreadContext(parseThreadHTML(text));
                                    })
                                }
                            }
                        }}
                    />

                </Button>
            </Container>
        </StepBlock>
    );
}
