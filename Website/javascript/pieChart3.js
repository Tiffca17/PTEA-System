const ctx3 = document.getElementById("pieChart3").getContext("2d");
const gradient3 = ctx2.createLinearGradient(0, 0, ctx2.canvas.width, 0); // Horizontal gradient
gradient3.addColorStop(0, "#002767"); // Start color
gradient3.addColorStop(0.5, "#134492"); // Middle color
gradient3.addColorStop(1, "#2e5daa"); // End color

const xValues3 = ["3/4 Stone"];
const yValues3 = [55, 180];
const barColors3 = [gradient3, "#f1f3f9"]; // Use gradients here

new Chart("pieChart3", {
    type: "doughnut",
    data: {
        labels: xValues3,
        datasets: [{
            backgroundColor: barColors3, // Apply gradients
            data: yValues3
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
