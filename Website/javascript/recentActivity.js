document.addEventListener('DOMContentLoaded', () => {

    fetchData();
    setInterval(fetchData, 10000);

});

function fetchData(){
         
    fetch('https://api.p-tea.com/recent-activity')
    .then(response => response.json())
    .then((data) => {
        table(data);
      
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function table(data){
    const tableBody = document.querySelector("#recent-activity-table tbody");
    tableBody.innerHTML = ''
    if(data.length === 0){
        const row = document.createElement("tr");
        const noResultsCell = document.createElement("td");
        noResultsCell.colSpan = 6; // Span all columns
        noResultsCell.textContent = "No data to display";
        noResultsCell.style.textAlign = "center";
        row.appendChild(noResultsCell);
        tableBody.appendChild(row);

    }
    else{
        for (let i = 0; i < data.length; i++) {
            const row = document.createElement("tr"); // Create a new row
        
            // Create and populate cells for each field

            const timeCell = document.createElement("td");
            timeCell.classList.add("td1");
            const timeDiv = document.createElement("div");
            timeDiv.textContent = data[i].time;
            timeDiv.classList.add("time")
            timeCell.appendChild(timeDiv);
            row.appendChild(timeCell);

            const iconCell = document.createElement("td");
            iconCell.classList.add("td2");
            const dotDiv = document.createElement("div");
            dotDiv.classList.add("dot");
            const divHolder = document.createElement("div");
            divHolder.classList.add("circle-holder");
            const icon = document.createElement("i");
            icon.classList.add("fa-solid", "fa-bell");

            // Append the <i> element to the <div>
            dotDiv.appendChild(icon);
            divHolder.appendChild(dotDiv)
            iconCell.appendChild(divHolder);
            // plantCell.textContent = data[i].plant;
            row.appendChild(iconCell);
        
            const messageCell = document.createElement("td");
            messageCell.classList.add("td3");
            const messagediv = document.createElement("div");
            const plantdiv = document.createElement("div");
            messagediv.textContent = data[i].message;
            messagediv.classList.add("alert-top");
            plantdiv.textContent = data[i].plant;
            plantdiv.classList.add("alert-bottom");
            messageCell.appendChild(messagediv);
            messageCell.appendChild(plantdiv);
            row.appendChild(messageCell);
        
            
    
    
            // Append the row to the table body
            tableBody.appendChild(row);
        }
    }
    
}