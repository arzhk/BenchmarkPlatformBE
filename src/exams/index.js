const express = require("express");
const fs = require("fs");
const uniqid = require("uniqid");
const path = require("path");
const { check, validationResult } = require("express-validator");
const { join } = require("path");

const router = express.Router();

const readFileHandler = async (filename) => {
  const targetFile = JSON.parse(fs.readFileSync(join(__dirname, filename)).toString());
  return targetFile;
};

const writeFileHandler = (writeToFilename, file) => {
  try {
    fs.writeFileSync(path.join(__dirname, writeToFilename), JSON.stringify(file));
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const newUserHandler = async (data) => {
  const newUser = {
    _id: uniqid(),
    candidateFirstName: data.firstName,
    candidateSurname: data.surname,
    password: data.password,
    exams: [{ _examId: 123, examName: "admission test", isCompleted: false, examDuration: 60, questions: [] }],
  };
  return newUser;
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

const questionGenerator = async (numberOfQuestions) => {
  let questions = await readFileHandler("questions.json");
  let randomIndexes = [];
  let selectedQuestions = [];

  while (randomIndexes.length < numberOfQuestions) {
    randomIndexes.push(Math.floor(Math.random() * questions.length));
    randomIndexes = [...new Set(randomIndexes)];
  }

  for (let i = 0; i < randomIndexes.length; i++) {
    selectedQuestions.push(questions[randomIndexes[i]]);
  }
  return selectedQuestions;
};

router.get("/questions", async (req, res, next) => {
  try {
    if (req.query.id === "123") {
      const questions = await readFileHandler("questions.json");
      res.send(questions);
    } else {
      res.send("You are not authorised to access this information");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/user/:id", async (req, res, next) => {
  try {
    if (req.query.id === "123") {
      const users = await readFileHandler("users.json");
      const indexOfUser = users.findIndex((user) => user._id === req.params.id);
      if (indexOfUser !== -1) {
        res.send(users[indexOfUser]);
      } else {
        res.send(errorMessage(req.params.id, "User with that ID not found"));
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
  "/register",
  [
    check("firstName")
      .isLength({ min: 3 })
      .withMessage("First name is too short!")
      .exists()
      .withMessage("First Name is missing."),
    check("surname")
      .isLength({ min: 3 })
      .withMessage("Surname is too short!")
      .exists()
      .withMessage("Surname is missing."),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password is too short!")
      .exists()
      .withMessage("Password is missing."),
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
        let usersFile = await readFileHandler("users.json");
        const newUser = await newUserHandler(req.body);
        usersFile.push(newUser);
        writeFileHandler("users.json", usersFile);
        res.send(newUser);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.post("/:examId/start", async (req, res, next) => {
  try {
    if (req.params.examId === "123") {
      if (req.query.userID) {
        let users = await readFileHandler("users.json");
        const indexOfUser = users.findIndex((user) => user._id === req.query.userID);
        const indexOfExam = users[indexOfUser].exams.findIndex((exam) => exam._examId == req.params.examId);
        if (indexOfUser !== -1) {
          if (users[indexOfUser].exams[indexOfExam].isCompleted !== true) {
            if (users[indexOfUser].exams[indexOfExam].questions.length === 0) {
              const questions = await questionGenerator(5);
              users[indexOfUser].exams[indexOfExam].questions = questions;

              writeFileHandler("users.json", users);
              res.send(users[indexOfUser].exams[indexOfExam].questions);
            } else {
              res.send(users[indexOfUser].exams[indexOfExam].questions);
            }
          } else {
            res.send(errorMessage(req.params.examId, "User has already completed this exam", "?userID="));
          }
          res.send("aaa");
        } else {
          res.send(errorMessage(req.query.userID, "User with that ID not found"));
        }
      } else {
        res.send(errorMessage("", "userID is missing", "?userID="));
      }
    } else {
      res.send("Exam with that ID not found");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;