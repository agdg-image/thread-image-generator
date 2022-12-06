
import * as cheerio from "cheerio";

type FileName = string;
type PostTextContent = string;
type OriginalFileName = string;
export type ThreadContext = Map<FileName, readonly [PostTextContent, OriginalFileName]>;

function getNameFromURL(url: string | undefined) {

    if (url !== undefined) {

        const split = url.split("/");

        if (split.length > 0) {

            return split[split.length - 1];
        }
        else {

            return undefined;
        }
    }
    else {

        return undefined;
    }
}

export function parseThreadHTML(
    text: string
): ThreadContext {

    const $ = cheerio.load(text);

    const threadContext: ThreadContext = new Map();

    $(".postContainer").each((i, element) => {

        const mediaFileName = getNameFromURL($(element).find(".fileThumb").attr("href"));

        if (mediaFileName !== undefined) {

            const postTextContent = $(element).find(".postMessage").html();

            const originalFileNameA = $(element).find(".fileText > a");

            const originalFileName = originalFileNameA.attr("title") === undefined
                ? originalFileNameA.text()
                : originalFileNameA.attr("title");

            if (postTextContent !== null && originalFileName !== undefined) {

                const combinedPostTextContentAndOriginalFileName = [
                    postTextContent,
                    originalFileName
                ] as const;

                threadContext.set(mediaFileName, combinedPostTextContentAndOriginalFileName);

                const mediaThumbnailFileName = getNameFromURL($(element).find(".fileThumb > img").attr("src"));

                if (mediaThumbnailFileName !== undefined) {

                    threadContext.set(mediaThumbnailFileName, combinedPostTextContentAndOriginalFileName);
                }
            }
        }
    });

    return threadContext;
}
