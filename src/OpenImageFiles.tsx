
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React from "react";
import { DragAndDrop } from "./DragAndDrop";

export function OpenImageFiles(
    {
        addFilesCallback,
        removeThumbnailFiles,
    }: {
        addFilesCallback: (fileList: FileList) => void,
        removeThumbnailFiles: () => void,
    }
) {

    const changeListener = React.useCallback(
        (changeEvent: React.ChangeEvent) => {

            const files = (changeEvent.target as HTMLInputElement).files;

            if (files !== null) {

                addFilesCallback(files);
            }
        },
        [addFilesCallback]
    );

    return (
        <>

            <Box
                sx={{
                    display: "flex",
                    gap: "10px",
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        gap: "10px",
                    }}
                >
                    <Typography>
                        Open the images for inclusion from your file system (file names must be unique).
                        You can open multiple files at a time.
                    </Typography>

                    <Typography>
                        (A "thumbnail" image is defined as an image with a file name that fits the pattern "[number]s.jpg").
                    </Typography>

                    <Button
                        variant="contained"
                        component="label"
                    >

                        Open image files
                        <input
                            type="file"
                            hidden
                            multiple
                            accept=".png, .jpg, .jpeg, .gif, .webm"
                            onChange={changeListener}
                        />

                    </Button>

                    <Button
                        variant="contained"
                        onClick={removeThumbnailFiles}
                    >
                        Remove all thumbnails
                    </Button>
                </Box>

                <DragAndDrop
                    onFilesDropped={(files) => {

                        addFilesCallback(files);
                    }}
                />
            </Box>
        </>
    );
}
