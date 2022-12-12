import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { StepBlock } from "./StepBlock";
import { WorkflowType } from "./WorkflowType";

export function StepBlock_SelectWorkflow(
    {
        stepNumber,
        selectedWorkflowType,
        onChangeSelectedWorkflowType,
    }: {
        stepNumber: number,
        selectedWorkflowType: WorkflowType,
        onChangeSelectedWorkflowType: (workflowType: WorkflowType) => void,
    }
) {

    return (

        <StepBlock
            stepNumber={stepNumber}
            stepTitle="Select workflow"
        >

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                }}
            >

                <WorkflowOption
                    workflowType="pick_carefully"
                    title="Carefully pick images"
                    headline="Pick each image that should be shown on the final collage carefully. Some controls will be unavailable."
                    bestIfList={[
                        "You want to spend time picking each image carefully.",
                        "You do not need full control.",
                    ]}
                    selectedWorkflowType={selectedWorkflowType}
                    onChangeSelectdWorkflowType={onChangeSelectedWorkflowType}
                />

                <WorkflowOption
                    workflowType="full_control"
                    title="Quickly pick images/full control"
                    headline="Pick images quickly and arbitrarily, or full control. All controls will be available."
                    bestIfList={[
                        "You do not want to spend time picking each image carefully, or you want full control.",
                    ]}
                    selectedWorkflowType={selectedWorkflowType}
                    onChangeSelectdWorkflowType={onChangeSelectedWorkflowType}
                />

            </Box>

        </StepBlock>
    );
}

function WorkflowOption(
    {
        workflowType,
        title,
        headline,
        bestIfList,
        selectedWorkflowType,
        onChangeSelectdWorkflowType,
    }: {
        workflowType: WorkflowType,
        title: string,
        headline: string,
        bestIfList: Array<string>,
        selectedWorkflowType: WorkflowType,
        onChangeSelectdWorkflowType: (newWorkflowSelected: WorkflowType) => void,
    }
) {

    return (


        <Card
            sx={{
                flex: "1",
                minWidth: "0px",
                userSelect: "none",
                backgroundColor: workflowType === selectedWorkflowType ? "#a4a4ff" : "",
                '&:hover': {
                    backgroundColor: workflowType === selectedWorkflowType ? "#a4a4ff" : "#eee",
                },
            }}
            onClick={() => {
                onChangeSelectdWorkflowType(workflowType)
            }}
        >

            <Container>

                <Typography
                    variant="h6"
                    sx={{
                        marginTop: "8px",
                    }}
                >

                    {title}

                </Typography>

                <Typography>
                    {headline}
                </Typography>

                <Typography
                    sx={{
                        fontWeight: "bold",
                    }}
                >
                    Best if:
                </Typography>

                <ul
                    style={{
                        marginTop: "4px",
                    }}
                >
                    {
                        bestIfList.map(
                            item => (
                                <li
                                    key={item}
                                >
                                    <Typography>
                                        {item}
                                    </Typography>
                                </li>
                            )
                        )
                    }
                </ul>

            </Container>


        </Card>
    );
}
