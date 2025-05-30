// document.getElementById('generateReport').addEventListener('click', () => {
//     const { jsPDF } = window.jspdf;
//     const pdf = new jsPDF();

//     // Add a title
//     pdf.setFontSize(20);
//     pdf.text('Production Report', 10, 10);

//     // Add chart image
//     const ctx1 = document.getElementById('myChart').getContext('2d');
//     const chartImage = ctx1.canvas.toDataURL('image/png');
//     pdf.setFontSize(12)
//     pdf.text('Overview', 10, 20)
//     pdf.addImage(chartImage, 'PNG', 10, 25, 180, 100);

//     // Add some text
//     pdf.setFontSize(12);
//     pdf.text('This report contains sales data for the first half of the year.', 10, 140);

//     // Save the PDF
//     pdf.save('report.pdf');
//     // const { jsPDF } = window.jspdf;
 
//     //         let doc = new jsPDF('l', 'mm', [1500, 1400]);
//     //         let pdfjs = document.querySelector('#main');
 
//     //         doc.html(pdfjs, {
//     //             callback: function(doc) {
//     //                 doc.save("newpdf.pdf");
//     //             },
//     //             x: 12,
//     //             y: 12
//     //         });
// });


document.getElementById('download-submit').addEventListener('click', function(event){
    event.preventDefault();
    console.log("Download PDF clicked");
    downloadPDF();
});

document.getElementById('report-submit').addEventListener('click', function(event){
    event.preventDefault();
    console.log("Send email clicked");
    emailPDF();
});


function downloadPDF(){
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Add a title
    pdf.setFontSize(20);
    pdf.text('Production Report', 10, 10);

    // Add chart image
    const ctx1 = document.getElementById('myChart');
    const chartImage = ctx1.toDataURL('image/jpeg',1.0);
    console.log(chartImage);
    pdf.setFontSize(12)
    pdf.text('Overview', 10, 20);
    pdf.addImage(chartImage, 'JPEG', 10, 25, 180, 100);

    // Add some text
    pdf.setFontSize(12);
    pdf.text('This report contains sales data for the first half of the year.', 10, 140);

    // Save the PDF
    pdf.save('report.pdf');
}

function emailPDF(){
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Add a title
    pdf.setFontSize(20);
    pdf.text('Production Report', 10, 10);

    // Add chart image
    const ctx1 = document.getElementById('myChart');
    const chartImage = ctx1.toDataURL('image/jpeg',1.0);
    const email = document.getElementById("email").value;

    console.log(chartImage);
    pdf.setFontSize(12)
    pdf.text('Overview', 10, 20);
    pdf.addImage(chartImage, 'JPEG', 10, 25, 180, 100);

    // Add some text
    pdf.setFontSize(12);
    pdf.text('This report contains sales data for the first half of the year.', 10, 140);

    //Convert the PDF to Blob
    const pdfBlob = pdf.output('blob');

    // Send the PDF as part of a POST request
    const formData = new FormData();
    formData.append("file", pdfBlob, "report.pdf");  // Add the Blob with filename
    formData.append('email', email);

    fetch('https://api.p-tea.com/send-mail', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('PDF sent successfully:', data);
    })
    .catch(error => {
        console.error('Error sending PDF:', error);
    });
}

// document.getElementById('report-form').addEventListener('submit', function(event) {
//     event.preventDefault();

//     const submitButton = document.activeElement; // Get the currently focused button
//     console.log(submitButton);
//     if (submitButton.id === "download-submit") {
//         console.log("Download PDF clicked");
//     } else if (submitButton.id === "report-submit") {
//         console.log("Send to Email clicked");
//     }

//     const { jsPDF } = window.jspdf;
//     const pdf = new jsPDF();
//     const email = document.getElementById("email").value;
//     // Add a title
//     pdf.setFontSize(20);
//     pdf.text('Production Report', 10, 10);

//     // Add chart image
//     const ctx1 = document.getElementById('myChart');
//     // let coverPageImage = await this.$html2canvas(coverPage, options);
//     // console.log(ctx1);
//     const chartImage = ctx1.toDataURL('image/jpeg',1.0);
//     console.log(chartImage);
//     pdf.setFontSize(12)
//     pdf.text('Overview', 10, 20);
//     pdf.addImage(chartImage, 'JPEG', 10, 25, 180, 100);

//     // Add some text
//     pdf.setFontSize(12);
//     pdf.text('This report contains sales data for the first half of the year.', 10, 140);

//     // Convert the PDF to Blob
//     const pdfBlob = pdf.output('blob');

//     // Send the PDF as part of a POST request
//     const formData = new FormData();
//     formData.append("file", pdfBlob, "report.pdf");  // Add the Blob with filename
//     formData.append('email', email);

//     fetch('http://127.0.0.1:8000/send-mail', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('PDF sent successfully:', data);
//     })
//     .catch(error => {
//         console.error('Error sending PDF:', error);
//     });
// });