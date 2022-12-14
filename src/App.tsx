import Typography from '@mui/material/Typography';
import React from 'react';
import Container from '@mui/material/Container';
import createTheme from '@mui/material/styles/createTheme';
import ThemeProvider from '@mui/system/ThemeProvider';
import { StepBlock_DownloadImages } from './StepBlock_DownloadImages';
import { StepBlock_OpenImages } from './StepBlock_OpenImages';
import { StepBlock_PickImages } from './StepBlock_PickImages';
import { ImageFileMap } from './ImageFileMap';
import { StepBlock_AdjustGeneratedImage } from './StepBlock_AdjustGeneratedImage';
import { StepBlock_GenerateImage } from './StepBlock_GenerateImage';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { StepBlock_AddThreadContext } from './StepBlock_AddThreadContext';
import { ThreadContext } from './ThreadContext';
import { StepBlock_SelectWorkflow } from './StepBlock_SelectWorkflow';
import { WorkflowType } from './WorkflowType';



const theme = createTheme();

const thumbnailPatternRegex = /^(\d)+s\.jpg$/;

function isThumbnail(fileName: string) {

  return thumbnailPatternRegex.test(fileName);
}

function App() {

  const [imageFiles, setImageFiles] = React.useState<ImageFileMap>(new Map<string, File>());

  const [pickedFiles, setPickedFiles] = React.useState(new Map<string, HTMLImageElement>());

  const [fileOrdering, setFileOrdering] = React.useState<Array<string>>([]);

  const [thumbnailCount, setThumbnailCount] = React.useState(0);

  const [threadContext, setThreadContext] = React.useState<ThreadContext>(new Map());

  const [canvasElement, setCanvasElement] = React.useState<HTMLCanvasElement | null>(null);

  const [selectedWorkflowType, setSelectedWorkflowType] = React.useState<WorkflowType>("pick_carefully");

  React.useEffect(
    () => {

      let thumbnailC = 0;

      const fileNameList = Array.from(imageFiles.keys());

      for (const fileName of fileNameList) {

        if (isThumbnail(fileName)) {

          thumbnailC++;
        }
      }

      setThumbnailCount(thumbnailC);
    },
    [imageFiles]
  )

  React.useEffect(
    () => {

      setPickedFiles((oldMap) => {

        const newMap = new Map(oldMap);

        const pickedFilesList = Array.from(pickedFiles.keys());

        for (const pickedFile of pickedFilesList) {

          if (!imageFiles.has(pickedFile)) {

            newMap.delete(pickedFile);
          }
        }

        if (newMap.size === oldMap.size) {

          return oldMap;
        }
        else {

          return newMap;
        }
      })

    },
    [imageFiles, pickedFiles]
  );
  const [snackbarNonUniqueFileWarning_open, setSnackbarNonUniqueFileWarning_open] = React.useState(false);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {

    if (reason === 'clickaway') {
      return;
    }

    setSnackbarNonUniqueFileWarning_open(false);
  };

  const [latestDuplicateFileName, setLatestDuplicateFileName] = React.useState("");

  const [switchFileName, setSwitchFileName] = React.useState<string | null>(null);

  const onSwitchClicked = React.useCallback(
      (fileName: string) => {


          if (switchFileName === null) {

              setSwitchFileName(fileName);
          }
          else if (switchFileName === fileName) {

              setSwitchFileName(null);
          }
          else {

              setFileOrdering(oldArray => {

                  if (switchFileName !== null) {

                      const index1 = oldArray.indexOf(fileName);
                      const index2 = oldArray.indexOf(switchFileName);

                      const newArray = Array.from(oldArray);

                      if (index1 !== index2 && index1 !== -1 && index2 !== -1) {

                          newArray[index1] = switchFileName;
                          newArray[index2] = fileName;

                          return newArray;
                      }

                  }

                  return oldArray;
              });

              setSwitchFileName(null);
          }
      },
      [switchFileName, setFileOrdering]
  );

  return (

    <ThemeProvider theme={theme}>


      <Snackbar open={snackbarNonUniqueFileWarning_open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
          Attempted to add file(s) with duplicate names, including: {latestDuplicateFileName}.
        </Alert>
      </Snackbar>

      <Container
      >
        <Container
          sx={{
            paddingTop: "6px",
            paddingBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              flex: "1",
            }}
          >
          </Box>

          <Typography
            variant="h3"
            align="center"
            sx={{
              flex: "10",
            }}
          >

            Thread image generator

          </Typography>


          <Link
            href="https://github.com/agdg-image/thread-image-generator"
            style={{
              flex: "1",
              minWidth: "fit-content",
            }}
          >
            <svg
              width="43.438667"
              height="42.366489"
              viewBox="0 0 43.438667 42.366489"
            >
              <g
                transform="matrix(1.3333333,0,0,-1.3333333,-275.80242,457.66215)"
              >
                <path
                  d="m 223.13982,343.24662 c -8.994,0 -16.288,-7.293 -16.288,-16.29
                0,-7.196 4.667,-13.302 11.14,-15.457 0.815,-0.149 1.112,0.354 1.112,0.786 0,0.387
                -0.014,1.411 -0.022,2.77 -4.531,-0.984 -5.487,2.184 -5.487,2.184 -0.741,1.882
                -1.809,2.383 -1.809,2.383 -1.479,1.01 0.112,0.99 0.112,0.99 1.635,-0.115 2.495,-1.679
                2.495,-1.679 1.453,-2.489 3.813,-1.77 4.741,-1.353 0.148,1.052 0.569,1.77 1.034,2.177
                -3.617,0.412 -7.42,1.809 -7.42,8.051 0,1.779 0.635,3.232 1.677,4.371 -0.168,0.412
                -0.727,2.068 0.16,4.311 0,0 1.367,0.438 4.479,-1.669 1.299,0.361 2.693,0.541
                4.078,0.548 1.384,-0.007 2.777,-0.187 4.078,-0.548 3.11,2.107 4.475,1.669
                4.475,1.669 0.889,-2.243 0.33,-3.899 0.163,-4.311 1.044,-1.139 1.674,-2.592
                1.674,-4.371 0,-6.258 -3.809,-7.635 -7.437,-8.038 0.584,-0.503 1.105,-1.497
                1.105,-3.017 0,-2.177 -0.02,-3.934 -0.02,-4.468 0,-0.436 0.294,-0.943 1.12,-0.784
                6.468,2.159 11.131,8.26 11.131,15.455 0,8.997 -7.294,16.29 -16.291,16.29"
                  style={{
                    fill: "#1b1817",
                    fillOpacity: "1",
                    fillRule: "evenodd",
                    stroke: "none",
                    strokeWidth: "0.1"
                  }}
                />
              </g>
            </svg>
          </Link>
        </Container>

        <StepBlock_DownloadImages
          stepNumber={1}
        />

        <StepBlock_OpenImages
          stepNumber={2}
          addFilesCallback={(files) => {

            setImageFiles(previousImageFiles => {

              const newMap = new Map(previousImageFiles);

              for (let i = 0; i < files.length; i++) {

                const file = files[i];

                // unique file names required
                if (!newMap.has(file.name)) {

                  newMap.set(file.name, file);
                }
                else {

                  setLatestDuplicateFileName(file.name);

                  setSnackbarNonUniqueFileWarning_open(true);
                }
              }

              return newMap;
            })
          }}
          thumbnailCount={thumbnailCount}
          removeThumbnailFiles={() => {

            setImageFiles(previousImageFiles => {

              const fileNameList = Array.from(previousImageFiles.keys());

              const newMap = new Map(previousImageFiles);

              for (const fileName of fileNameList) {

                if (isThumbnail(fileName)) {


                  newMap.delete(fileName);
                }
              }

              return newMap;
            });


          }}
        />

        <StepBlock_AddThreadContext

          stepNumber={3}
          setThreadContext={setThreadContext}
        />

        <StepBlock_SelectWorkflow
          stepNumber={4}
          selectedWorkflowType={selectedWorkflowType}
          onChangeSelectedWorkflowType={setSelectedWorkflowType}
        />

        <StepBlock_PickImages
          stepNumber={5}
          openedFiles={imageFiles}
          pickedFiles={pickedFiles}
          setPickedFiles={setPickedFiles}
          fileOrdering={fileOrdering}
          setFileOrdering={setFileOrdering}
          threadContext={threadContext}
          workflowType={selectedWorkflowType}
          switchFileName={switchFileName}
          onSwitchClicked={onSwitchClicked}
        />

        <StepBlock_AdjustGeneratedImage
          stepNumber={6}
          pickedFiles={pickedFiles}
          setPickedFiles={setPickedFiles}
          fileOrdering={fileOrdering}
          workflowType={selectedWorkflowType}
          onImageDrawn={(canvasElement) => {

            setCanvasElement(canvasElement);
          }}
          switchFileName={switchFileName}
          onSwitchClicked={onSwitchClicked}
        />

        <StepBlock_GenerateImage
          stepNumber={7}
          canvasElement={canvasElement}
        />

      </Container>

    </ThemeProvider>
  );
}

export default App;
