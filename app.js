const CLAVE_API = 'bzOxt9qkGbt7jXVEtUWenFvkBX1OhacHkp82nFkj';   //contraseña de la api que se realiza con el registro 
const URL_BASE = 'https://api.nasa.gov/planetary/apod'; //api

const selectorFecha = document.getElementById('fecha');
const botonBuscarFecha = document.getElementById('btnBuscar');
const botonImagenHoy = document.getElementById('botonImagenHoy');      
const botonGuardarFavorito = document.getElementById('btn-add-fav');
const botonBorrarTodos = document.getElementById('botonBorrarTodos');  
const tituloImagen = document.getElementById('apod-title');
const fechaImagen = document.getElementById('apod-date');
const contenedorImagen = document.getElementById('media-content');
const explicacionImagen = document.getElementById('apod-desc');
const listaFavoritos = document.getElementById('fav-container');
let imagenActual = null;   // Guarda los datos de la imagen que se está mostrando

async function obtenerImagen(fecha = null) {
    let url = `${URL_BASE}?api_key=${CLAVE_API}&thumbs=true`;
    if (fecha) {
        url += `&date=${fecha}`;
    }

    try {
        const respuesta = await fetch(url);// Realiza la solicitud a la API
        if (!respuesta.ok) {
            throw new Error(`Error de conexión: ${respuesta.status}`);
        }
        const datos = await respuesta.json();// Convierte la respuesta a JSON
        return datos;
    } catch (error) {
        console.error('error al obtener imagen:', error);// Muestra un mensaje de error al usuario
        alert('hubo un problema de conexión con la api.');// Muestra un mensaje de error al usuario
        return null;
    }
}

function mostrarImagen(datos) {// Muestra la imagen o video en el contenedor
    if (!datos) {// Si no se obtuvieron datos, muestra un mensaje de error
        contenedorImagen.innerHTML = `<div class="alert alert-danger">No se pudo cargar la imagen.</div>`;
        return;// Si no se obtuvieron datos, muestra un mensaje de error
    }

    if (datos.media_type === 'video') {// Si el contenido es un video, muestra un mensaje y la miniatura si está disponible
        contenedorImagen.innerHTML = `
            <div class="alert alert-warning">
                <strong>Contenido multimedia:</strong> Esta fecha corresponde a un video.<br>
                <strong>${datos.title}</strong> - ${datos.date}
            </div>
        `;
        if (datos.thumbnail_url) {// Si es un video, muestra la miniatura si está disponible
            const imgMiniatura = document.createElement('img');// Si es un video, muestra la miniatura si está disponible
            imgMiniatura.src = datos.thumbnail_url;// Si es un video, muestra la miniatura si está disponible
            imgMiniatura.alt = datos.title;// Si es un video, muestra la miniatura si está disponible
            imgMiniatura.className = 'img-fluid mt-2 rounded';// Si es un video, muestra la miniatura si está disponible
            contenedorImagen.appendChild(imgMiniatura);// Si es un video, muestra la miniatura si está disponible
        }
        tituloImagen.textContent = datos.title;// Si es un video, muestra el título y la fecha
        fechaImagen.textContent = datos.date;// Si es un video, muestra el título y la fecha
        explicacionImagen.textContent = datos.explanation;// Si es un video, muestra la explicación
        imagenActual = datos;// Guarda los datos del video como la imagen actual para poder guardarlo en favoritos
        return;
    }

    const imagen = document.createElement('img');// Crea un elemento de imagen para mostrar la imagen del día
    imagen.src = datos.url;// Establece la URL de la imagen obtenida de la API
    imagen.alt = datos.title;// Establece el texto alternativo de la imagen con el título obtenido de la API
    imagen.className = 'img-fluid rounded';// Agrega clases de Bootstrap para que la imagen sea responsiva y tenga bordes redondeados
    contenedorImagen.innerHTML = '';// Limpia el contenedor antes de mostrar la nueva imagen
    contenedorImagen.appendChild(imagen);// Agrega la imagen al contenedor

    tituloImagen.textContent = datos.title;// Muestra el título de la imagen debajo de la imagen
    fechaImagen.textContent = datos.date;// Muestra la fecha de la imagen debajo del título
    explicacionImagen.textContent = datos.explanation;// Muestra la explicación de la imagen debajo de la fecha

    imagenActual = datos;
}

async function cargarImagen(fecha = null) {//cargar la imagen del día o de la fecha seleccionada
    contenedorImagen.innerHTML = `
        <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
    `;
    const datos = await obtenerImagen(fecha);
    mostrarImagen(datos);
}

