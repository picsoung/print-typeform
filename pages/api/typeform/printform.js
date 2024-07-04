import { getSession } from "next-auth/react";
import PDFDocument from "pdfkit";
import blobStream from "blob-stream";
import axios from "axios";
import SVGtoPDF from "svg-to-pdfkit";
export default async (req, res) => {
  // typeform/printform?form_id=abc123

  const session = await getSession({ req });
  console.log("session", session);
  if (!session) {
    res.send({ eror: "Not authorized" });
  }
  const { form_id } = req.query;
  const formDef = await fetch(`https://api.typeform.com/forms/${form_id}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((resp) => resp.json());

  if (!formDef) {
    res.send({ eror: "Error retrieving form" });
  }

  const doc = new PDFDocument();
  doc.pipe(res);
  doc.initForm();
  let title = doc.font("Helvetica-Bold").fontSize(18).text(formDef.title);
  doc.font("Helvetica").fontSize(12);
  let x = title.x;
  let y = title.y;

  await processFields(formDef.fields, doc, x, y);

  doc.fontSize(8).text("Printed by Typeform2PDF", x, doc.page.height - 30, {
    height: doc.page.height,
  });
  doc.end();
  res.writeHead(200, {
    "Content-Type": "application/pdf",
  });
};

const fetchImage = async function (src) {
  const image = await axios.get(src, {
    responseType: "arraybuffer",
  });
  return image.data;
};

const downloadImage = async (url) => {
  // First request to get headers only
  const headResponse = await axios.get(url);
  const contentType = headResponse.headers["content-type"];
  console.log(contentType);
  if (contentType === "image/svg+xml") {
    // If SVG, return the data as text
    const response = await axios.get(url);
    return response.data;
  } else {
    // For other types, return the data as an ArrayBuffer
    const response = await axios.get(url, { responseType: "arraybuffer" });
    console.log(response.data);
    return Buffer.from(response.data);
  }
};

function indexToLetter(index) {
  return String.fromCharCode(97 + index);
}

const resetFont = (doc) => {
  doc.fillColor("black").fontSize(12);
};

const processFields = async (fields, doc, x, y) => {
  for (const [index, field] of fields.entries()) {
    doc.moveDown(1); // Adjust for spacing after the question text
    let required = field.validations && field.validations.required;
    let q_txt = doc
      .font("Helvetica-Bold")
      .text(`${index + 1} - [${field.type}] ${field.title}`, {
        continued: required,
      });
    doc.font("Helvetica");
    if (required) {
      doc.fillColor("red").fontSize(12).text(" *", { continued: false });
      doc.moveDown(0.5);
      resetFont(doc);
    }

    if (field.type === "group") {
      // Handle group type if necessary
    } else if (
      field.type === "dropdown" ||
      field.type === "multiple_choice" ||
      field.type === "picture_choice"
    ) {
      if (field.properties.allow_multiple_selection) {
        let instruction_text = "Pick as many as you want";
        if (field.properties.validations) {
          if (
            field.properties.validations.min_selection &&
            field.properties.validations.max_selection
          ) {
            instruction_text = `Select ${field.properties.validations.min_selection} options`;
          } else {
            instruction_text = `Pick between ${field.properties.validations.min_selection} and ${field.properties.validations.max_selection} choices`;
          }
        }
        doc
          .fillColor("gray")
          .fontSize(8)
          .text(instruction_text, { oblique: true });
      }
      resetFont(doc);

      for (const [choiceIndex, choice] of field.properties.choices.entries()) {
        doc.moveDown(0.5);
        let opt = doc.text(`[ ] (${indexToLetter(choiceIndex)}) ${choice.label}`);
        console.log(choice.label, choice.attachment, opt.x, opt.y);
        if (choice.attachment && choice.attachment.type == "image") {
          const imageData = await downloadImage(choice.attachment.href);
          if (typeof imageData === "string") {
            // If imageData is a string, it's assumed to be SVG data
            await doc.addSVG(imageData, opt.x, opt.y, { width: 30 , preserveAspectRatio: "xMinYMin meet", assumePt: true});
            doc.moveDown(1);
          } else if (Buffer.isBuffer(imageData)) {
            // If imageData is a Buffer, it's assumed to be an image in a format like PNG or JPEG
            await doc.image(imageData, opt.x, opt.y,  { height: 30 });
          } else {
            console.error("Unsupported image data type");
          }
          //     y += 40; // Adjust for spacing after the image
          doc.moveDown(0.5);
        }
      }
      if (field.properties.allow_other_choice) {
        doc.moveDown(0.5);
        doc.text(`[ ] Other`);
        // doc.formText(`field.${field.id}`, 200, 20);
      }
    } else if (field.type === "yes_no" || field.type === "legal") {
      doc.text(`[ ] Yes`);
      doc.text(`[ ] No`);
    } else if (field.type === "short_text") {
      doc.text(`____________________________________________________`);
    } else if (field.type === "long_text") {
      doc.text(`____________________________________________________`);
      doc.text(`____________________________________________________`);
      doc.text(`____________________________________________________`);
    } else if (field.type != "statement") {
      // doc.text(q_txt);
      let txt = doc.text(`____________________________________________________`);
      console.log(txt.x, txt.y);
      // doc.formText(`field.${field.id}`, q_txt.x,300, 200, 20);
      doc.moveDown(0.5);
    }
  }
};

PDFDocument.prototype.addSVG = function (svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options), this;
};
