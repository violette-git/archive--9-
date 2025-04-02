const fs = require('fs');
const { JSDOM } = require('jsdom');
const { createCanvas } = require('canvas');

// Function to test the start button functionality
async function testStartButton() {
  try {
    // Read the HTML file
    const html = fs.readFileSync('./index.html', 'utf8');
    
    // Create a virtual DOM with localStorage and canvas support
    const dom = new JSDOM(html, {
      url: "file://" + process.cwd() + "/",
      resources: "usable",
      runScripts: "dangerously",
      pretendToBeVisual: true,
      beforeParse(window) {
        // Mock localStorage
        const storage = {};
        window.localStorage = {
          getItem: (key) => storage[key] || null,
          setItem: (key, value) => { storage[key] = value.toString(); }
        };
        
        // Mock canvas
        window.HTMLCanvasElement.prototype.getContext = function() {
          // Return a mock context with required methods
          return {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            fillRect: () => {},
            fillText: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            arc: () => {},
            fill: () => {}
          };
        };
      }
    });
    
    const window = dom.window;
    const document = window.document;
    
    // Wait for the page to load
    await new Promise(resolve => {
      window.addEventListener('load', resolve);
      // If load doesn't fire within 2 seconds, continue anyway
      setTimeout(resolve, 2000);
    });
    
    console.log("Page loaded. Testing start button...");
    
    // Check if the start button exists
    const startButton = document.getElementById('startButton');
    if (!startButton) {
      console.error("Start button not found in the document!");
      return false;
    }
    
    console.log("Start button found. Clicking...");
    
    // Store the initial state
    const initialInstructionsDisplay = document.getElementById('instructionsPanel').style.display;
    
    // Click the start button
    startButton.click();
    
    // Wait a moment for any animations or transitions
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
      console.log("SUCCESS: Start button works correctly!");
      return true;
    } else {
      console.log("FAILURE: Start button does not properly initialize the game.");
      console.log("Initial instructions display:", initialInstructionsDisplay);
      console.log("Current instructions display:", document.getElementById('instructionsPanel').style.display);
      console.log("Start button display:", document.getElementById('startButton').style.display);
      console.log("Pause button display:", document.getElementById('pauseButton').style.display);
      return false;
    }
  } catch (error) {
    console.error("Error during testing:", error);
    return false;
  }
}

// Run the test
testStartButton().then(success => {
  console.log("Test completed. Success:", success);
  process.exit(success ? 0 : 1);
});