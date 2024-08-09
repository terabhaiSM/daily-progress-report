const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('fontkit');
const XLSX = require('xlsx');

async function generatePDF() {
    // Load the Excel file
    const workbook = XLSX.readFile('./Test Sheet (1).xlsx');

    // Get data from each sheet
    const overviewData = XLSX.utils.sheet_to_json(workbook.Sheets['Overview']);
    const subjectsData = XLSX.utils.sheet_to_json(workbook.Sheets['Subjects']);
    const testsData = XLSX.utils.sheet_to_json(workbook.Sheets['Tests']);
    const mcqAttemptedData = XLSX.utils.sheet_to_json(workbook.Sheets['MCQ attempted']);
    const mcqAccuracyData = XLSX.utils.sheet_to_json(workbook.Sheets['MCQ Accuracy']);

    for (const student of overviewData) {
        const { 'Phone Number': phoneNumber, 'Student Name': studentName, 'MCQ Accuracy': mcqAccuracy, 'MCQ Marks': mcqMarks, 'Mains Marks': mainsMarks } = student;

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);
 
        const page = pdfDoc.addPage([595, 842]); // A4 size in points

        // Load fonts
        const fontBytes = fs.readFileSync('./NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf');
        const font = await pdfDoc.embedFont(fontBytes);

        // Set the title and metadata
        pdfDoc.setTitle(`SuperKalam Weekly Report for ${studentName}`);
        page.setFont(font);
        page.setFontSize(12);

        // Draw the header
        page.drawText('SuperKalam Weekly Report', { x: 50, y: 780, size: 20 });
        page.drawText(`${phoneNumber}`, { x: 400, y: 780, size: 12 });
        page.drawText('29 July - 4 Aug 2024', { x: 50, y: 760, size: 12 });
        page.drawText('Weekly Progress Report', { x: 50, y: 740, size: 12 });
        page.drawText(`Name: ${studentName}`, { x: 50, y: 720, size: 12 });
        page.drawText(`Batch: -`, { x: 300, y: 720, size: 12 });

        // Draw the overview
        page.drawText('Overview', { x: 50, y: 700, size: 14, color: rgb(0.2, 0.2, 0.7) });
        page.drawText(`MCQ Marks: ${mcqMarks}`, { x: 50, y: 680, size: 12 });
        page.drawText(`MCQ Accuracy: ${(mcqAccuracy * 100).toFixed(2)}%`, { x: 50, y: 660, size: 12 });
        page.drawText(`Mains Marks: ${mainsMarks}`, { x: 50, y: 640, size: 12 });

        // Draw the subject-wise practice table
        page.drawText('Subject-wise practice', { x: 50, y: 620, size: 14, color: rgb(0.2, 0.2, 0.7) });

        // Define table columns
        const subjectColumns = ['Subject', 'MCQ Marks', 'MCQ Attempted', 'MCQ Accuracy', 'Mains Marks', 'Mains Qn Attempted'];

        // Draw table headers
        let yPosition = 600;
        subjectColumns.forEach((col, index) => {
            page.drawText(col, { x: 50 + index * 100, y: yPosition, size: 10, color: rgb(0.8, 0, 0) });
        });

        // Draw table rows
        yPosition -= 20;
        subjectsData.filter(row => row['Phone Number'] === phoneNumber).forEach((row, rowIndex) => {
            page.drawText(row['Subject'], { x: 50, y: yPosition - rowIndex * 20, size: 10 });
            page.drawText(`${row['MCQ Marks']}`, { x: 150, y: yPosition - rowIndex * 20, size: 10 });
            page.drawText(`${row['MCQ Attempted']}`, { x: 250, y: yPosition - rowIndex * 20, size: 10 });
            page.drawText(`${(row['MCQ Accuracy'] * 100).toFixed(2)}%`, { x: 350, y: yPosition - rowIndex * 20, size: 10 });
            page.drawText(`${row['Mains Marks']}`, { x: 450, y: yPosition - rowIndex * 20, size: 10 });
            page.drawText(`${row['Mains Qn Attempted']}`, { x: 550, y: yPosition - rowIndex * 20, size: 10 });
        });

        // Draw the tests attempted table
        yPosition -= 40;
        page.drawText('Tests Attempted', { x: 50, y: yPosition, size: 14, color: rgb(0.2, 0.2, 0.7) });

        // Define table columns for tests
        const testColumns = ['Test Name', 'Subject', 'Marks Achieved', 'Accuracy'];

        // Draw table headers for tests
        yPosition -= 20;
        testColumns.forEach((col, index) => {
            page.drawText(col, { x: 50 + index * 100, y: yPosition, size: 10, color: rgb(0.8, 0, 0) });
        });

        // Draw table rows for tests
        yPosition -= 20;
        testsData.filter(row => row['Phone Number'] === phoneNumber).forEach((row, rowIndex) => {
            page.drawText(row['Test Name'], { x: 50, y: yPosition - rowIndex * 20, size: 10 });
            page.drawText(`${row['Subject']}`, { x: 150, y: yPosition - rowIndex * 20, size: 10 });
            page.drawText(`${row['Marks Achieved']}`, { x: 250, y: yPosition - rowIndex * 20, size: 10 });
            page.drawText(`${(row['Accuracy'] * 100).toFixed(2)}%`, { x: 350, y: yPosition - rowIndex * 20, size: 10 });
        });

        // Serialize the PDFDocument to bytes and write it to a file
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(`SuperKalam_Weekly_Report_${phoneNumber}.pdf`, pdfBytes);
        console.log(`Generated PDF for ${studentName} (${phoneNumber})`);
    }
}

generatePDF().catch(err => console.error('Error generating PDF:', err));
