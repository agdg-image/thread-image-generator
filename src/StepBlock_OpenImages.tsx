import { OpenImageFiles } from "./OpenImageFiles";
import { StepBlock } from "./StepBlock";

export function StepBlock_OpenImages(
    props: Parameters<typeof OpenImageFiles>[0]
) {

    return (
        <StepBlock
            colorSwitch={true}
            stepNumber={2}
            stepTitle="Open images"
        >

            <OpenImageFiles
                addFilesCallback={props.addFilesCallback}
            />
        </StepBlock>
    );
}
