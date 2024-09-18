const face = document.getElementById('face');
const mouth = document.getElementById('mouth');
const eyeLeft = document.getElementById('eyeLeft');
const eyeRight = document.getElementById('eyeRight');
const slider = document.getElementById('slider');
const sliderValue = document.getElementById('slider-value');

const midpoint = 5;
calculateFaceColor(midpoint); // initial facecolor

slider.addEventListener('input', (event) => {
    const value = event.target.value;
    sliderValue.innerText = `${Math.round(value / 10 * 100)}%`;
    updateFace(value);
});

function calculateFaceColor(value){
	let precentage, r, g, b;
  if(value < midpoint) {
  	// Transition from blue (0, 0, 255) to yellow (255, 255, 0)
    percentage = value / 5;

    r = Math.round(0 + percentage * (255 - 0));
    g = Math.round(0 + percentage * (255 - 0));
    b = Math.round(255 + percentage * (0 - 255));
  } else {
   // Transition from yellow (255, 255, 0) to green (0, 255, 0)
    percentage = (value - 5) / 5;

    r = Math.round(255 + percentage * (0 - 255));
    g = 255;
    b = 0;
  }

  // Update the background color
  face.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

function updateFace(value) {
    calculateFaceColor(value);

    if (value >= midpoint) {
        // Happy face
        mouth.style.removeProperty('position'); // remove the absolute positioning introduced by the sad mouth
        mouth.style.removeProperty('top'); // remove the absolute positioning introduced by the sad mouth
        mouth.style.removeProperty('border'); // remove the borders added by the sad mouth
        mouth.style.backgroundColor = 'black';
        mouth.style.borderRadius = `0 0 ${(value  - midpoint) * 10}px ${(value  - midpoint) * 10}px`
        mouth.style.transform = `translate(0, ${value  - midpoint + 10}px)`;
        mouth.style.height = `${(value  - midpoint) * 10 + midpoint}px`; // change between 
        
        eyeLeft.style.transform  = `translate(-10px, 0)`;
        eyeRight.style.transform  = `translate(10px, 0)`;
        let eyeHeight = `${(midpoint * 4) + (value  - midpoint) * 2.5}px`;
        eyeLeft.style.height  = eyeHeight;
        eyeRight.style.height  = eyeHeight;
    } else if (value < midpoint) {
        // Sad face
        mouth.style.width = `${(midpoint - value) * 4 + 80}px`; // change between 80px to 100px
        mouth.style.height = `${(midpoint - value) * 18 + 10}px`; // change between 10px to 100px
        mouth.style.backgroundColor = `transparent`;
        mouth.style.border = `6px solid transparent`;
        mouth.style.borderRadius = `100%`;
        mouth.style.borderTopColor = `black`;
        mouth.style.position = `absolute`;
        mouth.style.top = `${(midpoint - value) * 1.9 + 84}px`; // change between 80px to 90px
        
        let eyeY = `${(midpoint - value) * 3}px`; // change between 0px to 15px
        eyeLeft.style.transform  = `translate(-10px, ${eyeY})`;
        eyeRight.style.transform  = `translate(10px, ${eyeY})`;
    }
}