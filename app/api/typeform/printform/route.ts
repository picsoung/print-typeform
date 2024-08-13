import { NextResponse, NextRequest } from 'next/server';
import { auth } from "@/auth"
// import PDFDocument from '@/lib/pdfdoc';
import PDFDocument from "pdfkit";
import axios from "axios";
import qr from "qr-image";
import fs from "fs";

import SVGtoPDF from "svg-to-pdfkit";

export async function GET(request: NextRequest, response: NextResponse) {
    const session = await auth();
    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const form_id = request.nextUrl.searchParams.get('form_id');
    if (!form_id) {
        return NextResponse.json({ error: "Missing form_id" }, { status: 400 });
    }
    // try {
    const formDef = await fetch(`https://api.typeform.com/forms/${form_id}`, {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    }).then((resp) => resp.json());

    if (!formDef) {
        return NextResponse.json({ error: "Error retrieving form" }, { status: 500 });
    }

    // Create a new PDF document
    try {
        const pdfData = await createPDF(formDef);
        return new NextResponse(pdfData, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
            },
        });

    }
    catch (e) {
        console.log('errr', e)
        return NextResponse.json({ message: `ERROR ${e}` });
    }

    // return NextResponse.json({ message: "Test route is working" });

}

const createPDF = (formDef: any) => {
    return new Promise<Buffer>(async (resolve, reject) => {
        try {
            console.time('Creating PDF');
            const pdfDoc = new PDFDocument();
            const title = pdfDoc.font("Helvetica-Bold").fontSize(18).text(formDef.title);
            pdfDoc.font("Helvetica").fontSize(12);
            let x = title.x;
            let y = title.y;
            console.log('xxx', x)

            await processFields(formDef.fields, pdfDoc, x, y);

            pdfDoc.fontSize(8).text("Printed by Typeform2PDF", x, pdfDoc.page.height - 30, {
                height: pdfDoc.page.height,
            });
            var code = qr.imageSync(formDef._links.display, { type: 'png' });
            pdfDoc.image(code, pdfDoc.page.width - 100, pdfDoc.page.height - 100, { width: 100 });

            const buffers: Buffer[] = [];
            pdfDoc.on('data', buffers.push.bind(buffers));

            pdfDoc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            pdfDoc.end();
            console.timeEnd('Creating PDF');
        } catch (error) {
            reject(error);
        }
    });
}

const fetchImage = async function (src) {
    const image = await axios.get(src, {
        responseType: "arraybuffer",
    });
    return image.data;
};

PDFDocument.prototype.addSVG = function (svg, x, y, options) {
    return SVGtoPDF(this, svg, x, y, options), this;
};

const downloadImage = async (url) => {
    // First request to get headers only
    const headResponse = await axios.get(url);
    const contentType = headResponse.headers["content-type"];
    if (contentType === "image/svg+xml") {
        // If SVG, return the data as text
        const response = await axios.get(url);
        return response.data;
    } else {
        // For other types, return the data as an ArrayBuffer
        const response = await axios.get(url, { responseType: "arraybuffer" });
        // console.log(response.data);
        return Buffer.from(response.data);
    }
};

function indexToLetter(index) {
    return String.fromCharCode(97 + index);
}

const resetFont = (doc) => {
    doc.font("Helvetica").fillColor("black").fontSize(12);
    doc.x = 72
};

