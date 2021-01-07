# M5-D13 Benchmark Platform API

# ROUTES

### Exams Main

##### /exams/

```sh
GET - /exams/questions, Returns Array of all available questions (Must use authorised ID in query)
```

```sh
GET - /exams/user/:id, Returns Object containing data for specific user (Must use authorised ID in query)
```

```sh
POST - /exams/register, Registers a new user
```

```sh
POST - /exams/:examId/start, Generates randomised questions for the exam and adds them to the exam object, then returns the data without answers (Must use authorised ID in query)
```

```sh
POST - /exams/:examId/submit, Submits the provided answers to the test, calculates the total score and returns the value, also adds score to the exam object and marks test as complete. (Must include userID in query)
```

### Questions Main

##### /questions/

```sh
GET - /questions/:questionID, Returns Object of the data for the requested question (Must use authorised ID in query)
```

```sh
POST - /questions/new, Adds a new question to the questions file (Must use authorised ID in query)
```

```sh
PUT - /questions/:questionID, Updates question data for the specified question (Must use authorised ID in query)
```

```sh
DELETE - /questions/:questionID, Deletes the question with the specified ID (Must use authorised ID in query)
```
