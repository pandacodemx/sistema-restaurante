<template>
  <section>
    <div id="comprobante" class="comprobante">
      <p>TICKET DE COMPRA</p>
      <strong>{{ datosLocal.nombre }}</strong><br />
      <img :src="logo" alt="logo">
      <br>
      <span>Fecha: {{ venta.fecha }}</span><br />
      <span>Teléfono: {{ datosLocal.telefono }}</span>
      <hr>
      <p>Atiende:{{ venta.atendio }}</p>
      <p>Cliente: {{ venta.cliente }}</p>
      <br>
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
      <br>
      <div class="total-info">
        <strong>TOTAL: ${{ venta.total }}</strong><br />
        <small>Pago cliente: ${{ venta.pagado }}</small><br />
        <small>Cambio: ${{ venta.pagado - venta.total }}</small>
      </div>
      <br>
      <small>¡Gracias por tu preferencia!</small>
    </div>
  </section>
</template>
<script>
import Printd from "printd";

const d = new Printd();
export default {
  name: "Ticket",

  props: ["venta", "insumos", "datosLocal", "logo"],

  data: () => ({
    cssText: `
      #comprobante{
			text-align: center;
			font-family: 'Arial', monospace;
			font-size: 9px;
      margin: auto 0;
		}

		#comprobante > p {
			margin:0;
		}

		#comprobante > span {
			font-size:8px;
		}

    #comprobante > img {
      width: 50px;
      height:50px;
      margin: auto 0;
    }

		#comprobante > strong{
			font-size: 13px;
			font-weight: bold;
		}
		#comprobante > table, td, th {
			border: 1px solid black;
		}
		#comprobante > table {
			margin-left: auto;
			margin-right: auto;
			
		  border-collapse: collapse;
		}
    hr
    {
    width: 50%;
    }  
    .datos-atencion
    {
    text-align: center;
    }

    #comprobante > table {
      width: 70%;
      font-size: 8px;
      border-collapse: collapse;
      margin: 0 auto;
    }

    #comprobante > table td,
    #comprobante > table th {
      border: 1px solid #9b9b9b;
      padding: 4px;
      text-align: left;
    }

    #comprobante > table th {
      background-color: #f0f0f0;
      font-weight: bold;
    }

    .total-info {
      margin-top: 5px;
      text-align: right;
      padding-right: 15%;
      font-size: 9px;
    }
      
        `,
  }),

  mounted() {
    this.d = new Printd();
    const { contentWindow } = this.d.getIFrame();
    contentWindow.addEventListener("beforeprint", () =>
      console.log("before print event!")
    );
    contentWindow.addEventListener("afterprint", () =>
      console.log("after print event!")
    );

    this.imprimir();
  },

  methods: {
    imprimir() {
      let zona = document.getElementById("comprobante");
      setTimeout(() => this.d.print(zona, [this.cssText]), 10);
      this.$emit("impreso", false);
    },
  },
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