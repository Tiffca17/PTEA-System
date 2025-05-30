let selected = "plant";

$(function() {
    var start = moment().startOf('week');
    var end = moment().endOf('week');

    // Initialize the date range picker
    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
            'This Week': [moment().startOf('week'), moment().endOf('week')],
            'Last Week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')]
        }
    }, function(start, end) {
        // Whenever the range is changed by the user
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        fetchData(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    });

    // Set initial date range
    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));

    // Fetch data initially
    fetchData(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));

    // Automatically fetch data every minute (60000 milliseconds)
    setInterval(function() {
        // Fetch the currently selected date range
        const currentStartDate = $('#reportrange').data('daterangepicker').startDate.format('YYYY-MM-DD');
        const currentEndDate = $('#reportrange').data('daterangepicker').endDate.format('YYYY-MM-DD');
        fetchData(currentStartDate, currentEndDate);
    }, 10000); // Adjust interval (currently set to 1 minute)


    document.getElementById('week-options').addEventListener('change', (event) => {
        if (event.target.name === 'option') {
            selected = event.target.value;
            const currentStartDate = $('#reportrange').data('daterangepicker').startDate.format('YYYY-MM-DD');
            const currentEndDate = $('#reportrange').data('daterangepicker').endDate.format('YYYY-MM-DD');
            console.log(selected); // Logs the selected value
            fetchData(currentStartDate, currentEndDate); // Update graph when radio button changes
        }
    });

});

let chart;


function fetchData(startDate, endDate) {
    console.log(selected);
    const url = 'https://api.p-tea.com/week-sum/' + startDate + "/" + endDate + "/" + selected;
    // const str2 = startDate;
    // const str3 = endDate;
    // const str4 = selected;
    // url = str1 + str2+ "/" + str3+ "/" + str4;
    console.log(url);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched Data:', data);
            // Update the graph or other components with the new data
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
                data2 = data.filter(item => item.material === 'cgs');
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
    const allDates = Array.from(new Set([
        ...data1.map(faculty => faculty.day),
        ...data2.map(faculty => faculty.day),
        ...data3.map(faculty => faculty.day),
        ...data4 ? data4.map(item => item.day) : []
    ]));

    const sortedDates = allDates.sort((a, b) => new Date(a) - new Date(b));

    const yValues1 = sortedDates.map(date => {
        const entry = data1.find(faculty => faculty.day === date);
        return entry ? entry.total : 0;
    });

    const yValues2 = sortedDates.map(date => {
        const entry = data2.find(faculty => faculty.day === date);
        return entry ? entry.total : 0;
    });

    const yValues3 = sortedDates.map(date => {
        const entry = data3.find(faculty => faculty.day === date);
        return entry ? entry.total : 0;
    });

    const yValues4 = data4 ? sortedDates.map(date => {
        const entry = data4.find(item => item.day === date);
        return entry ? entry.total : 0; // If entry is null or undefined, return 0
    }) : [];

    const ctx = document.getElementById('week-graph').getContext('2d');

    let labels;
    if (selected === "plant") {
        labels = ["Relief Bush", "Cedar Valley", "Black Heath"];
    } else {
        labels = ["3-4 Stone", "CGS", "Raw", "Stone Dust"]; // Example labels for materials
    }

    if (!chart) {
        // Create the chart only once
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: sortedDates,
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
        chart.data.labels = sortedDates;
    
        // Update each dataset individually with new data
        chart.data.datasets[0].data = yValues1;
        chart.data.datasets[0].label = labels[0];
    
        chart.data.datasets[1].data = yValues2;
        chart.data.datasets[1].label = labels[1];
    
        chart.data.datasets[2].data = yValues3;
        chart.data.datasets[2].label = labels[2];
    
        if (x === 1 && labels.length > 3) {
            // Check if the fourth dataset is required, and add or update it
            if (chart.data.datasets.length < 4) {
                chart.data.datasets.push({
                    label: labels[3],
                    data: yValues4,
                    borderColor: "red",
                    backgroundColor: gradient(ctx, "red"),
                    tension: 0.5,
                    fill: true
                });
            } else {
                chart.data.datasets[3].data = yValues4;
                chart.data.datasets[3].label = labels[3];
            }
        }

        if (x===0){
            removeDatasetByLabel(chart, "Stone Dust");
        }
    
        // Only update the chart with new data without re-rendering it
        chart.update();
    }
    
}

// Example: Remove a dataset by label
function removeDatasetByLabel(chart, label) {
    const index = chart.data.datasets.findIndex(dataset => dataset.label === label);
    if (index !== -1) {
        chart.data.datasets.splice(index, 1); // Remove the dataset at the found index
        chart.update(); // Re-render the chart to reflect the change
    }
}

