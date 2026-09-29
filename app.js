const STORAGE_KEY = "vod49_schedule_v2";

let schedule = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentWeekStart = getMonday(new Date());
let currentWeekType = "white";

const scheduleElement = document.getElementById("schedule");
const emptyState = document.getElementById("emptyState");

const weekTitle = document.getElementById("weekTitle");
const weekDates = document.getElementById("weekDates");

const adminDialog = document.getElementById("adminDialog");
const lessonDialog = document.getElementById("lessonDialog");

const lessonForm = document.getElementById("lessonForm");

const lessonDate = document.getElementById("lessonDate");
const lessonNumber = document.getElementById("lessonNumber");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const subject = document.getElementById("subject");
const teacher = document.getElementById("teacher");
const classroom = document.getElementById("classroom");
const homework = document.getElementById("homework");
const weekType = document.getElementById("weekType");


function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + difference);
  d.setHours(0, 0, 0, 0);

  return d;
}


function formatDate(date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long"
  });
}


function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function saveSchedule() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(schedule)
  );
}


function getWeekDates() {
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);

    date.setDate(
      date.getDate() + i
    );

    dates.push(date);
  }

  return dates;
}


function renderWeekInfo() {
  const dates = getWeekDates();

  weekTitle.textContent =
    currentWeekType === "white"
      ? "Белая неделя"
      : "Серая неделя";

  weekDates.textContent =
    `${formatDate(dates[0])} — ${formatDate(dates[6])}`;
}


function render() {
  renderWeekInfo();

  document
    .getElementById("whiteWeek")
    .classList.toggle(
      "active",
      currentWeekType === "white"
    );

  document
    .getElementById("grayWeek")
    .classList.toggle(
      "active",
      currentWeekType === "gray"
    );

  scheduleElement.innerHTML = "";

  const dates = getWeekDates();

  let lessonsShown = 0;

  dates.forEach(date => {
    const key = dateKey(date);

    const lessons = schedule
      .filter(lesson =>
        lesson.date === key &&
        lesson.weekType === currentWeekType
      )
      .sort((a, b) => {
        const numberDifference =
          Number(a.lessonNumber) -
          Number(b.lessonNumber);

        if (numberDifference !== 0) {
          return numberDifference;
        }

        return (a.startTime || "")
          .localeCompare(b.startTime || "");
      });

    const day = document.createElement("section");
    day.className = "day";

    const title = document.createElement("div");
    title.className = "day-title";

    const heading = document.createElement("h2");

    heading.textContent =
      date.toLocaleDateString("ru-RU", {
        weekday: "long"
      });

    const dateText = document.createElement("span");

    dateText.textContent =
      formatDate(date);

    title.appendChild(heading);
    title.appendChild(dateText);

    day.appendChild(title);


    if (lessons.length === 0) {

      const empty = document.createElement("div");

      empty.className = "lesson";

      empty.style.color = "#91899d";

      empty.textContent = "Пар нет";

      day.appendChild(empty);

    } else {

      lessons.forEach(lesson => {

        const element =
          createLessonElement(lesson);

        day.appendChild(element);

        lessonsShown++;

      });

    }

    scheduleElement.appendChild(day);
  });

  emptyState.style.display =
    lessonsShown === 0
      ? "block"
      : "none";
}


