
import Transaction from "../models/Transactions.model.js";

export const generateReceipt = async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await Transaction.findById(transactionId)
    .populate("project")
    .populate("investor");
  
  if (!transaction || transaction.status !== "success") {
    return res.status(404).json({ message: "Valid transaction not found" });
  } 
  
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${transaction.transactionReference}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("Investment Receipt", { align: "center" });
  doc.moveDown();

  doc.text(`Investor: ${transaction.investor.name}`);
  doc.text(`Project: ${transaction.project.title}`);
  doc.text(`Amount: ${transaction.amount} FCFA`);
  doc.text(`Reference: ${transaction.transactionReference}`);
  doc.text(`Date: ${transaction.createdAt}`);

  doc.end();
};