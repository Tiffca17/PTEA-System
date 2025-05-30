
// A function to update the crusher status dynamically
function updateStatus(status, plant, messages) {
    const plantIndex = {
        "Relief Bush": 0,
        "Cedar Valley": 1,
        "Black Heath": 2
    };
    
    

    
    // Determine the index based on the plant name
    const index = plantIndex[plant];
    if (index === undefined) return; // If the plant is not recognized, exit

    if ((status == "CS")|| (status == "SS")){
        messages.setAttribute('fill', "rgb(250, 140, 140)");
    }
    else{
        messages.setAttribute('fill', "rgb(200, 255, 200)");
    }

    // const circleColor = status === "CS" ? "rgb(208, 16, 16)" : "rgb(36, 217, 36)";
    // const messageColor = status === "CS" ? "rgb(250, 140, 140)" : "rgb(200, 255, 200)" 
    console.log("hi");
    // const message = status === "CS" ? "Stopped" : "Running";

    // Update styles and messages
    // circles[index].style.backgroundColor = circleColor;
    console.log(index);
    // console.log(circles[index]);
    // messages[index].style.backgroundColor = messageColor;
    // messages[index].style.color = circleColor;
    // messages[index].innerHTML = message;
}

function updateStatus2(status, plant, messages) {
    const plantIndex = {
        "Relief Bush": 0,
        "Cedar Valley": 1,
        "Black Heath": 2
    };

    

    
    // Determine the index based on the plant name
    const index = plantIndex[plant];
    if (index === undefined) return; // If the plant is not recognized, exit

    const circleColor = status === "CS" ? "rgb(208, 16, 16)" : "rgb(36, 217, 36)";
    const messageColor = status === "CS" ? "rgb(250, 140, 140)" : "rgb(200, 255, 200)" 
    console.log("hi");
    const message = status === "CS" ? "Stopped" : "Running";

    console.log("Message: ");
    console.log(messages);

    // Update styles and messages
    // circles[index].style.backgroundColor = circleColor;
    console.log(index);
    // console.log(circles[index]);
    messages.style.backgroundColor = messageColor;
    messages.style.color = circleColor;
    messages.innerHTML = message;
}



// Example usage for crusher


// console.log("hello");

function fetchData(){

    // const crusherCircles = document.getElementsByClassName("crusher-status-circle");
    var crusherRect = document.getElementById('crusher');
    var screenRect = document.getElementById('screen');
    const conveyorRects = document.querySelectorAll('.conveyors');
      
      // Change the fill color
    // rect.setAttribute('fill', 'lightblue');

    const crusherMessages = document.getElementById("crusher-status-message");
    console.log(crusherMessages);
    // // const screenCircles = document.getElementsByClassName("screen-status-circle");
    const screenMessages = document.getElementById("screen-status-message");

    // console.log(crusherCircles);

    fetch("https://api.p-tea.com/status")
    .then(response => response.json())
    .then((data) => {
        // Log the received data for debugging
        console.log(data[0].plant);
        // if (data[0].machine === "Crusher") {
        //     updateStatus(data[0].code, data[0].plant, crusherMessages);
        // }
        
        // // Example usage for screen
        // if (data[0].machine === "Screen") {
        //     updateStatus(data[0].code, data[0].plant, screenMessages);
        // }
        data.forEach(entry => {
            if (entry.machine === "Crusher") {
                updateStatus(entry.code, entry.plant, crusherRect);
                updateStatus2(entry.code, entry.plant, crusherMessages);
            }
            if (entry.machine === "Screen") {
                updateStatus(entry.code, entry.plant, screenRect);
                updateStatus2(entry.code, entry.plant, screenMessages);

                if (entry.code == "SS"){
                    conveyorRects.forEach(rect => {
                        rect.setAttribute('fill', "rgb(250, 140, 140)"); // change to any color you like
                    });
                    document.querySelectorAll('.conveyorLines').forEach(i =>{
                        // i.setAttribute('stroke', "rgb(250, 140, 140)");
                        i.style.stroke = "rgb(250, 140, 140)"
                        console.log("Line");
                    })
                }
                else{
                    conveyorRects.forEach(rect => {
                        rect.setAttribute('fill', "rgb(200, 255, 200)"); // change to any color you like
                    });
                    document.querySelectorAll('.conveyorLines').forEach(i =>{
                        // i.setAttribute('stroke', "rgb(200, 255, 200)");
                        i.style.stroke = "rgb(200, 255, 200)";
                        // console.log(document.querySelectorAll('.conveyorLines'));
                    })
                }
            }
        })


    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

fetchData();
setInterval(fetchData, 5000);


// if (data.machine == "Crusher"){
//     if(data.code == "CS"){
//         if(data.plant == "Relief Bush"){
//             crusherCircles[0].style.backgroundColor = "red";
//             crusherMessages[0].style.backgroundColor = "red";
//             crusherMessages[0].innerHTML = "Stopped";
//         };
//         if(data.plant == "Cedar Valley"){
//             crusherCircles[1].style.backgroundColor = "red";
//             crusherMessages[1].style.backgroundColor = "red";
//             crusherMessages[1].innerHTML = "Stopped";
//         };
//         if(data.plant == "Black Heath"){
//             crusherCircles[2].style.backgroundColor = "red";
//             crusherMessages[2].style.backgroundColor = "red";
//             crusherMessages[2].innerHTML = "Stopped";
//         }
//     }
//     else{
//         if(data.plant == "Relief Bush"){
//             crusherCircles[0].style.backgroundColor = "green";
//             crusherMessages[0].style.backgroundColor = "green";
//             crusherMessages[0].innerHTML = "Running";
//         };
//         if(data.plant == "Cedar Valley"){
//             crusherCircles[1].style.backgroundColor = "green";
//             crusherMessages[1].style.backgroundColor = "green";
//             crusherMessages[1].innerHTML = "Running";
//         };
//         if(data.plant == "Black Heath"){
//             crusherCircles[2].style.backgroundColor = "green";
//             crusherMessages[2].style.backgroundColor = "green";
//             crusherMessages[2].innerHTML = "Running";
//         }
//     }

// }
