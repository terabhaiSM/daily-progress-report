const puppeteer = require('puppeteer');
const fs = require('fs');
const XLSX = require('xlsx');

async function generatePDF() {
    // Load the Excel file
    const workbook = XLSX.readFile('./Test Sheet (1).xlsx');
    const overviewData = XLSX.utils.sheet_to_json(workbook.Sheets['Overview']);
    const subjectsData = XLSX.utils.sheet_to_json(workbook.Sheets['Subjects']);
    const testsData = XLSX.utils.sheet_to_json(workbook.Sheets['Tests']);

    for (const student of overviewData) {
        const { 'Phone Number': phoneNumber, 'Student Name': studentName, 'MCQ Accuracy': mcqAccuracy, 'MCQ Marks': mcqMarks, 'Mains Marks': mainsMarks } = student;

        // Replace placeholders in HTML template
        let htmlContent = fs.readFileSync('./template.html', 'utf8');
        htmlContent = htmlContent.replace('{{MCQ Marks}}', mcqMarks);
        htmlContent = htmlContent.replace('{{MCQ Accuracy}}', (mcqAccuracy * 100).toFixed(2) + '%');
        htmlContent = htmlContent.replace('{{Mains Marks}}', mainsMarks);

        // More replacements can be done here for the table data

        // Generate PDF with Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        fs.writeFileSync(`SuperKalam_Weekly_Report_${phoneNumber}.pdf`, pdfBuffer);
        console.log(`Generated PDF for ${studentName} (${phoneNumber})`);
    }
}

generatePDF().catch(err => console.error('Error generating PDF:', err));
