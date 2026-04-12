import PDFDocument from "pdfkit";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

export const generateAgreementPDF = ({
  dealId,
  projectTitle,
  creatorName,
  investorName,
  amount,
  equity,
  valuation,
  date,
}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60 });
    const buffers = [];

    // collect PDF into buffer
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    ////////////////////////////////////////////////////////
    // HEADER
    ////////////////////////////////////////////////////////

    doc
      .fillColor("#1a1a2e")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("GENESIS PLATFORM", { align: "center" });

    doc
      .fillColor("#555555")
      .fontSize(11)
      .font("Helvetica")
      .text("Boosting African Innovation", { align: "center" });

    doc.moveDown(0.5);

    // horizontal line
    doc
      .moveTo(60, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#1a1a2e")
      .lineWidth(2)
      .stroke();

    doc.moveDown(1);

    ////////////////////////////////////////////////////////
    // TITLE
    ////////////////////////////////////////////////////////

    doc
      .fillColor("#1a1a2e")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("EQUITY INVESTMENT AGREEMENT", { align: "center" });

    doc.moveDown(0.3);

    doc
      .fillColor("#888888")
      .fontSize(10)
      .font("Helvetica")
      .text(`Deal Reference: ${dealId}`, { align: "center" });

    doc
      .fillColor("#888888")
      .fontSize(10)
      .text(`Date: ${date}`, { align: "center" });

    doc.moveDown(1.5);

    ////////////////////////////////////////////////////////
    // PARTIES SECTION
    ////////////////////////////////////////////////////////

    doc
      .fillColor("#1a1a2e")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("1. PARTIES");

    doc.moveDown(0.5);

    doc
      .fillColor("#333333")
      .fontSize(11)
      .font("Helvetica")
      .text(
        `This Equity Investment Agreement ("Agreement") is entered into as of ${date}, between:`
      );

    doc.moveDown(0.8);

    // Creator block
    doc
      .fillColor("#1a1a2e")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("PROJECT OWNER (Creator):");

    doc
      .fillColor("#333333")
      .font("Helvetica")
      .text(`Name: ${creatorName}`);

    doc
      .text(`Role: Project Creator / Company Representative`);

    doc.moveDown(0.8);

    // Investor block
    doc
      .fillColor("#1a1a2e")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("INVESTOR:");

    doc
      .fillColor("#333333")
      .font("Helvetica")
      .text(`Name: ${investorName}`);

    doc.text(`Role: Equity Investor`);

    doc.moveDown(1.5);

    ////////////////////////////////////////////////////////
    // INVESTMENT DETAILS
    ////////////////////////////////////////////////////////

    doc
      .fillColor("#1a1a2e")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("2. INVESTMENT DETAILS");

    doc.moveDown(0.5);

    // table-style box
    const tableTop = doc.y;
    const col1 = 60;
    const col2 = 280;
    const rowH = 28;

    const rows = [
      ["Project Name", projectTitle],
      ["Investment Amount", `${Number(amount).toLocaleString()} FCFA`],
      ["Equity Acquired", `${equity}%`],
      ["Project Valuation", valuation ? `${Number(valuation).toLocaleString()} FCFA` : "To be determined"],
      ["Platform", "Genesis Platform"],
    ];

    rows.forEach((row, i) => {
      const y = tableTop + i * rowH;

      // alternating row background
      if (i % 2 === 0) {
        doc
          .rect(col1, y, 490, rowH)
          .fillColor("#f5f5f5")
          .fill();
      }

      doc
        .fillColor("#1a1a2e")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(row[0], col1 + 8, y + 8, { width: 200 });

      doc
        .fillColor("#333333")
        .font("Helvetica")
        .text(row[1], col2, y + 8, { width: 280 });
    });

    doc.moveDown(rows.length * 1.2);

    ////////////////////////////////////////////////////////
    // TERMS & CONDITIONS
    ////////////////////////////////////////////////////////

    doc
      .fillColor("#1a1a2e")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("3. TERMS AND CONDITIONS");

    doc.moveDown(0.5);

    const terms = [
      `3.1  The Investor agrees to invest the amount specified above in exchange for the stated equity percentage in the project.`,
      `3.2  Funds will be held in escrow by Genesis Platform until this agreement is signed by both parties and validated by the platform administrator.`,
      `3.3  The equity percentage stated in this agreement represents the Investor's ownership share in the project as of the date of this agreement.`,
      `3.4  The Project Owner agrees to use the invested funds exclusively for the development and growth of the stated project.`,
      `3.5  Genesis Platform acts as a neutral facilitator and is not a legal party to this investment. The platform does not guarantee investment returns.`,
      `3.6  Both parties agree that this agreement is legally binding upon signature and that any disputes shall be resolved through mutual negotiation before seeking legal recourse.`,
      `3.7  This agreement is governed by the applicable laws of the jurisdiction of the Project Owner.`,
    ];

    terms.forEach((term) => {
      doc
        .fillColor("#333333")
        .fontSize(10)
        .font("Helvetica")
        .text(term, { align: "justify" });
      doc.moveDown(0.5);
    });

    doc.moveDown(1);

    ////////////////////////////////////////////////////////
    // PLATFORM CLAUSE
    ////////////////////////////////////////////////////////

    doc
      .fillColor("#1a1a2e")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("4. ESCROW & FUND RELEASE");

    doc.moveDown(0.5);

    doc
      .fillColor("#333333")
      .fontSize(10)
      .font("Helvetica")
      .text(
        `4.1  Investment funds are held in escrow by Genesis Platform upon payment confirmation.`,
        { align: "justify" }
      );

    doc.moveDown(0.3);

    doc.text(
      `4.2  Funds will be released to the Project Owner only after both parties have submitted signed copies of this agreement and the platform administrator has validated the signatures.`,
      { align: "justify" }
    );

    doc.moveDown(0.3);

    doc.text(
      `4.3  In the event that either party fails to sign within 30 days, Genesis Platform reserves the right to initiate a refund process.`,
      { align: "justify" }
    );

    doc.moveDown(2);

    ////////////////////////////////////////////////////////
    // SIGNATURE SECTION
    ////////////////////////////////////////////////////////

    // line
    doc
      .moveTo(60, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#cccccc")
      .lineWidth(1)
      .stroke();

    doc.moveDown(1);

    doc
      .fillColor("#1a1a2e")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("5. SIGNATURES");

    doc.moveDown(1);

    const sigY = doc.y;

    // Investor signature box
    doc
      .rect(60, sigY, 220, 80)
      .strokeColor("#cccccc")
      .lineWidth(1)
      .stroke();

    doc
      .fillColor("#1a1a2e")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("INVESTOR", 60, sigY + 10, { width: 220, align: "center" });

    doc
      .fillColor("#888888")
      .fontSize(9)
      .font("Helvetica")
      .text(investorName, 60, sigY + 28, { width: 220, align: "center" });

    doc
      .fillColor("#aaaaaa")
      .fontSize(8)
      .text("Signature:", 70, sigY + 50);

    doc
      .moveTo(115, sigY + 68)
      .lineTo(270, sigY + 68)
      .strokeColor("#aaaaaa")
      .stroke();

    doc
      .fillColor("#aaaaaa")
      .fontSize(8)
      .text("Date: _______________", 70, sigY + 72);

    // Creator signature box
    doc
      .rect(320, sigY, 220, 80)
      .strokeColor("#cccccc")
      .lineWidth(1)
      .stroke();

    doc
      .fillColor("#1a1a2e")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("PROJECT OWNER", 320, sigY + 10, { width: 220, align: "center" });

    doc
      .fillColor("#888888")
      .fontSize(9)
      .font("Helvetica")
      .text(creatorName, 320, sigY + 28, { width: 220, align: "center" });

    doc
      .fillColor("#aaaaaa")
      .fontSize(8)
      .text("Signature:", 330, sigY + 50);

    doc
      .moveTo(375, sigY + 68)
      .lineTo(530, sigY + 68)
      .strokeColor("#aaaaaa")
      .stroke();

    doc
      .fillColor("#aaaaaa")
      .fontSize(8)
      .text("Date: _______________", 330, sigY + 72);

    doc.moveDown(5);

    ////////////////////////////////////////////////////////
    // FOOTER
    ////////////////////////////////////////////////////////

    doc
      .moveTo(60, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#cccccc")
      .lineWidth(1)
      .stroke();

    doc.moveDown(0.5);

    doc
      .fillColor("#aaaaaa")
      .fontSize(8)
      .font("Helvetica")
      .text(
        `This document was generated by Genesis Platform on ${date}. Deal ID: ${dealId}`,
        { align: "center" }
      );

    doc.end();
  });
};

////////////////////////////////////////////////////////
// UPLOAD PDF BUFFER TO CLOUDINARY
////////////////////////////////////////////////////////

export const uploadPDFToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "genesis-agreements-docs",
          public_id: filename,
          resource_type: "auto",
          format: "pdf",
          access_mode: "public",   // ← add this
          type: "upload",          // ← add this
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
  
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });
  };