import { XMLParser } from "fast-xml-parser";

const parseInvoice = (fileName: string, invoiceStr: Buffer): InvoiceFile => {
  const parser = new XMLParser({
    cdataPropName: "__cdata",
    numberParseOptions: {
      leadingZeros: false,
      hex: false,
      eNotation: false,
    },
    isArray(tagName) {
      return tagName === "detalle" || tagName === "impuesto";
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const xml = parser.parse(invoiceStr);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const content: InvoiceXML = parser.parse(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    xml.autorizacion.comprobante.__cdata,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  ).factura as InvoiceXML;
  return { content, fileName };
};

export interface InvoiceFile {
  fileName: string;
  content: InvoiceXML;
}

export interface InvoiceXML {
  infoTributaria: InfoTributaria;
  infoFactura: InfoFactura;
  detalles: Detalles;
  infoAdicional: InfoAdicional;
}

interface Detalles {
  detalle: Detalle[];
}

export interface Detalle {
  codigoPrincipal: number;
  codigoAuxiliar: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  precioTotalSinImpuesto: number;
  impuestos: Impuestos;
}

interface Impuestos {
  impuesto: Impuesto [];
}

interface Impuesto {
  codigo: number;
  codigoPorcentaje: number;
  tarifa: number;
  baseImponible: number;
  valor: number;
}

interface InfoAdicional {
  campoAdicional: number[];
}

interface InfoFactura {
  fechaEmision: string;
  dirEstablecimiento: string;
  contribuyenteEspecial: number;
  obligadoContabilidad: string;
  tipoIdentificacionComprador: string;
  razonSocialComprador: string;
  identificacionComprador: string;
  totalSinImpuestos: number;
  totalDescuento: number;
  totalConImpuestos: TotalConImpuestos;
  propina: number;
  importeTotal: number;
  moneda: string;
  pagos: Pagos;
}

interface Pagos {
  pago: Pago;
}

interface Pago {
  formaPago: number;
  total: number;
  plazo: number;
  unidadTiempo: string;
}

interface TotalConImpuestos {
  totalImpuesto: TotalImpuesto[];
}

interface TotalImpuesto {
  codigo: number;
  codigoPorcentaje: number;
  descuentoAdicional: number;
  baseImponible: number;
  valor: number;
  valorDevolucionIva?: number;
}

interface InfoTributaria {
  ambiente: number;
  tipoEmision: number;
  razonSocial: string;
  nombreComercial: string;
  ruc: number;
  claveAcceso: string;
  codDoc: string;
  estab: string;
  ptoEmi: number;
  secuencial: string;
  dirMatriz: string;
}

export { parseInvoice };
