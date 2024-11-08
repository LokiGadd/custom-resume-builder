const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const path = require('path');
const ejs = require('ejs');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route to render the resume builder form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle resume generation
app.post('/generate-resume', async (req, res) => {
    const { name, email, phone, education, experience } = req.body;

    // Render the HTML resume template with the provided data
    const resumeHtml = await ejs.renderFile(path.join(__dirname, 'views', 'resume-template.ejs'), {
        name,
        email,
        phone,
        education,
        experience
    });

    // Launch puppeteer to create the PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(resumeHtml);
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    // Send the PDF as a download response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdfBuffer);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
