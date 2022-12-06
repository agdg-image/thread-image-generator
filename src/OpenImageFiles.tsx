
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";
import { DragAndDrop } from "./DragAndDrop";
import { getLogoWithColor } from "./Logo";

export function OpenImageFiles(
    {
        addFilesCallback,
        thumbnailCount,
        removeThumbnailFiles,
    }: {
        addFilesCallback: (fileList: FileList | Array<File>) => void,
        thumbnailCount: number,
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

    const [logoColor, setLogoColor] = React.useState("#000000");

    const imgRef = React.useRef<HTMLImageElement | null>(null);

    const [logoFileName, setLogoFileName] = React.useState("the-thread-logo-file-name.png");

    return (
        <>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    gap: "10px",
                }}
            >
                <Typography>
                    Open the images and videos for inclusion from your file system (file names must be unique).
                    You can open multiple files at a time.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "10px",
                    }}
                >

                    <Card

                        sx={{
                            minWidth: "fit-content",
                        }}
                    >
                        <Container
                            sx={{
                                padding: "6px",
                                minWidth: "fit-content",
                            }}
                        >
                            <Typography variant="h6">
                                Open
                            </Typography>

                            <Button
                                variant="contained"
                                component="label"
                            >

                                Open image and video files
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept=".png, .jpg, .jpeg, .gif, .webm"
                                    onChange={changeListener}
                                />

                            </Button>

                            <DragAndDrop
                                onFilesDropped={(files) => {

                                    addFilesCallback(files);
                                }}
                            />
                        </Container>
                    </Card>

                    <Card>

                        <Container
                            sx={{
                                padding: "6px",
                            }}
                        >

                            <Typography variant="h6"
                            >

                                Optional

                            </Typography>

                            <Card
                                sx={{
                                    minWidth: "fit-content",
                                }}
                            >
                                <Container
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                        padding: "6px",
                                        minWidth: "fit-content",
                                    }}
                                >
                                    <Typography variant="h6">
                                        Logo as opened file
                                    </Typography>

                                    <img
                                        src={getLogoWithColor(logoColor)}
                                        ref={imgRef}

                                        style={{
                                            maxWidth: "256px",
                                            maxHeight: "256px",
                                            objectFit: "contain"
                                        }}
                                    >
                                    </img>

                                    <Typography>
                                        Color: {logoColor}
                                    </Typography>

                                    <input
                                        type="color"
                                        value={logoColor}
                                        onChange={(event) => {

                                            setLogoColor(event.target.value);
                                        }}
                                    />

                                    <TextField
                                        variant="standard"
                                        defaultValue={logoFileName}
                                        onChange={(event) => {

                                            setLogoFileName(event.target.value);
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={() => {

                                            if (imgRef.current !== null) {

                                                const img = imgRef.current;

                                                const canvas = document.createElement("canvas") as HTMLCanvasElement;

                                                canvas.width = img.naturalWidth * 4;
                                                canvas.height = img.naturalHeight * 4;

                                                const ctx = canvas.getContext("2d");

                                                if (ctx !== null) {

                                                    ctx.scale(4, 4);

                                                    ctx.drawImage(img, 0, 0);
                                                }

                                                canvas.toBlob(
                                                    (blob) => {

                                                        if (blob !== null) {

                                                            addFilesCallback([
                                                                new File(
                                                                    [blob],
                                                                    logoFileName,
                                                                    {
                                                                        type: "image/png"
                                                                    }
                                                                )
                                                            ]);
                                                        }
                                                    },
                                                );
                                            }
                                        }}
                                    >
                                        Include logo as file
                                    </Button>
                                </Container>
                            </Card>



                            <Card
                                sx={{
                                    marginTop: "10px",
                                }}
                            >
                                <Container
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                        padding: "6px",
                                    }}
                                >
                                    <Typography variant="h6">
                                        Misc
                                    </Typography>

                                    <Typography>
                                        A "thumbnail" image is defined as an image with a file name that fits the pattern "[number]s.jpg".
                                        Thumbnail images are generally low-resolution versions of the actual image or the first frame of a video.
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        disabled={thumbnailCount === 0}
                                        onClick={removeThumbnailFiles}
                                    >
                                        Remove all thumbnails ({thumbnailCount})
                                    </Button>

                                </Container>
                            </Card>



                        </Container>

                    </Card>

                </Box>
            </Box>
        </>
    );
}
