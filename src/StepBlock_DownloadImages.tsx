
import Typography from "@mui/material/Typography";
import { StepBlock } from "./StepBlock";

export function StepBlock_DownloadImages() {

    return (
        <StepBlock
            stepNumber={1}
            stepTitle="Download images and videos from thread"
        >

            <Typography>
                Download the images (including .gif) and videos (in .webm format) from the thread. <span style={{ fontWeight: "bold" }}>This must be done manually.</span>&nbsp;

            </Typography>

            <Typography>

                You can see several suggestions for how to download the images and videos below.

            </Typography>

            <ul>

                <li>
                    <Typography>

                        Browser extensions like&nbsp;

                        <a href="https://chrome.google.com/webstore/detail/image-downloader/cnpniohnfphhjihaiiggeabnkjhpaldj">
                            Image Downloader for Chrome
                        </a>&nbsp;

                        or equivalent browser extensions for other browsers. Using a browser extension may be invasive
                        and require trusting the authors of the extension, and care must be taken that all relevant
                        images and videos are downloaded. For instance, that not only thumbnails (which are low-resolution)
                        are downloaded, or that videos are not excluded from the download.
                    </Typography>
                </li>

                <li>
                    <Typography>

                        Running scripts to download code. The example below requires that <code>wget</code> is installed. &nbsp;
                        <code>wget</code> is generally directly available or easy to install in Linux systems, but more complicated to
                        install and use for Windows systems.

                    </Typography>

                    <code>
                        wget -P pictures -nd -r -l 1 -H -D i.4cdn.org -A png,gif,jpg,jpeg,webm [thread-url]
                    </code>

                    <Typography>
                        You must replace the <code>[thread-url]</code> part with the URL of the thread.
                    </Typography>
                </li>

                <li>
                    <Typography>

                        Finding, installing and using a desktop application to mass-download images and videos from a specific web page.

                    </Typography>
                </li>

                <li>
                    <Typography>

                        Saving images and videos by hand. This is laborious and time-consuming and is not recommended, but is an option.

                    </Typography>
                </li>

            </ul>

            <Typography>
                This step is needed due to same-origin policy and restrictive CORS
                hindering download of images by web-applications directly, thus
                requiring users to perform the downloading.
            </Typography>

        </StepBlock>
    )
}
