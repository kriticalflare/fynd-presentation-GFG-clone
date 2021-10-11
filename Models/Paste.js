const mongoose = require("mongoose");
const pasteSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    enum: ["plaintext", "C++", "Java", "Python", "Js"],
    required: true,
    default: "plaintext",
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  output: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Paste", pasteSchema);
