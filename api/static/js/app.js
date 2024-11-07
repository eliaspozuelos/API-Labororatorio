// Crear una tarea y actualizar la lista dinámicamente
document.getElementById('createTaskForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    });
    const result = await response.json();
    alert(result.message);

    // Limpiar el formulario
    document.getElementById('createTaskForm').reset();

    fetchTasks(); // Recargar tareas y mostrar el mensaje adecuado
});

// Obtener todas las tareas y mostrarlas como tarjetas
async function fetchTasks() {
    const response = await fetch('/api/items');
    const tasks = await response.json();

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Limpiar la lista de tareas

    tasks.forEach(task => addTaskCard(task)); // Agregar cada tarea como tarjeta

    // Llamar a checkTasks para verificar si hay tareas
    checkTasks(); 
}

// Función para mostrar una tarea como una tarjeta (card) y permitir la edición
function addTaskCard(task) {
    const taskList = document.getElementById('taskList');
    
    // Crear la estructura de la tarjeta
    const card = document.createElement('div');
    card.className = 'col-lg-4 mb-4';

    card.innerHTML = `
        <div class="card shadow-lg mb-4" style="border-radius: 10px; background-color: #f8f9fa;">
            <div class="card-header" style="background-color: #007bff; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px;">
                <p style="font-size: 1.25rem; font-weight: 600; text-transform: capitalize;">
                    <strong>Título:</strong> <span id="title-display-${task.task_id}">${task.title}</span>
                </p>
            </div>
            <div class="card-body" style="padding: 1.5rem; background-color: #ffffff;">
                <p style="font-size: 1rem; font-weight: 500;">
                    <strong>Descripción:</strong> <span id="description-display-${task.task_id}">${task.description}</span>
                </p>
                <p style="font-size: 1rem; font-weight: 500;">
                   <strong>Estado:</strong> <span id="status-display-${task.task_id}" class="badge" style="background-color: ${getStatusColor(task.status)}; color: white; padding: 0.2em 0.5em; border-radius: 4px;">${task.status || 'No especificado'}</span>
                </p>
                <p style="font-size: 1rem; font-weight: 500;">
                    <strong>Fecha de Creación:</strong> <span id="created-at-${task.task_id}">${task.created_at}</span>
                </p>
                <div class="d-flex justify-content-end">
                    <button class="btn btn-warning btn-sm me-2" id="edit-btn-${task.task_id}" onclick="enableEditMode('${task.task_id}')">
                        <i class="fas fa-edit"></i> Actualizar
                    </button>
                    <button class="btn btn-danger btn-sm me-2" onclick="deleteTask('${task.task_id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button class="btn btn-success btn-sm" id="save-btn-${task.task_id}" onclick="saveChanges('${task.task_id}')" style="display: none;">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                    <button class="btn btn-secondary btn-sm" id="cancel-btn-${task.task_id}" onclick="cancelEdit('${task.task_id}')" style="display: none;">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;


    taskList.appendChild(card); // Agregar la tarjeta al contenedor de tareas
}

// Función para obtener el color basado en el estado
function getStatusColor(status) {
    switch (status) {
        case 'pendiente':
            return 'red'; 
        case 'en progreso':
            return '#ffc107';
        case 'completado':
            return 'green'; 
        default:
            return '#6c757d'; 
    }
}

// Función para habilitar el modo de edición en la tarjeta

function enableEditMode(taskId) {
    // Convertir los elementos a campos de entrada editables
    const titleElement = document.getElementById(`title-display-${taskId}`);
    const descriptionElement = document.getElementById(`description-display-${taskId}`);
    const statusElement = document.getElementById(`status-display-${taskId}`);
    
    titleElement.outerHTML = `<input type="text" class="form-control" id="title-${taskId}" value="${titleElement.textContent}">`;
    descriptionElement.outerHTML = `<textarea class="form-control mb-2" id="description-${taskId}">${descriptionElement.textContent}</textarea>`;
    // Crear el selector de estado con las tres opciones
    statusElement.outerHTML = `
        <select class="form-control mb-2" id="status-${taskId}">
            <option value="pendiente" ${statusElement.textContent === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="en progreso" ${statusElement.textContent === 'en progreso' ? 'selected' : ''}>En Progreso</option>
            <option value="completado" ${statusElement.textContent === 'completado' ? 'selected' : ''}>Completado</option>
        </select>
    `;

    // Cambiar botones
    document.getElementById(`edit-btn-${taskId}`).style.display = 'none';
    document.getElementById(`save-btn-${taskId}`).style.display = 'inline-block';
    document.getElementById(`cancel-btn-${taskId}`).style.display = 'inline-block';

}

// Función para guardar los cambios realizados en la tarjeta
async function saveChanges(taskId) {
    const title = document.getElementById(`title-${taskId}`).value;
    const description = document.getElementById(`description-${taskId}`).value;
    const status = document.getElementById(`status-${taskId}`).value;

    // Realizar la actualización en el servidor
    const response = await fetch(`/api/items/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status })
    });
    const result = await response.json();
    alert(result.message);
    fetchTasks();

    // Volver a mostrar en modo lectura
    document.getElementById(`title-${taskId}`).outerHTML = `<h5 id="title-display-${taskId}">${title}</h5>`;
    document.getElementById(`description-${taskId}`).outerHTML = `<p id="description-display-${taskId}">${description}</p>`;

    const statusContainer = document.getElementById(`status-${taskId}`).parentElement;
    statusContainer.innerHTML = `<span id="status-display-${taskId}" class="badge" style="background-color: ${getStatusColor(status)}; color: white; padding: 0.2em 0.5em; border-radius: 4px;">${status}</span>`;

    // Cambiar botones de nuevo
    document.getElementById(`edit-btn-${taskId}`).style.display = 'inline-block';
    document.getElementById(`save-btn-${taskId}`).style.display = 'none';
    document.getElementById(`cancel-btn-${taskId}`).style.display = 'none';
    
}

// Función para cancelar la edición
function cancelEdit() {
    fetchTasks(); // Recargar la lista de tareas para revertir a los valores originales
}
function toggleCreateTaskForm() {
    const formContainer = document.getElementById('createTaskFormContainer');

    if (formContainer.classList.contains('show')) {
        formContainer.style.opacity = '0';
        formContainer.style.maxHeight = '0';
        setTimeout(() => {
            formContainer.classList.remove('show');
            formContainer.style.display = 'none';
        }, 500); 
    } else {
        formContainer.style.display = 'block';
        setTimeout(() => {
            formContainer.classList.add('show');
            formContainer.style.opacity = '1';
            formContainer.style.maxHeight = '500px'; // Altura máxima visible 
        }, 10); // Un ligero retraso para asegurar que el display se aplique antes de la opacidad y altura
    }
}




// Eliminar una tarea
async function deleteTask(taskId) {

    const confirmDelete = confirm("¿Estás seguro de que quieres eliminar esta tarea?");
    if (!confirmDelete) {
        // Si el usuario cancela, no se realiza ninguna acción
        return;
    }
    const response = await fetch(`/api/items/${taskId}`, {
        method: 'DELETE'
    });
    const result = await response.json();
    alert(result.message);
    fetchTasks(); // Actualizar la lista de tareas
}


// Función para verificar si hay tareas
function checkTasks() {
    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasksMessage');

    // Si no hay tareas, muestra el mensaje
    if (taskList.children.length === 0) {
        noTasksMessage.style.display = 'block';
    } else {
        noTasksMessage.style.display = 'none';
    }
}

// Llamar a la función para verificar si hay tareas al cargar la página
document.addEventListener("DOMContentLoaded", checkTasks);

