const form = document.querySelector('#form');
const taskInput = document.querySelector('#taskInput');
const tasksList = document.querySelector('#tasksList');
const emptyList = document.querySelector('#emptyList');
let tasks = [];


if (localStorage.getItem('tasks')) {
    tasks = JSON.parse(localStorage.getItem('tasks'));

    tasks.forEach(function (task) {
        renderTask(task);
    })
}





checkEmptyList();



// Добавление задач
form.addEventListener('submit', addTask)


// Удаление задач
tasksList.addEventListener('click', deleteTask);


//Отмечаем задачу завершённой
tasksList.addEventListener('click', doneTask);


// Функции
function addTask(e) {
    e.preventDefault();
    const taskText = taskInput.value;

    const newTask = {
        id: Date.now(),
        text: taskText,
        done: false
    }

    // добавляем задачу в массив с задачами

    tasks.push(newTask);
    // Добавляем задачу в локал сторедж
    saveToLocalStorage();


    renderTask(newTask);


    taskInput.value = '';
    taskInput.focus();
    checkEmptyList();
}


function deleteTask(e) {
    if (e.target.dataset.action !== 'delete') return;

    const parentNode = e.target.closest('.list-group-item');

    const id = Number(parentNode.id);

    //Удаляем задачу через фильтрацию массива
    tasks = tasks.filter((task) => task.id !== id)

    saveToLocalStorage();

    parentNode.remove();

    checkEmptyList();
}


function doneTask(e) {
    if (e.target.dataset.action !== 'done') return;

    const parentNode = e.target.closest('.list-group-item');

    const id = Number(parentNode.id);

    const task = tasks.find((task) => task.id === id)

    task.done = !task.done;

    saveToLocalStorage();

    const taskTitle = parentNode.querySelector('.task-title');
    taskTitle.classList.toggle('task-title--done');

}


function checkEmptyList() {

    if (tasks.length === 0) {
        const emptyListHTML = `<li id="emptyList" class="list-group-item empty-list">
        <img src="./img/leaf.svg" alt="Empty" width="48" class="mt-3">
        <div class="empty-list__title">ToDo list is empty</div>
    </li>`


        tasksList.insertAdjacentHTML('afterbegin', emptyListHTML);
    }

    if (tasks.length > 0) {
        const emptyListEl = document.querySelector('#emptyList');

        emptyListEl ? emptyListEl.remove() : null;
    }
}


function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


function renderTask(task) {
    const cssClass = task.done ? "task-title task-title--done" : "task-title";

    const taskHTML =
        `<li id="${task.id}" class="list-group-item d-flex justify-content-between task-item">
            <span class="${cssClass}">${task.text}</span>
            <div class="task-item__buttons">
                <button type="button" data-action="done" class="btn-action">
                    <img src="./img/tick.svg" alt="Done" width="18" height="18">
                </button>
                <button type="button" data-action="delete" class="btn-action">
                    <img src="./img/cross.svg" alt="Done" width="18" height="18">
                </button>
            </div>
        </li>`

    tasksList.insertAdjacentHTML('beforeend', taskHTML);
}