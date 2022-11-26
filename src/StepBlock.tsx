import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export function StepBlock(
    props:
        React.PropsWithChildren & {
            colorSwitch: boolean,
            stepNumber: number,
            stepTitle: string,
        }
) {

    return (
        <Container
            sx={{
                backgroundColor: (theme) =>
                    props.colorSwitch ? theme.palette.grey[100] : theme.palette.grey[300],
                paddingTop: "6px",
                paddingBottom: "10px"
            }}
        >
            <Typography variant="h5">
                <span style={{ fontWeight: "bold" }}>{props.stepNumber}: </span>
                {props.stepTitle}
            </Typography>

            {props.children}
        </Container>
    );
}
