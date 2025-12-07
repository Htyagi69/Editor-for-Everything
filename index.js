const express = require('express');
const ejs = require('ejs');
const path = require('path');
const multer=require('multer')
const puppeteer = require('puppeteer');
const fs=require('fs')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const app = express();
const PORT = 7000;

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
 const Path = path.resolve(__dirname,"views", 'uploads');
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null,Path)
  },
  filename:(req,file,cb)=>{
    cb(null,file.originalname)
  }
})

const upload=multer({storage})

app.post('/upload',upload.single('file'),(req,res)=>{
       res.send('file uploaded successfully')
})

app.get('/',(req,res)=>{
   res.render("form")
})
app.get('/upload',(req,res)=>{
   res.render("formedit")
})

app.post('/file', async (req, res) => {
  const {  content } = req.body;
  const data = {
    // title,
    content
  };

  try {
    const templatePath = path.resolve(__dirname,"views", 'template.ejs');
    const html = await ejs.renderFile(templatePath, data);

    const browser = await puppeteer.launch({
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true
    });

    const page = await browser.newPage();
    await page.setContent(html);

     console.log("HTML OUTPUT:");
     console.log(html);


    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    fs.writeFileSync('./sample.pdf', pdf);
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating PDF');
  }
});


// app.get('/edit', async (req, res) => {
//   try {
//     const existingPdfBytes = fs.readFileSync("./sample.pdf");
//     const pdfDoc = await PDFDocument.load(existingPdfBytes);
//     res.send(pdfDoc);
//     // res.redirect('/');

//     // res.setHeader("Content-Type", "application/pdf");
//     // res.setHeader("Content-Disposition", "inline; filename=editable.pdf");
//     // res.send(Buffer.from(pdfBytes));

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error editing PDF");
//   }
// });
app.get('/watermark', async (req, res) => {
  try {
    const existingPdfBytes = fs.readFileSync("./sample.pdf");
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Create a text field
    const nameField = form.createTextField("editableText");
    nameField.setText("Click to edit...");
    nameField.addToPage(pdfDoc.getPages()[0], {
      x: 50,
      y: 700,
      width: 300,
      height: 30,
      textColor: rgb(0, 0, 0),
      borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: 1,
      font: helveticaFont,
    });

    form.updateFieldAppearances(helveticaFont);

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=editable.pdf");
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing PDF");
  }
});





app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});   




// import  express from 'express'
// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// const app=express();

// const PORT=7000;

// app.use(express.json())
// app.use(express.urlencoded(false))

// const pdfDoc = await PDFDocument.create();

// // Embed a font
// const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

// // Add a blank page
// const page = pdfDoc.addPage();

// // Get page dimensions
// const { width, height } = page.getSize();

// // Draw text on the page
// const fontSize = 30;
// page.drawText('Hello, pdf-lib!', {
//   x: 50,
//   y: height - 4 * fontSize,
//   size: fontSize,
//   font: timesRomanFont,
//   color: rgb(0, 0.53, 0.71),
// });

// // Serialize the PDF to bytes (Uint8Array)
// const pdfBytes = await pdfDoc.save();

// // Save to file (Node.js)
// // fs.writeFileSync('output.pdf', pdfBytes);   

// app.get('/',(req,res)=>{
//     return res.json({message:"Hello"})
// })

// app.listen(PORT,()=>console.log(`http://localhost:${PORT}`))