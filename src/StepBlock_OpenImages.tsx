import { OpenImageFiles } from "./OpenImageFiles";
import { StepBlock } from "./StepBlock";

export function StepBlock_OpenImages(
    props: Parameters<typeof OpenImageFiles>[0]
) {

    return (
        <StepBlock
            stepNumber={2}
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
