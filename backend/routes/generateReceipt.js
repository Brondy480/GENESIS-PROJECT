import express from "express"
import { generateReceipt } from "../controllers/receiptGenerator";


const router = express.Router()

router.get("/receipt/:transactionId", generateReceipt);
 