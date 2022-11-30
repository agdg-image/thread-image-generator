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



const theme = createTheme();

/**
 * Container header.
 */
function ContainerHeader(props: React.PropsWithChildren) {

  return (
    <Container
      sx={{
        paddingTop: "6px",
        paddingBottom: "10px"
      }}
    >
      {props.children}
    </Container>
  );
}

const thumbnailPatternRegex = /^(\d)+s\.jpg$/;

function App() {

  const [imageFiles, setImageFiles] = React.useState<ImageFileMap>(new Map<string, File>());

  const [pickedFiles, setPickedFiles] = React.useState(new Map<string, HTMLImageElement>());

  const [generatedImageDataURL, setGeneratedImageDataURL] = React.useState<string | null>(null);

  const [fileOrdering, setFileOrdering] = React.useState<Array<string>>([]);

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

  return (

    <ThemeProvider theme={theme}>


      <Snackbar open={snackbarNonUniqueFileWarning_open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
          Attempted to add file(s) with duplicate names, including: {latestDuplicateFileName}.
        </Alert>
      </Snackbar>

      <Container
      >
        <ContainerHeader>

          <Typography variant="h3" align="center">

            Thread image generator

          </Typography>

        </ContainerHeader>

        <StepBlock_DownloadImages />

        <StepBlock_OpenImages
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
          removeThumbnailFiles={() => {

            setImageFiles(previousImageFiles => {

              const fileNameList = Array.from(previousImageFiles.keys());

              const newMap = new Map(previousImageFiles);

              for (const fileName of fileNameList) {

                if (thumbnailPatternRegex.test(fileName)) {

                  newMap.delete(fileName);
                }
              }

              return newMap;
            });


          }}
        />

        <StepBlock_PickImages
          openedFiles={imageFiles}
          pickedFiles={pickedFiles}
          setPickedFiles={setPickedFiles}
          fileOrdering={fileOrdering}
          setFileOrdering={setFileOrdering}
        />

        <StepBlock_AdjustGeneratedImage
          pickedFiles={pickedFiles}
          fileOrdering={fileOrdering}
          setGeneratedImageDataURL={setGeneratedImageDataURL}
        />

        <StepBlock_GenerateImage
          generatedImageDataURL={generatedImageDataURL}
        />

      </Container>

    </ThemeProvider>
  );
}

export default App;
