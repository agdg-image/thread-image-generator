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


function App() {

  const [imageFiles, setImageFiles] = React.useState<ImageFileMap>(new Map<string, File>());

  const [pickedFiles, setPickedFiles] = React.useState(new Map<string, HTMLImageElement>());

  const [generatedImageDataURL, setGeneratedImageDataURL] = React.useState<string | null>(null);

  return (

    <ThemeProvider theme={theme}>

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

                newMap.set(file.name, file);
              }

              return newMap;
            })
          }}
        />

        <StepBlock_PickImages
          openedFiles={imageFiles}
          pickedFiles={pickedFiles}
          setPickedFiles={setPickedFiles}
        />

        <StepBlock_AdjustGeneratedImage
          pickedFiles={pickedFiles}
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
