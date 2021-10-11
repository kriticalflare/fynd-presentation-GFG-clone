const express = require("express");
const PasteRoutes = express.Router();
const PasteController = require("../Controller/Paste");
const passport = require("passport");
const { userVerification } = require("../Middleware/UserVerification");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

PasteRoutes.get("/viewpaste/:id", PasteController.viewPaste);
PasteRoutes.use(passport.authenticate("jwt", { session: false }));
PasteRoutes.use(userVerification);
PasteRoutes.put("/createpaste", PasteController.createPaste);
PasteRoutes.put(
  "/compilefile",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "stdin", maxCount: 1 },
  ]),
  PasteController.compileFile
);
PasteRoutes.post("/updatepaste", PasteController.updatePaste);
PasteRoutes.delete("/deletepaste", PasteController.deletePaste);
PasteRoutes.get("/userpastes", PasteController.userPastes);

module.exports = PasteRoutes;
