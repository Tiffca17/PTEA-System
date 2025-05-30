let firstDisplayBox = document.getElementsByClassName("box");
let firstDisplayCircle = document.getElementsByClassName("circle");
const infoBox = document.getElementById("infoBox");
infoBox.style.background = "linear-gradient(to right, #002767 , #5e92e6)"

firstDisplayBox[0].style.display = "block";
firstDisplayCircle[0].style.color = "white";
firstDisplayCircle[0].style.borderBottom = "2px solid white";

// Circle click handler
function circleClick(n) {
    showBoxes(n);
    colorChange(n);
}

// Show boxes
function showBoxes(i) {
    const infoBox = document.getElementById("infoBox");
    let boxes = document.getElementsByClassName("box");

    // Hide all boxes and reset background
    Array.from(boxes).forEach((box, index) => {
        box.style.display = index === i ? "block" : "none";
    });

    // Set background gradient
    const gradients = [
        "linear-gradient(to right, #002767 , #5e92e6)",
        "white",
        "white",
        "white"
    ];
    infoBox.style.background = gradients[i] || gradients[0];
}

// Change circle colors
function colorChange(i) {
    let circles = document.getElementsByClassName("circle");

    // Reset all circles
    Array.from(circles).forEach((circle, index) => {
        circle.style.color = index === i ? "black" : "rgba(0, 0, 0, 0.4)";
        circle.style.borderBottom = index === i ? "2px solid white" : "none";
    });
}
