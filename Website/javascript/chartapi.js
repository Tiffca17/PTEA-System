document.addEventListener('DOMContentLoaded', () => {
    updateSocketData();
});

function fetchData() {
    fetch('https://api.p-tea.com/faculty')
        .then(response => response.json())
        .then(data => {
            //const latestEntry = data[data.length - 1]; // Get the last entry
            // Update Socket 1
            
            console.log(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

