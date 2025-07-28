<template>
  <section>
    <div id="comprobante" class="comprobante">
      <p>TICKET DE COMPRA</p>
      <strong>{{ datosLocal.nombre }}</strong><br />
      <img :src="logo" alt="logo" />
      <br />
      <span>Fecha: {{ venta.fecha }}</span><br />
      <span>Teléfono: {{ datosLocal.telefono }}</span>
      <hr />
      <p>Atiende: {{ venta.atendio }}</p>
      <p>Cliente: {{ venta.cliente }}</p>
      <br />
      <table>
        <thead>
          <tr>
            <th colspan="2">Insumo</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(insumo, index) in insumos" :key="index">
            <td>{{ insumo.nombre }}</td>
            <td>${{ insumo.precio }} x {{ insumo.cantidad }}</td>
            <td>${{ (insumo.precio * insumo.cantidad).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
      <br />
      <div class="total-info">
        <strong>TOTAL: ${{ venta.total }}</strong><br />
        <small>Pago cliente: ${{ venta.pagado }}</small><br />
        <small>Cambio: ${{ venta.pagado - venta.total }}</small>
      </div>
      <br />
      <small>¡Gracias por tu preferencia!</small>
    </div>
  </section>
</template>

<script>
import qz from 'qz-tray';

export default {
  name: 'Ticket',
  props: ['venta', 'insumos', 'datosLocal', 'logo'],

  data: () => ({
    cssText: `
      #comprobante {
        text-align: center;
        font-family: 'Arial', monospace;
        font-size: 9px;
        margin: auto 0;
      }
      #comprobante > img {
        width: 50px;
        height: 50px;
      }
      #comprobante > table {
        width: 70%;
        font-size: 8px;
        margin: 0 auto;
        border-collapse: collapse;
      }
      #comprobante > table td, #comprobante > table th {
        border: 1px solid #9b9b9b;
        padding: 4px;
      }
      .total-info {
        margin-top: 5px;
        text-align: right;
        padding-right: 15%;
        font-size: 9px;
      }
    `
  }),

  async mounted() {
    try {
      await this.verificarQZTray();
      await this.conectarQZ();
      await this.imprimirTicket();
      this.$emit("impreso", false);
    } catch (error) {
      console.error("❌ Error de impresión:", error.message || error);
      alert("Error al intentar imprimir:\n" + error.message || error);
    }
  },

  methods: {
    async verificarQZTray() {
      // Intenta conectar brevemente para verificar si QZ está activo
      const conectado = await qz.websocket.connect().catch(() => false);
      if (!conectado && !qz.websocket.isActive()) {
        throw new Error("QZ Tray no está corriendo o fue bloqueado por el navegador.");
      }
    },

    async conectarQZ() {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }
    },

    async imprimirTicket() {
    const impresora = await qz.printers.getDefault();
    if (!impresora) {
      throw new Error("No se encontró impresora predeterminada.");
    }

    const config = qz.configs.create(impresora);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>${this.cssText}</style>
      </head>
      <body>${document.getElementById("comprobante").innerHTML}</body>
      </html>
    `;

    const data = [
      {
        type: "html",
        format: "plain", // plano, no PDF
        data: htmlContent
      }
    ];

    await qz.print(config, data);
  }

    }

};
</script>


<style>
#comprobante {
  width: 300px;
  text-align: center;
  font-family: "Courier New", monospace;
  font-size: 9px;
}

#comprobante>p {
  margin: 0;
}

#comprobante>span {
  font-size: 8px;
}

#comprobante>strong {
  font-size: 13px;
  font-weight: bold;
}

#comprobante>table,
td,
th {
  border: 1px solid black;
}

#comprobante>img {
  width: 70px;
  height: 70px;
}

#comprobante>table {
  margin-left: auto;
  margin-right: auto;

  border-collapse: collapse;
}

.mostrar {
  visibility: visible;
}

.noMostrar {
  visibility: hidden;
}
</style>