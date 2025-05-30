const ctx2 = document.getElementById("pieChart2").getContext("2d");
const gradient2 = ctx2.createLinearGradient(0, 0, ctx2.canvas.width, 0); // Horizontal gradient
gradient2.addColorStop(0, "#002767"); // Start color
gradient2.addColorStop(0.5, "#134492"); // Middle color
gradient2.addColorStop(1, "#2e5daa"); // End color

const xValues2 = ["3/4 Stone"];
const yValues2 = [55, 180];
const barColors2 = [gradient2, "#f1f3f9"]; // Use gradients here

new Chart("pieChart2", {
    type: "doughnut",
    data: {
        labels: xValues2,
        datasets: [{
            backgroundColor: barColors2, // Apply gradients
            data: yValues2
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false // Hides the legend
            }
        }
    }
});
