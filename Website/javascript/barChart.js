const xVal = ["Cedar Valley", "Black Heath", "Relief Bush"];
const yVal = [55, 49, 44];

const ctx4 = document.getElementById("barchart").getContext("2d");
const gradient4 = ctx4.createLinearGradient(0, 0, ctx4.canvas.width, 0); // Horizontal gradient
gradient4.addColorStop(0, "#002767"); // Start color
gradient4.addColorStop(0.5, "#134492"); // Middle color
gradient4.addColorStop(1, "#2e5daa"); // End color

new Chart("barchart", {
type: "bar",
data: {
    labels: xVal,
    datasets: [{
    backgroundColor: gradient4,
    data: yVal
    }]
},
options: {
    scales: {
        x: {
            grid: {
                display: false // Removes the grid lines for the x-axis
            }
        },
        y: {
            grid: {
                display: false // Removes the grid lines for the y-axis
            }
        }
    },
    plugins: {
    legend: {
        display: false // Hides the legend
    }
}
}
});