
import Typography from "@mui/material/Typography";
import { StepBlock } from "./StepBlock";

export function StepBlock_DownloadImages() {

    return (
        <StepBlock
            colorSwitch={false}
            stepNumber={1}
            stepTitle="Download images from thread"
        >

            <Typography>
                Download the images (including .gif) and videos (in .webm format) from the thread. <span style={{ fontWeight: "bold" }}>This must be done manually.</span>&nbsp;
                You can with advantage install a browser extension like&nbsp;

                <a href="https://chrome.google.com/webstore/detail/image-downloader/cnpniohnfphhjihaiiggeabnkjhpaldj">
                    Image Downloader for Chrome
                </a>&nbsp;

                or equivalent browser extensions for other browsers.
            </Typography>

            <Typography>
                (This step is needed due to same-origin policy and restrictive CORS
                hindering download of images by web-applications directly, thus
                requiring users to perform the downloading)
            </Typography>

        </StepBlock>
    )
}
