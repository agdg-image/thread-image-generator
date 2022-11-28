
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export function DragAndDrop(

    {
        onFilesDropped
    }: {
        onFilesDropped: (files: FileList) => void,
    }
) {


    return (

        <Paper
            sx={[
                (theme) => ({
                    width: "400px",
                    height: "400px",
                    borderStyle: "dashed",
                    borderColor: theme.palette.grey[400],
                    marginTop: "6px",
                }),
            ]}
        >

            <Box
                sx={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                }}

                onDrop={(event) => {

                    event.preventDefault();

                    onFilesDropped(event.dataTransfer.files);
                }}

                onDragOver={(event) => {

                    event.preventDefault();
                }}
            >

                <Typography>
                    Drag and drop image files here.
                </Typography>

            </Box>

        </Paper>
    );
}
