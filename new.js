const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function downloadHtmlAsPdf(htmlContent, pdfFilename = 'document.pdf') {
    const tempHtmlPath = path.join(__dirname, 'temp.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Log browser console messages
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Load the temporary HTML file
    await page.goto(`http://127.0.0.1:5500/chart.html`, { waitUntil: 'load' });

    // Optionally take a screenshot for debugging
    await page.screenshot({ path: 'screenshot.png' });

    // Generate the PDF
    await page.pdf({
        path: pdfFilename,
        format: 'A4',
        printBackground: true,
    });

    await browser.close();
    fs.unlinkSync(tempHtmlPath);

    console.log(`PDF saved as ${pdfFilename}`);
}

// Example HTML content (same as before)
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>John Doe's Performance Charts</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      @font-face {
        font-family: "Helvetica Neue";
        src: url("NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf")
          format("ttf");
        font-weight: lighter;
        font-style: normal;
      }
      body {
        font-family: "Helvetica Neue";
        display: flex;
        flex-direction: column;
        margin-left: 60px;
        width: 90%;
        background-color: #f4f4f4;
      }
      h2 {
        margin-bottom: 20px;
      }
      .chart-container {
        width: 86%;
        max-width: 800px;
        height: 300px;
      }
      .chart {
        position: relative;
        height: 400px;
        width: 100%;
      }
      table {
        width: 80%;
        max-width: 800px;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      table,
      th,
      td {
        border: 1px solid #ddd;
      }
      th,
      td {
        padding: 10px;
      }
      th {
        background-color: #f2f2f2;
      }
      .report-header {
        margin-bottom: 20px;
      }
      .report-header h1 {
        font-size: 24px;
        color: black;
        margin: 0;
      }
      .report-header p {
        margin: 5px 0;
      }
      .date {
        font-size: 14px;
        color: darkgrey;
      }
      .para {
        font-size: 14px;
        color: rgb(0, 0, 0);
      }
      .user-details {
        font-size: 12px;
        color: darkgrey;
      }
    </style>
  </head>
  <body>
    <div style="text-align: center; margin-bottom: 20px; width: 100%; margin-left: -30px;">
        <img src="./images/image5.png" alt="Image Description" style="width: 170px; height: auto;">
      </div>      
    <div class="report-header" style="margin-left: 0">
      <h1 style="margin-left: 0; font-weight: normal; margin-bottom: 10px">
        Weekly Progress Report
      </h1>
      <p class="date">29 July - 4 Aug 2024</p>
      <p id="userDetails" class="user-details"></p>
    </div>

    <h2 style="margin-top: 0; font-size: 16px; margin-bottom: 10px">
      Overview
    </h2>
    <div
      id="overviewTable"
      style="display: flex; align-items: left; width: 108%"
    ></div>

    <div class="report-header" style="margin-left: 0; margin-bottom: 0">
      <h1 style="font-size: 16px; margin-bottom: 10px">Daily Discipline</h1>
      <p class="para" style="margin-left: 0; margin-right: 70px">
        In UPSC preparation, consistency is the key. Daily discipline is based
        on your learning and its implementation in practising MCQs.
      </p>
    </div>

    <p
      style="
        margin-left: 10px;
        font-weight: 400;
        color: #6f6f6f;
        margin-bottom: 0px;
      "
    >
      MCQ Practice (all subjects)
    </p>
    <div class="chart-container">
      <canvas id="attemptedChart" class="chart"></canvas>
    </div>

    <p
      style="
        margin-left: 10px;
        font-weight: 400;
        color: #6f6f6f;
        margin-bottom: 0px;
      "
    >
      MCQ Accuracy (all subjects)
    </p>
    <div class="chart-container">
      <canvas id="accuracyChart" class="chart"></canvas>
    </div>

    <h2 style="font-size: 16px; margin-top: 0">Subject-wise Practice</h2>
    <div
      id="subjectPracticeTable"
      style="display: flex; align-items: left; width: 108%"
    ></div>

    <h2 style="font-size: 16px; margin-top: 0">Tests Attempted</h2>
    <div
      id="testsAttemptedTable"
      style="display: flex; align-items: left; width: 100%"
    ></div>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    <script>
      // Function to fetch and parse JSON data
      async function fetchData() {
        const response = await fetch('http://localhost:3000/data.json); // Ensure that 'data.json' is in the same directory
        const data = await response.json();
        return data;
      }

      // Function to extract data for John Doe
      function extractData(data) {
        const accuracyData = [];
        const attemptedData = [];
        const labels = [];

        // Find John Doe's data in MCQ Accuracy
        const mcqAccuracy = data["MCQ Accuracy"].find(
          (item) => item["Student Name"] === "John Doe"
        );
        const mcqAttempted = data["MCQ attempted"].find(
          (item) => item["Student Name"] === "John Doe"
        );

        if (mcqAccuracy && mcqAttempted) {
          for (const date in mcqAccuracy) {
            if (date !== "Phone Number" && date !== "Student Name") {
              labels.push(date);
              accuracyData.push(mcqAccuracy[date]);
              attemptedData.push(mcqAttempted[date]);
            }
          }
        }

        return { labels, accuracyData, attemptedData };
      }

      function extractTestData(data) {
        const tests = data.Tests.filter(
          (item) => item["Student Name"] === "John Doe"
        );

        return tests.map((test) => {
          return {
            testName: test["Test Name"],
            marks: test["Marks Achieved"],
            subjectsInvolved: test["Subjects"]
              ? test["Subjects"].join(", ")
              : "-",
            accuracy: (test.Accuracy * 100).toFixed(0) + "%",
          };
        });
      }

      // Function to extract overview data for John Doe
      function extractOverviewData(data) {
        // Filter the Overview data for John Doe
        const overview = data.Overview.filter(
          (item) => item["Student Name"] === "John Doe"
        );

        // Map the overview data to a format suitable for the table
        return overview.map((item) => {
          return {
            phoneNumber: item["Phone Number"],
            studentName: item["Student Name"],
            mcqAccuracy: (item["MCQ Accuracy"] * 100).toFixed(0) + "%", // Convert to percentage
            mcqMarks: item["MCQ Marks"],
            mainsMarks: item["Mains Marks"],
          };
        });
      }

      function getAccuracyColor(accuracy) {
        accuracy = parseInt(accuracy); // Convert accuracy to integer
        if (accuracy >= 80) {
          return "#54DF9C"; // Green
        } else if (accuracy >= 70) {
          return "#B4EB4E"; // Light Green
        } else if (accuracy >= 60) {
          return "#ffe975"; // Yellow
        } else if (accuracy >= 35) {
          return "#ffa666"; // Orange
        } else {
          return "#ff6767"; // Red
        }
      }

      function renderTestsTable(testData) {
        const tableContainer = document.getElementById("testsAttemptedTable");

        // Create table element
        const table = document.createElement("table");

        // Create table headers
        const headers = ["Test", "Subjects Involved", "Marks", "Accuracy"];
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        headers.forEach((headerText) => {
          const th = document.createElement("th");
          th.appendChild(document.createTextNode(headerText));
          th.style.backgroundColor = "#f3ecc7";
          th.style.color = "#8d6f17";
          th.style.fontWeight = "normal";
          th.style.fontSize = "12px";
          th.style.textAlign = "left";
          th.style.width = "15%";
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement("tbody");

        testData.forEach((test) => {
          const row = document.createElement("tr");

          const cells = [
            test.testName,
            test.subjectsInvolved,
            test.marks,
            test.accuracy,
          ];
          cells.forEach((cellText, index) => {
            const td = document.createElement("td");
            const span = document.createElement("span"); // Create a span inside the td

            if (index === 2) {
              // Split the marks into two parts
              const [marks, totalMarks] = cellText.split("/");

              const marksSpan = document.createElement("span");
              marksSpan.textContent = marks;
              marksSpan.style.fontSize = "14px";
              marksSpan.style.fontWeight = "bold";

              const totalMarksSpan = document.createElement("span");
              totalMarksSpan.textContent = "/" + totalMarks;
              totalMarksSpan.style.fontSize = "12px"; // Set font size for total marks

              span.appendChild(marksSpan);
              span.appendChild(totalMarksSpan);
            } else {
              span.appendChild(document.createTextNode(cellText));
            }

            if (index === 3) {
              span.style.backgroundColor = getAccuracyColor(cellText); // Apply background color to the span
            }

            td.appendChild(span);
            td.style.fontSize = "12px";
            td.style.whiteSpace = "nowrap";
            row.appendChild(td);
          });

          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
      }

      function extractSubjectData(data) {
        const subjects = data.Subjects.filter(
          (item) => item["Student Name"] === "John Doe"
        );

        return subjects.map((subject) => {
          return {
            subject: subject.Subject,
            mcqsPractised:
              subject["MCQ Attempted"] !== "-" ? subject["MCQ Attempted"] : "-",
            mcqMarks: subject["MCQ Marks"] !== "-" ? subject["MCQ Marks"] : "-",
            mcqAccuracy:
              subject["MCQ Accuracy"] !== "-"
                ? (subject["MCQ Accuracy"] * 100).toFixed(0) + "%"
                : "0%",
            mainsEvaluated:
              subject["Mains Qn Attempted"] !== "-"
                ? subject["Mains Qn Attempted"]
                : "-",
            mainsMarks:
              subject["Mains Marks"] !== "-" ? subject["Mains Marks"] : "-",
          };
        });
      }

      // Function to render the charts
      function renderCharts(labels, accuracyData, attemptedData) {
        // MCQ Attempted Chart
        const attemptedCtx = document
          .getElementById("attemptedChart")
          .getContext("2d");
        const attemptedChart = new Chart(attemptedCtx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "MCQ Attempted",
                data: attemptedData,
                backgroundColor: "rgba(255, 99, 132, 0.7)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              x: {
                grid: {
                  display: false, // Remove vertical grid lines
                },
                title: {
                  display: true,
                  text: "Date",
                },
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "MCQ Attempted",
                },
                grid: {
                  display: true, // Keep horizontal grid lines
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              datalabels: {
                color: "black",
                align: "start",
                anchor: "end",
                formatter: function (value) {
                  return value;
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            barPercentage: 0.6,
            layout: {
              padding: {
                top: 20,
                bottom: 20,
              },
            },
          },
        });

        // MCQ Accuracy Chart
        const accuracyCtx = document
          .getElementById("accuracyChart")
          .getContext("2d");
        const accuracyChart = new Chart(accuracyCtx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "MCQ Accuracy (%)",
                data: accuracyData,
                backgroundColor: "rgba(54, 162, 235, 0.7)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              x: {
                grid: {
                  display: false, // Remove vertical grid lines
                },
                title: {
                  display: true,
                  text: "Date",
                },
              },
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: "MCQ Accuracy (%)",
                },
                ticks: {
                  callback: function (value) {
                    return value + "%";
                  },
                },
                grid: {
                  display: true, // Keep horizontal grid lines
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return tooltipItem.raw + "%";
                  },
                },
              },
              datalabels: {
                color: "white",
                align: "end",
                anchor: "end",
                formatter: function (value) {
                  return value + "%";
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            barPercentage: 0.6,
            layout: {
              padding: {
                top: 20,
                bottom: 20,
              },
            },
          },
        });
      }

      // Function to render the overview table
      function renderOverviewTable(data) {
        console.log(data);
        const overviewTable = document.getElementById("overviewTable");
        const table = document.createElement("table");

        // Create table headers
        const headers = [ "MCQ Marks", "MCQ Accuracy", "Mains Marks"];
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        headers.forEach((headerText) => {
          const th = document.createElement("th");
          th.appendChild(document.createTextNode(headerText));
          th.style.backgroundColor = "#f3ecc7";
          th.style.color = "#8d6f17";
          th.style.fontWeight = "normal";
          th.style.fontSize = "12px";
          th.style.textAlign = "left";
          th.style.width = "15%";
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement("tbody");

        data.forEach((item) => {
          const row = document.createElement("tr");

          const cells = [
            item["mcqMarks"],
            item["mcqAccuracy"],
            item["mainsMarks"],
          ];

          cells.forEach((cellText, index) => {
            const td = document.createElement("td");
            const span = document.createElement("span"); // Create a span inside the td

            if (index === 0 || index === 2) {
              // Split the marks into two parts
              const [marks, totalMarks] = cellText.split("/");

              const marksSpan = document.createElement("span");
              marksSpan.textContent = marks;
              marksSpan.style.fontSize = "14px";
              marksSpan.style.fontWeight = "bold";

              const totalMarksSpan = document.createElement("span");
              totalMarksSpan.textContent = "/" + totalMarks;
              totalMarksSpan.style.fontSize = "12px"; // Set font size for total marks

              span.appendChild(marksSpan);
              span.appendChild(totalMarksSpan);
            } else {
              span.appendChild(document.createTextNode(cellText));
            }

            if (index === 1) {
              span.style.backgroundColor = getAccuracyColor(cellText); // Apply background color to the span
            }

            td.appendChild(span);
            td.style.fontSize = "12px";
            td.style.whiteSpace = "nowrap";
            row.appendChild(td);
          });

          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        overviewTable.appendChild(table);
      }

      function renderSubjectTable(subjectData) {
        const tableContainer = document.getElementById("subjectPracticeTable");

        // Create table element
        const table = document.createElement("table");

        // Create table headers
        const headers = [
          "Subject",
          "MCQs Practised",
          "MCQ Marks",
          "MCQ Accuracy",
          "Mains Evaluated",
          "Mains Marks",
        ];
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        headers.forEach((headerText) => {
          const th = document.createElement("th");
          th.appendChild(document.createTextNode(headerText));
          th.style.backgroundColor = "#f3ecc7";
          th.style.color = "#8d6f17";
          th.style.fontWeight = "normal";
          th.style.fontSize = "12px";
          th.style.textAlign = "left";
          th.style.width = "15%";
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement("tbody");

        subjectData.forEach((subject) => {
          const row = document.createElement("tr");

          const cells = [
            subject.subject,
            subject.mcqsPractised,
            subject.mcqMarks,
            subject.mcqAccuracy,
            subject.mainsEvaluated,
            subject.mainsMarks,
          ];

          cells.forEach((cellText, index) => {
            const td = document.createElement("td");
            const span = document.createElement("span"); // Create a span inside the td

            if (index === 2 || index === 5) {
              // Split the marks into two parts
              const [marks, totalMarks] = cellText.split("/");

              const marksSpan = document.createElement("span");
              marksSpan.textContent = marks;
              marksSpan.style.fontSize = "14px";
              marksSpan.style.fontWeight = "bold";

              const totalMarksSpan = document.createElement("span");
              totalMarksSpan.textContent = "/" + totalMarks;
              totalMarksSpan.style.fontSize = "12px"; // Set font size for total marks

              span.appendChild(marksSpan);
              span.appendChild(totalMarksSpan);
            } else {
              span.appendChild(document.createTextNode(cellText));
            }

            if (index === 3) {
              span.style.backgroundColor = getAccuracyColor(cellText); // Apply background color to the span
            }

            td.appendChild(span);
            td.style.fontSize = "12px";
            td.style.whiteSpace = "nowrap";
            row.appendChild(td);
          });

          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
      }

      function setUserDetails(data) {
        const userDetailsElement = document.getElementById("userDetails");

        // Extract John Doe's details
        const user = data["Overview"].find(
          (item) => item["Student Name"] === "John Doe"
        );

        if (user) {
          userDetailsElement.textContent = Lakshay | 9803223248;
        } else {
          userDetailsElement.textContent = "John Doe | 9803223248";
        }
      }
      // Main function to execute the script
      async function main() {
        const data = await fetchData();
        const { labels, accuracyData, attemptedData } = extractData(data);
        const overviewData = extractOverviewData(data);
        renderOverviewTable(overviewData);
        renderCharts(labels, accuracyData, attemptedData);

        const subjectData = extractSubjectData(data);
        renderSubjectTable(subjectData);
        setUserDetails(data);

        const testData = extractTestData(data);
        renderTestsTable(testData);
      }

     window.onload = main;
    </script>
  </body>
</html>
`

downloadHtmlAsPdf(htmlTemplate).catch(console.error);
