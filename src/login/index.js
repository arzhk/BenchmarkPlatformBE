const express = require("express");
const fs = require("fs");
const path = require("path");
const { join } = require("path");

const router = express.Router();

const readFileHandler = async (filename) => {
  const targetFile = JSON.parse(fs.readFileSync(join(__dirname, "../exams", filename)).toString());
  return targetFile;
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

router.post("/", async (req, res, next) => {
  try {
    let users = await readFileHandler("users.json");
    const indexOfUser = users.findIndex((user) => user._id === req.body.userID);
    if (indexOfUser !== -1) {
      if (users[indexOfUser].password === req.body.password) {
        delete users[indexOfUser].password;
        res.send(users[indexOfUser]);
      } else {
        res.send(errorMessage(req.params.userID, "Invalid username/password"));
      }
    } else {
      res.send(errorMessage(req.params.userID, "Invalid username/password"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
