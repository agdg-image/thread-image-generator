
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React from "react";

export function OpenImageFiles(
    {addFilesCallback}: {
        addFilesCallback: (fileList: FileList) => void,
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

        <Box>
            <Typography>
                Open the images for inclusion from your file system (file names must be unique).
                You can open multiple files at a time.
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
        </Box>
    );
}
