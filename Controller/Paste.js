const PasteModel = require("../Models/Paste");
const { axiosInstance } = require("../Services/Axios");
const { getLanguageId } = require("../Services/Judge0");
const { catchAsync } = require("../Utils/CatchAsync");

module.exports.createPaste = async (req, res, next) => {
  let paste = req.body;
  paste.createdBy = req.user._id;
  try {
    if (req.query.compile && paste.language && paste.language !== "plaintext") {
      const config = {
        params: { base64_encoded: "true", fields: "*" },
      };

      const response = await axiosInstance.post(
        "submissions",
        {
          language_id: getLanguageId(paste.language),
          source_code: paste.source,
          stdin: paste.stdin,
        },
        config
      );
      const data = await response.data;
      const submissionToken = data.token;
      setTimeout(async () => {
        const submissionResponse = await axiosInstance.get(
          `submissions/${submissionToken}`,
          {
            params: { base64_encoded: "true", fields: "*" },
          }
        );
        const submissionData = await submissionResponse.data;
        console.log("submissionData", submissionData);
        paste.output = submissionData.stdout;
        const createdPaste = await PasteModel.create(paste);
        if (createdPaste) {
          res.status(201).json({
            message: "Paste created successfully",
            data: createdPaste,
          });
        }
      }, 4000);
    } else {
      const createdPaste = await PasteModel.create(paste);
      if (createdPaste) {
        res
          .status(201)
          .json({ message: "Paste created successfully", data: createdPaste });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports.compileFile = async (req, res, next) => {
  try {
    let paste = {
      title: req.body.title,
      language: req.body.language,
      source: req.files["file"][0].buffer.toString("base64"),
      stdin: req.files["stdin"][0].buffer.toString("base64"),
      createdBy: req.user._id,
    };

    const config = {
      params: { base64_encoded: "true", fields: "*" },
    };

    const response = await axiosInstance.post(
      "submissions",
      {
        language_id: getLanguageId(paste.language),
        source_code: paste.source,
        stdin: paste.stdin,
      },
      config
    );
    const data = await response.data;
    const submissionToken = data.token;
    setTimeout(async () => {
      const submissionResponse = await axiosInstance.get(
        `submissions/${submissionToken}`,
        {
          params: { base64_encoded: "true", fields: "*" },
        }
      );
      const submissionData = await submissionResponse.data;
      console.log("submissionData", submissionData);
      paste.output = submissionData.stdout;
      const createdPaste = await PasteModel.create(paste);
      if (createdPaste) {
        res.status(201).json({
          message: "Paste created successfully",
          data: createdPaste,
        });
      }
    }, 4000);
  } catch (err) {
    console.log(err);
  }
};

module.exports.updatePaste = catchAsync(async (req, res, next) => {
  let paste = req.body;
  paste.createdBy = req.user._id;
  const originalPaste = await PasteModel.find({
    _id: paste._id,
    createdBy: paste.createdBy,
  });
  if (originalPaste.length != 0) {
    const updatedPaste = await PasteModel.findByIdAndUpdate(paste._id, paste, {
      new: true,
    });
    if (updatedPaste) {
      res
        .status(201)
        .json({ message: "Paste updated successfully", data: updatedPaste });
    } else {
      res
        .status(503)
        .json({ message: "Error updating paste", data: updatedPaste });
    }
  } else {
    res
      .status(403)
      .json({ message: "Update access forbidden", data: originalPaste });
  }
});

module.exports.deletePaste = catchAsync(async (req, res, next) => {
  let paste = req.body;
  paste.createdBy = req.user._id;
  const deletedPaste = await PasteModel.findOneAndDelete(paste);
  if (deletedPaste) {
    res.status(201).json({ message: "Paste deleted successfully" });
  } else {
    res.status(403).json({ message: "Paste deletion unsuccessful" });
  }
});

module.exports.viewPaste = catchAsync(async (req, res, next) => {
  const paste = await PasteModel.findById(req.params.id);
  if (paste) {
    res.status(201).json({ message: "Successful", data: paste });
  } else {
    res.status(404).json({ message: "Unsuccessful", data: paste });
  }
});

module.exports.userPastes = catchAsync(async (req, res, next) => {
  let page = req.query.page || 1;
  let limit = 5;
  let skip = (page - 1) * 5;
  const pastes = await PasteModel.find({ createdBy: req.user._id })
    .skip(skip)
    .limit(limit);
  if (pastes) {
    res.status(201).json({ message: "Request successfully", data: pastes });
  }
});
