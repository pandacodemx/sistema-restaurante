export function obtenerUsuario() {
    const data = localStorage.getItem("usuario");
    return data ? JSON.parse(data) : null;
}

export function cerrarSesion() {
    localStorage.removeItem("usuario");
}