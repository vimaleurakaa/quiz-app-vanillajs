const appConfig = {
  quizInstructions: document.getElementById("quiz__instructions"),
  quizStart: document.getElementById("start-button"),
  loader: document.getElementById("loader-view"),
  quizContainer: document.getElementById("quiz"),
  question: document.getElementById("question"),
  optionsContainer: document.getElementById("options-container"),
  nextQuestion: document.getElementById("next-question"),
  submitButton: document.getElementById("submit-button"),
  questionSerial: document.getElementById("question-serial"),
  quizResultContainer: document.getElementById("quiz-result-container"),
  quizResults: document.getElementById("quiz-results"),
  quizRetry: document.getElementById("quiz-retry"),
  API: "./data/db.json",
  quizData: {},
  stackTrace: 0,
  score: 0,
  selectedState: false,
};

const fetchQuizData = ({ API, quizContainer }) => {
  return new Promise((resolve, reject) => {
    fetch(API)
      .then((raw) => raw.json())
      .then((data) => {
        appConfig.quizData = { ...{ ...data } };
        quizContainer.classList.remove("none");
        return resolve(data);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

const quizOptions = (option, index) => {
  const _id = (Math.random() + 1).toString(36).substring(8);
  return `<label for='${_id}'><input type="radio" id='${_id}' name="quiz-option" value='${index}'>${option}</label>`;
};

const quizResultsFragment = ({ quizResults, score, quizResultContainer }, data) => {
  quizResultContainer.classList.remove("none");
  const h3 = document.createElement("h3");
  const h2 = document.createElement("h2");
  const p1 = document.createElement("p");
  const p2 = document.createElement("p");
  h3.className = "mt-0 mb-0";
  h2.classList.add("error-text");
  p1.innerText = "Your Attempt";
  p2.innerText = `Correct Answers : ${score / 10}/${data.length}`;
  h2.innerText = `Score : ${score}`;
  const average = (score / (data.length * 10)) * 100;
  average >= 70 ? (h3.innerText = "Congratulations! 🥳") : (h3.innerText = "Try again!🥲");

  quizResults.append(h3, p1, p2, h2);
};

const domResets = (app) => {
  const { nextQuestion, question, optionsContainer, submitButton, quizResultContainer } = app;
  question.innerText = "";
  optionsContainer.innerHTML = "";
  submitButton.classList.remove("none");
  submitButton.setAttribute("disabled", "true");
  nextQuestion.classList.add("none");
  nextQuestion.innerText = "Next";
  quizResultContainer.classList.add("none");
};

const quizHandler = ({ stackTrace, quizData: { data }, question, optionsContainer, submitButton, questionSerial, quizContainer, nextQuestion }) => {
  domResets(appConfig);
  if (data && stackTrace < data.length) {
    questionSerial.innerText = `${stackTrace + 1} / ${data?.length}`;
    question.innerText = data[stackTrace].question;
    [...data[stackTrace].options]?.map((value, _i) => {
      optionsContainer.innerHTML += quizOptions(value, _i);
    });

    appConfig.options = document.querySelectorAll(".list-group input");
    quizSelectHandler(appConfig);
    submitButton.addEventListener("click", quizSubmitHandler);
  } else {
    quizResultsFragment(appConfig, data);
    quizContainer.classList.add("none");
  }
};

const quizSelectHandler = ({ options, submitButton }) => {
  [...options].forEach((option) => {
    option.addEventListener("click", () => {
      appConfig.selectedState = true;
      if (appConfig.selectedState) {
        submitButton.removeAttribute("disabled");
      }
    });
  });
};

const quizSubmitHandler = () => {
  const {
    options,
    selectedState,
    stackTrace,
    nextQuestion,
    submitButton,
    quizData: { data },
  } = appConfig;
  if (selectedState) {
    let _checked = null;
    [...options].map((input) => {
      if (input.checked) {
        _checked = input;
      }
      input.setAttribute("disabled", true);
      return input;
    });
    if (_checked.value == data[stackTrace]?.answer) {
      _checked.parentElement.classList.add("correct-answer");
      appConfig.score += 10;
    } else {
      _checked.parentElement.classList.add("wrong-answer");
    }
    if (stackTrace === data.length - 1) {
      nextQuestion.innerText = "Finish!";
    }
    appConfig.stackTrace += 1;
    submitButton.classList.add("none");
    nextQuestion.classList.remove("none");
  }
};

const startQuiz = ({ quizInstructions, quizStart, nextQuestion, quizRetry, quizContainer }) => {
  quizStart.addEventListener("click", () => {
    quizInstructions.classList.add("none");
    fetchQuizData(appConfig)
      .then(() => {
        quizHandler(appConfig);
      })
      .catch((error) => {
        alert(error);
      });
  });
  nextQuestion.addEventListener("click", () => {
    quizHandler(appConfig);
  });

  quizRetry.addEventListener("click", () => {
    appConfig.stackTrace = 0;
    appConfig.score = 0;
    quizHandler(appConfig);
    quizContainer.classList.remove("none");
  });
};

//init
startQuiz(appConfig);