const renderField = async (field, doc, index?) => {
    if (
        field.type === "dropdown" ||
        field.type === "multiple_choice" ||
        field.type === "picture_choice" ||
        field.type === "ranking"
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
            if (choice.attachment && choice.attachment.type == "image") {
                const imageData = await downloadImage(choice.attachment.href);
                if (typeof imageData === "string") {
                    // If imageData is a string, it's assumed to be SVG data
                    await doc.addSVG(imageData, opt.x, opt.y, {
                        width: 30,
                        preserveAspectRatio: "xMinYMin meet",
                        assumePt: true,
                    });
                    doc.moveDown(1);
                } else if (Buffer.isBuffer(imageData)) {
                    // If imageData is a Buffer, it's assumed to be an image in a format like PNG or JPEG
                    await doc.image(imageData, opt.x, opt.y, { height: 30 });
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
    } else if (field.type === "email") {
        doc.text(`______________________________@______________________`);
    } else if (field.type === "short_text") {
        doc.text(`____________________________________________________`);
    } else if (field.type === "long_text") {
        doc.text(`____________________________________________________`);
        doc.text(`____________________________________________________`);
        doc.text(`____________________________________________________`);
    } else if (field.type === "opinion_scale" || field.type === "rating") {
        doc.moveDown(0.5);
        const optionSpacing = 40; // Space between options
        let originalX = doc.x;
        let startX = doc.x;
        let startY = doc.y;
        let options = generateStepsText(field.properties);
        options.forEach((option) => {
            drawRadioButton(
                doc,
                startX,
                startY,
                field.properties.shape || "",
                option
            );
            startX += optionSpacing; // Move down for the next button
        });
        doc.x = originalX;
    } else if (field.type === "date") {
        const structure = field.properties.structure;
        const separator = field.properties.separator;
        let date_text = "";
        switch (structure) {
            case "DDMMYYYY":
                date_text = `DD${separator}MM${separator}YYYY`;
            case "MMDDYYYY":
                date_text = `MM${separator}DD${separator}YYYY`;
            case "YYYYMMDD":
                date_text = `YYYY${separator}MM${separator}DD`;
        }
        doc
            .fillColor("gray")
            .fontSize(10)
            .text(`Format: ${date_text}`, { oblique: true });
        doc.moveDown(0.5);
        resetFont(doc);
        doc.text(`${date_text.replace(/[a-zA-Z]/g, "_")}`);
    } else if (field.type === "address") {
        for (const [groupIndex, groupField] of field.properties.fields.entries()) {
            displayQuestionTitle(doc, groupField, index, groupIndex, true);
            await renderField(groupField, doc, index);
        }
    } else if (field.type != "statement") {
        doc.text(`____________________________________________________`);
    }
    doc.moveDown(1);
};
const displayQuestionTitle = (doc, field, index, groupIndex?, isGroup?) => {
    let required = field.validations && field.validations.required;
    let groupIndexTxt = isGroup ? `.${indexToLetter(groupIndex)}` : "";
    if (isGroup) {
        doc.x += 20
    }
    let q_txt = doc
        .font("Helvetica-Bold")
        .text(`${index + 1}${groupIndexTxt} - [${field.type}] ${field.title}`, {
            continued: required,
        });
    if (field.properties && field.properties.description) {
        doc
            .fillColor("gray")
            .fontSize(10)
            .text(field.properties.description, { oblique: true });
    }
    resetFont(doc);
    if (required) {
        doc.fillColor("red").fontSize(12).text(" *", { continued: false });
        doc.moveDown(0.5);
        resetFont(doc);
    }
};


const processFields = async (fields, doc, x, y) => {
    for (const [index, field] of fields.entries()) {
        doc.moveDown(1); // Adjust for spacing after the question text
        if (doc.y >= doc.page.height - 150) { //add new page if last question is too close to the end
            doc.addPage()
        }
        displayQuestionTitle(doc, field, index);

        if (
            field.type === "group" ||
            field.type === "contact_info" ||
            field.type === "matrix" ||
            field.type === "address"
        ) {
            // Handle group type if necessary
            for (const [
                groupIndex,
                groupField,
            ] of field.properties.fields.entries()) {
                displayQuestionTitle(doc, groupField, index, groupIndex, true);
                await renderField(groupField, doc, index);
            }
        } else {
            await renderField(field, doc, index);
        }
    }
};

function drawRadioButton(doc, x, y, shape, text) {
    if (shape) {
        const readFileAsync = fs.readFileSync(`public/shapes/${shape}.svg`, "utf8");
        doc.addSVG(readFileAsync, x, y, {
            width: 30,
            preserveAspectRatio: "xMinYMin meet",
            assumePt: true,
        });
    } else {
        doc.circle(x, y, 5).stroke(); // Draw the circle
        doc.text(text, x + 10, y - 5); // Draw the text label
    }
    doc.moveDown(0.5);
}

function generateStepsText(properties) {
    let stepsArray: string[] = [];
    let startAt = properties.start_at_one ? 1 : 0;
    let endAt = startAt + properties.steps - 1; // Adjust for inclusive range

    for (let i = startAt; i <= endAt; i++) {
        let stepText = `${i}`; // Customize this text as needed
        stepsArray.push(stepText);
    }

    return stepsArray;
}