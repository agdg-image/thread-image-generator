import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import React from 'react';

function onHelloWorldClickHandler() {

  console.log("Hello MUI world!");
}

function App() {
  return (

    <Box>

      <Typography>

        Testing.

      </Typography>

      <Button
        onClick={onHelloWorldClickHandler}
      >
        Click me to print "Hello MUI world!" to the console.
      </Button>
    </Box>
  );
}

export default App;