botonBuscarFecha.addEventListener('click', async () => {//buscar 
    const fechaSeleccionada = selectorFecha.value;
    if (!fechaSeleccionada) {
        alert('Por favor, selecciona una fecha.');
        return;
    }

    const hoy = new Date().toISOString().split('T')[0];// Validar que la fecha no sea futura
    if (fechaSeleccionada > hoy) {
        alert('no se pueden fechas futuras.');
        return;
    }

    await cargarImagen(fechaSeleccionada);
});

botonImagenHoy.addEventListener('click', async () => {
    selectorFecha.value = '';
    await cargarImagen();   // sin fecha = día actual
});

let favoritos = [];

function cargarFavoritoStorage() {//cargar favorito
    const guardados = localStorage.getItem('exploradorFavoritos');
    if (guardados) {
        favoritos = JSON.parse(guardados);
    } else {
        favoritos = [];
    }
    actualizarFavoritos();
}

function guardarFavoritoStorage() {// guardar favorito
    localStorage.setItem('exploradorFavoritos', JSON.stringify(favoritos));
}

function agregarFavoritos() {// agregar favorito
    if (!imagenActual) {
        alert('ninguna imagen cargada para guardar.');
        return;
    }

    const yaExiste = favoritos.some(fav => fav.date === imagenActual.date);// Verificar si la imagen ya está en favoritos comparando por fecha (ya que cada fecha tiene una imagen única)
    if (yaExiste) {
        alert('Esta en favoritos.');
        return;
    }

    const nuevoFavorito = {// Crear un nuevo objeto con los datos relevantes de la imagen actual para guardar en favoritos
        title: imagenActual.title,
        date: imagenActual.date,
        url: imagenActual.url,
        media_type: imagenActual.media_type,
        explanation: imagenActual.explanation,
        thumbnail_url: imagenActual.thumbnail_url || null
    };
    favoritos.push(nuevoFavorito);// Agregar el nuevo favorito al array de favoritos
    guardarFavoritoStorage();
    actualizarFavoritos();
    alert('guardado en favoritos');
}

function eliminarFavorito(indice) {//eliminar
    if (confirm('¿Eliminar este favorito?')) {
        favoritos.splice(indice, 1);
        guardarFavoritoStorage();
        actualizarFavoritos();
    }
}

function borrarFavoritos() {//vaciar los favoritos
    if (confirm('¿eliminar todos los favoritos?')) {
        favoritos = [];
        guardarFavoritoStorage();
        actualizarFavoritos();
    }
}

function actualizarFavoritos() {//actualiza los favoritos
    listaFavoritos.innerHTML = '';
    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = '<li class="list-group-item bg-transparent text-muted">No hay favoritos aún.</li>';
        return;
    }

    favoritos.forEach((fav, indice) => {// Itera sobre el array de favoritos y crea un elemento de lista para cada uno, mostrando el título, la fecha y botones para ver o eliminar el favorito
        const elementoLi = document.createElement('li');
        elementoLi.className = 'list-group-item d-flex justify-content-between align-items-center';
        elementoLi.innerHTML = `
            <span><strong>${fav.title}</strong> (${fav.date})</span>
            <div>
                <button class="btn btn-sm btn-outline-primary me-1 btn-cargar-favorito" data-indice="${indice}">📖 Ver</button>
                <button class="btn btn-sm btn-outline-danger btn-eliminar-favorito" data-indice="${indice}">🗑️</button>
            </div>
        `;
        listaFavoritos.appendChild(elementoLi);
    });

    document.querySelectorAll('.btn-cargar-favorito').forEach(btn => {// Agrega eventos a los botones de cada favorito para cargar la imagen correspondiente al hacer clic
        btn.addEventListener('click', async (e) => {
            const indice = parseInt(btn.dataset.indice);
            const favoritoSeleccionado = favoritos[indice];
            mostrarImagen(favoritoSeleccionado);
            imagenActual = favoritoSeleccionado;
            selectorFecha.value = favoritoSeleccionado.date;
        });
    });

    document.querySelectorAll('.btn-eliminar-favorito').forEach(btn => {// Agrega eventos a los botones de eliminar para eliminar el favorito correspondiente al hacer clic
        btn.addEventListener('click', (e) => {
            const indice = parseInt(btn.dataset.indice);
            eliminarFavorito(indice);
        });
    });
}

botonGuardarFavorito.addEventListener('click', agregarFavoritos);
botonBorrarTodos.addEventListener('click', borrarFavoritos);

async function iniciar() {
    cargarFavoritoStorage();
    await cargarImagen();   // imagen del día actual
}

iniciar();