import { OpenImageFiles } from "./OpenImageFiles";
import { StepBlock } from "./StepBlock";

export function StepBlock_OpenImages(
    props: Parameters<typeof OpenImageFiles>[0] & {stepNumber: number}
) {

    return (
        <StepBlock
            stepNumber={props.stepNumber}
            stepTitle="Open images and videos"
        >

            <OpenImageFiles
                addFilesCallback={props.addFilesCallback}
                thumbnailCount={props.thumbnailCount}
                removeThumbnailFiles={props.removeThumbnailFiles}
            />
        </StepBlock>
    );
}
