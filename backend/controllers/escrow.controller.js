import Escrow from "../models/Escrow.model.js";

export const uploadAgreement = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findById(escrowId);

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    if (escrow.status !== "holding") {
      return res.status(400).json({
        message: "Escrow already processed",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Agreement file required",
      });
    }

    //////////////////////////////////////////////////
    // Determine who is uploading
    //////////////////////////////////////////////////

    const userId = req.user._id.toString();

    if (userId === escrow.investor.toString()) {
      escrow.agreement.investorSignedUrl = req.file.path;
      escrow.agreement.investorSigned = true;
    }

    else if (userId === escrow.creator.toString()) {
      escrow.agreement.creatorSignedUrl = req.file.path;
      escrow.agreement.creatorSigned = true;
    }

    else {
      return res.status(403).json({
        message: "Not authorized for this escrow",
      });
    } 

    await escrow.save();

    res.status(200).json({
      message: "Agreement uploaded successfully",
      escrow,
    });

  } catch (error) {
    res.status(500).json({
      message: "Agreement upload failed",
      error: error.message,
    });
  }
};
