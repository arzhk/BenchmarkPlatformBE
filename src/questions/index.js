const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const { join } = require("path");
const { check, validationResult } = require("express-validator");

const router = express.Router();

const readFileHandler = async (filename) => {
  const targetFile = JSON.parse(fs.readFileSync(join(__dirname, "../exams", filename)).toString());
  return targetFile;
};

const writeFileHandler = (writeToFilename, file) => {
  try {
    fs.writeFileSync(path.join(__dirname, "../exams", writeToFilename), JSON.stringify(file));
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const errorMessage = (value, message, param = "_id", url = "url") => {
  const err = new Error();
  err.message = {
    errors: [
      {
        value: value,
        msg: message,
        param: param,
        location: url,
      },
    ],
  };
  err.httpStatusCode = 400;
  return err;
};

const newQuestionHandler = (reqBody) => {
  const newQuestion = {
    _id: uniqid(),
    duration: 30,
    text: reqBody.text,
    img: "https://demo-res.cloudinary.com/image/upload/sample.jpg",
    answers: reqBody.answers,
  };
  return newQuestion;
};

router.get("/:questionID", async (req, res, next) => {
  try {
    if (req.query.id === "123") {
      const questions = await readFileHandler("questions.json");
      const indexOfQuestion = questions.findIndex((question) => question._id === req.params.questionID);
      if (indexOfQuestion !== -1) {
        res.send(questions[indexOfQuestion]);
      } else {
        next(errorMessage(req.params.questionID, "Question with that ID not found."));
      }
    } else {
      let error = new Error();
      error.httpStatusCode = 401;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/new",
  [
    check("text")
      .isLength({ min: 10 })
      .withMessage("Question is too short!")
      .exists()
      .withMessage("Question text is missing."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        if (req.query.id === "123") {
          if (req.body.answers.length === 2 || req.body.answers.length === 4) {
            let correctAnswerIsAvailable = false;
            req.body.answers.forEach((question) => {
              if (correctAnswerIsAvailable === false) {
                if (question.isCorrect === true) {
                  correctAnswerIsAvailable = true;
                }
              }
            });
            if (correctAnswerIsAvailable === true) {
              let questions = await readFileHandler("questions.json");
              const newQuestion = newQuestionHandler(req.body);
              questions = [...questions, newQuestion];
              writeFileHandler("questions.json", questions);
              res.send(newQuestion);
            } else {
              next(
                errorMessage(
                  req.body.answers,
                  "No correct answer is available, please ensure there is at least 1 correct answer."
                )
              );
            }
          } else {
            next(errorMessage(req.body.answers, "Number of answers is invalid"));
          }
        } else {
          let error = new Error();
          error.httpStatusCode = 401;
          next(error);
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.put(
  "/:questionID",
  [
    check("text")
      .isLength({ min: 10 })
      .withMessage("Question is too short!")
      .exists()
      .withMessage("Question text is missing."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        if (req.body.answers.length === 2 || req.body.answers.length === 4) {
          let correctAnswerIsAvailable = false;
          req.body.answers.forEach((question) => {
            if (correctAnswerIsAvailable === false) {
              if (question.isCorrect === true) {
                correctAnswerIsAvailable = true;
              }
            }
          });
          if (correctAnswerIsAvailable === true) {
            let questions = await readFileHandler("questions.json");
            const indexOfQuestion = questions.findIndex((question) => question._id === req.params.questionID);
            if (indexOfQuestion !== -1) {
              questions[indexOfQuestion] = {
                ...questions[indexOfQuestion],
                text: req.body.text,
                answers: req.body.answers,
              };
              writeFileHandler("questions.json", questions);
              res.send("Successfully updated question");
            } else {
              next(errorMessage(req.params.questionID, "Question with that ID not found."));
            }
          } else {
            next(
              errorMessage(
                req.body.answers,
                "No correct answer is available, please ensure there is at least 1 correct answer."
              )
            );
          }
        } else {
          next(errorMessage(req.body.answers, "Number of answers is invalid"));
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.delete("/:questionID", async (req, res, next) => {
  try {
    if (req.query.id === "123") {
      let questions = await readFileHandler("questions.json");
      questions = questions.filter((question) => question._id !== req.params.questionID);

      if (questions.length !== 0) {
        writeFileHandler("questions.json", questions);
        res.send("Question successfully deleted.");
      } else {
        next(errorMessage(req.params.questionID, "No question with that ID found."));
      }
    } else {
      let error = new Error();
      error.httpStatusCode = 401;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
