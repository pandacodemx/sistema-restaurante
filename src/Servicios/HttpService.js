const RUTA_GLOBAL = "http://localhost/sistema-restaurante/api/";

const HttpService = {
  async registrar(datos, ruta, esFormData = false) {
    const respuesta = await fetch(RUTA_GLOBAL + ruta, {
      method: "post",
      body: esFormData ? datos : JSON.stringify(datos),
      headers: esFormData
        ? undefined
        : {
            "Content-Type": "application/json",
          },
    });
  
    const resultado = await respuesta.json();
    return resultado;
  },

  async obtenerConDatos(datos, ruta) {
    const respuesta = await fetch(RUTA_GLOBAL + ruta, {
      method: "post",
      body: JSON.stringify(datos),
    });
    let resultado = await respuesta.json();
    return resultado;
  },

  async obtener(ruta) {
    let respuesta = await fetch(RUTA_GLOBAL + ruta);
    let datos = await respuesta.json();
    return datos;
  },

  async eliminar(ruta, id) {
    const respuesta = await fetch(RUTA_GLOBAL + ruta, {
      method: "post",
      body: JSON.stringify(id),
    });
    let resultado = await respuesta.json();
    return resultado;
  },

  registrarFormData(formData, endpoint) {
    return fetch(`api/${endpoint}`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error(err);
        return false;
      });
  },
};

export default HttpService;
