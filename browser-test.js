// This script can be pasted into the browser console after loading index.html

function testStartButton() {
  console.log("Starting test of the start button...");
  
  // Check if the start button exists
  const startButton = document.getElementById('startButton');
  if (!startButton) {
    console.error("Start button not found in the document!");
    return false;
  }
  
  console.log("Start button found. Checking initial state...");
  
  // Store the initial state
  const initialInstructionsDisplay = document.getElementById('instructionsPanel').style.display;
  console.log("Initial instructions panel display:", initialInstructionsDisplay);
  
  console.log("Clicking start button...");
  // Click the start button
  startButton.click();
  
  // Check the state after clicking
  console.log("Checking state after clicking start button...");
  
  // Check if the instructions are hidden
  const instructionsHidden = document.getElementById('instructionsPanel').style.display === 'none';
  
  // Check if the game is running by checking if the start button is hidden and pause button is shown
  const startButtonHidden = document.getElementById('startButton').style.display === 'none';
  const pauseButtonShown = document.getElementById('pauseButton').style.display === 'inline-block';
  
  console.log("Test results:");
  console.log("- Instructions hidden:", instructionsHidden);
  console.log("- Start button hidden:", startButtonHidden);
  console.log("- Pause button shown:", pauseButtonShown);
  
  if (instructionsHidden && startButtonHidden && pauseButtonShown) {
    console.log("%cSUCCESS: Start button works correctly!", "color: green; font-weight: bold");
    return true;
  } else {
    console.log("%cFAILURE: Start button does not properly initialize the game.", "color: red; font-weight: bold");
    console.log("Current instructions display:", document.getElementById('instructionsPanel').style.display);
    console.log("Start button display:", document.getElementById('startButton').style.display);
    console.log("Pause button display:", document.getElementById('pauseButton').style.display);
    return false;
  }
}

// Run the test
testStartButton();