function createLessonElement(lesson) {

  const article =
    document.createElement("article");

  article.className = "lesson";


  const top =
    document.createElement("div");

  top.className = "lesson-top";


  const number =
    document.createElement("div");

  number.className =
    "lesson-number";

  number.textContent =
    lesson.lessonNumber;


  const info =
    document.createElement("div");

  info.className =
    "lesson-info";


  const lessonSubject =
    document.createElement("div");

  lessonSubject.className =
    "lesson-subject";

  lessonSubject.textContent =
    lesson.subject;


  const meta =
    document.createElement("div");

  meta.className =
    "lesson-meta";


  const details = [];


  if (
    lesson.startTime ||
    lesson.endTime
  ) {

    details.push(
      `🕐 ${lesson.startTime || ""}${
        lesson.endTime
          ? " — " + lesson.endTime
          : ""
      }`
    );

  }


  if (lesson.teacher) {

    details.push(
      `👩‍🏫 ${lesson.teacher}`
    );

  }


  if (lesson.classroom) {

    details.push(
      `📍 ${lesson.classroom}`
    );

  }


  meta.innerHTML =
    details.join("<br>");


  info.appendChild(
    lessonSubject
  );

  info.appendChild(
    meta
  );


  top.appendChild(number);
  top.appendChild(info);

  article.appendChild(top);


  if (lesson.homework) {

    const homeworkBlock =
      document.createElement("div");

    homeworkBlock.className =
      "homework";


    const homeworkTitle =
      document.createElement("strong");

    homeworkTitle.textContent =
      "Домашнее задание";


    const homeworkText =
      document.createElement("div");

    homeworkText.textContent =
      lesson.homework;


    homeworkBlock.appendChild(
      homeworkTitle
    );

    homeworkBlock.appendChild(
      homeworkText
    );

    article.appendChild(
      homeworkBlock
    );
  }


  return article;
}


function openAdmin() {
  adminDialog.showModal();
}


function closeAdmin() {
  adminDialog.close();
}


function openLessonForm() {

  lessonForm.reset();

  const today =
    new Date();

  lessonDate.value =
    dateKey(today);

  weekType.value =
    currentWeekType;

  lessonDialog.showModal();
}


function closeLessonForm() {
  lessonDialog.close();
}


function addLesson(event) {

  event.preventDefault();


  const newLesson = {

    id:
      Date.now().toString(),

    date:
      lessonDate.value,

    lessonNumber:
      Number(
        lessonNumber.value
      ) || 1,

    startTime:
      startTime.value,

    endTime:
      endTime.value,

    subject:
      subject.value.trim(),

    teacher:
      teacher.value.trim(),

    classroom:
      classroom.value.trim(),

    homework:
      homework.value.trim(),

    weekType:
      weekType.value,

    updatedAt:
      new Date().toISOString()
  };


  if (
    !newLesson.date ||
    !newLesson.subject
  ) {

    alert(
      "Заполни дату и название предмета."
    );

    return;
  }


  schedule.push(
    newLesson
  );

  saveSchedule();


  currentWeekStart =
    getMonday(
      new Date(
        `${newLesson.date}T00:00:00`
      )
    );


  currentWeekType =
    newLesson.weekType;


  closeLessonForm();
  closeAdmin();

  render();
}


document
  .getElementById("adminButton")
  .addEventListener(
    "click",
    openAdmin
  );


document
  .getElementById("closeAdmin")
  .addEventListener(
    "click",
    closeAdmin
  );


document
  .getElementById("addLesson")
  .addEventListener(
    "click",
    openLessonForm
  );


document
  .getElementById("cancelLesson")
  .addEventListener(
    "click",
    closeLessonForm
  );


lessonForm.addEventListener(
  "submit",
  addLesson
);


document
  .getElementById("prevWeek")
  .addEventListener(
    "click",
    () => {

      const previous =
        new Date(
          currentWeekStart
        );

      previous.setDate(
        previous.getDate() - 7
      );

      currentWeekStart =
        previous;

      render();
    }
  );


document
  .getElementById("nextWeek")
  .addEventListener(
    "click",
    () => {

      const next =
        new Date(
          currentWeekStart
        );

      next.setDate(
        next.getDate() + 7
      );

      currentWeekStart =
        next;

      render();
    }
  );


document
  .getElementById("whiteWeek")
  .addEventListener(
    "click",
    () => {

      currentWeekType =
        "white";

      render();
    }
  );


document
  .getElementById("grayWeek")
  .addEventListener(
    "click",
    () => {

      currentWeekType =
        "gray";

      render();
    }
  );


document
  .getElementById("exportData")
  .addEventListener(
    "click",
    () => {

      const data =
        JSON.stringify(
          schedule,
          null,
          2
        );

      const blob =
        new Blob(
          [data],
          {
            type:
              "application/json"
          }
        );


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "vod49-schedule.json";

      link.click();


      URL.revokeObjectURL(
        url
      );
    }
  );


render();
