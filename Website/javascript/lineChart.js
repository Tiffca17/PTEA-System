let selected = "plant"; // Set default value to 'plant'

// Ensure the event listener is only added once, not each time `updateLineGraph` is called
document.addEventListener('DOMContentLoaded', () => {
    // Initial call to render the graph with the default "plant" option
    updateLineGraph();
    

    // Update data every 5 seconds
    setInterval(updateLineGraph, 10000);

    // Listen for changes in the radio buttons
    document.getElementById('month-options').addEventListener('change', (event) => {
        if (event.target.name === 'option') {
            selected = event.target.value;
            console.log(selected); // Logs the selected value
            updateLineGraph(); // Update graph when radio button changes
        }
    });
});

// Initialize chart globally to update it dynamically later
let monthChart =null;


function updateLineGraph() {
    console.log(selected);
    console.log("This is running");
    str1 = 'https://api.p-tea.com/month-sum/';
    str2 = selected;
    url = str1+str2;

    fetch(url)
    .then(response => response.json())
    .then((data) => {
        // Log the received data for debugging
        console.log('Fetched Data:', data);

        let data1;
        let data2;
        let data3;
        let data4; 

        if (selected == "plant"){
            data1 = data.filter(item => item.plant === 'Relief Bush');
            data2 = data.filter(item => item.plant === 'Cedar Valley');
            data3 = data.filter(item => item.plant === 'Black Heath');
            graph_plot(0,data1,data2,data3,null);
        }
        else{
            data1 = data.filter(item => item.material === '3-4 Stone');
            data2 = data.filter(item => item.material === 'CGS');
            data3 = data.filter(item => item.material === 'raw');
            data4 = data.filter(item => item.material === 'Stone Dust');
            graph_plot(1,data1, data2, data3, data4);

            console.log(data1);
        };
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function gradient(ctx, colorStart) {
    const gradientLine1 = ctx.createLinearGradient(0, 0, 0, 400);
    gradientLine1.addColorStop(0, colorStart); // Lighter shade
    gradientLine1.addColorStop(1, 'rgba(30, 144, 255, 0)'); // Fade to transparent
    return gradientLine1;
}

function graph_plot(x, data1, data2, data3, data4){
    const allMonths = Array.from(new Set([
        ...data1.map(faculty => faculty.month_name.trim()),
        ...data2.map(faculty => faculty.month_name.trim()),
        ...data3.map(faculty => faculty.month_name.trim()),
        ...data4 ? data4.map(item => item.month_name.trim()) : []
    ]));

    const sortedMonths = allMonths.sort((a, b) => {
        const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    const yValues1 = sortedMonths.map(month => {
        const entry = data1.find(faculty => faculty.month_name.trim() === month.trim());
        return entry ? entry.sum : 0;
    });

    const yValues2 = sortedMonths.map(month => {
        const entry = data2.find(faculty => faculty.month_name.trim() === month.trim());
        return entry ? entry.sum : 0;
    });

    const yValues3 = sortedMonths.map(month => {
        const entry = data3.find(faculty => faculty.month_name.trim() === month.trim());
        return entry ? entry.sum : 0;
    });

    const yValues4 = data4 ? sortedMonths.map(month => {
        const entry = data4.find(item => item.month_name.trim() === month.trim());
        return entry ? entry.sum : 0; // If entry is null or undefined, return 0
    }) : [];

    const ctx = document.getElementById('myChart').getContext('2d');

    let labels;
    if (selected === "plant") {
        labels = ["Relief Bush", "Cedar Valley", "Black Heath"];
    } else {
        labels = ["Stone Dust", "3-4 Stone", "CGS", "Raw"]; // Example labels for materials
    }

    if (!monthChart) {
        // Create the chart only once
        monthChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: sortedMonths,
                datasets: [
                    {
                        label: labels[0],
                        data: yValues1,
                        borderColor: "#103c74",
                        backgroundColor: gradient(ctx, "#103c74"),
                        tension: 0.5,
                        fill: true
                    },
                    {
                        label: labels[1],
                        data: yValues2,
                        borderColor: "#edc85d",
                        backgroundColor: gradient(ctx, "#edc85d"),
                        tension: 0.5,
                        fill: true
                    },
                    {
                        label: labels[2],
                        data: yValues3,
                        borderColor: "#FF6F61",
                        backgroundColor: gradient(ctx, "#FF6F61"),
                        tension: 0.5,
                        fill: true
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        enabled: true,
                        backgroundColor: "white",
                        titleColor: "#042a0b",
                        bodyColor: "#042a0b",
                        titleFont: { weight: 'bold' },
                        padding: 10,
                        cornerRadius: 10,
                        borderColor: "#cccccc",
                        borderWidth: 1,
                        xAlign: "left",
                    },
                    legend: {
                        display: false, // Hides the legend
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false, // Removes grid lines for x-axis
                        },
                    },
                    y: {
                        grid: {
                            display: false, // Removes grid lines for y-axis
                        },
                    },
                },
            },
        });
    } else {
        // Update existing chart's labels
        monthChart.data.labels = sortedMonths;
    
        // Update each dataset individually with new data
        monthChart.data.datasets[0].data = yValues1;
        monthChart.data.datasets[0].label = labels[0];
    
        monthChart.data.datasets[1].data = yValues2;
        monthChart.data.datasets[1].label = labels[1];
    
        monthChart.data.datasets[2].data = yValues3;
        monthChart.data.datasets[2].label = labels[2];
    
        if (x === 1 && labels.length > 3) {
            // Check if the fourth dataset is required, and add or update it
            if (monthChart.data.datasets.length < 4) {
                monthChart.data.datasets.push({
                    label: labels[3],
                    data: yValues4,
                    borderColor: "red",
                    backgroundColor: gradient(ctx, "red"),
                    tension: 0.5,
                    fill: true
                });
            } else {
                monthChart.data.datasets[3].data = yValues4;
                monthChart.data.datasets[3].label = labels[3];
            }
        }

        if (x===0){
            removeDatasetByLabel(monthChart, "Raw");
        }
    
        // Only update the chart with new data without re-rendering it
        monthChart.update();
    }
    
}

// Example: Remove a dataset by label
function removeDatasetByLabel(monthChart, label) {
    const index = monthChart.data.datasets.findIndex(dataset => dataset.label === label);
    if (index !== -1) {
        monthChart.data.datasets.splice(index, 1); // Remove the dataset at the found index
        monthChart.update(); // Re-render the chart to reflect the change
    }
}



