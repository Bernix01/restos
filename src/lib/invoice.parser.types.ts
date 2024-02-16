export interface CreditNoteXML {
  infoTributaria: InfoTributaria;
  infoNotaCredito: InfoNotaCredito;
  detalles: CNDetalles;
  infoAdicional?: InfoAdicional;
}

export interface CNDetalles {
  detalle: CNDetalle[];
}

export interface CNDetalle {
  codigoInterno: number | string;
  codigoAdicional?: number | string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  precioTotalSinImpuesto: number;
  impuestos: string[] | ImpuestosClass;
  detallesAdicionales?: DetallesAdicionales;
}

export interface DetallesAdicionales {
  detAdicional: string;
}

export interface ImpuestosClass {
  impuesto: CNImpuesto[];
}

export interface CNImpuesto {
  codigo: number;
  codigoPorcentaje: number;
  tarifa?: number;
  baseImponible: number;
  valor: number;
  valorDevolucionIva?: number;
}

export interface InfoNotaCredito {
  fechaEmision: string;
  dirEstablecimiento: string;
  tipoIdentificacionComprador: string;
  razonSocialComprador: string;
  identificacionComprador: string;
  contribuyenteEspecial?: number | string;
  obligadoContabilidad: string;
  codDocModificado: string;
  numDocModificado: string;
  fechaEmisionDocSustento: string;
  totalSinImpuestos: number;
  valorModificacion: number;
  moneda: string;
  totalConImpuestos: CNTotalConImpuestos;
  motivo: string;
}

export interface CNTotalConImpuestos {
  totalImpuesto: CNImpuesto[];
}

export interface InvoiceXML {
  infoTributaria: InfoTributaria;
  infoFactura: InfoFactura;
  detalles: Detalles;
  infoAdicional?: InfoAdicional;
  otrosRubrosTerceros?: OtrosRubrosTerceros;
}

export interface Detalles {
  detalle: Detalle[];
}

export interface Detalle {
  codigoPrincipal: string;
  codigoAuxiliar?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  precioTotalSinImpuesto: number;
  impuestos: Impuestos;
  detallesAdicionales?: DetallesAdicionales;
  unidadMedida?: UnidadMedidaEnum | number;
  precioSinSubsidio?: number;
}

export interface Impuestos {
  impuesto: Impuesto[];
}

export interface Impuesto {
  codigo: number;
  codigoPorcentaje: number;
  tarifa: number;
  baseImponible: number;
  valor: number;
}

export enum UnidadMedidaEnum {
  Und = "UND",
  UnidadMedidaUND = "UND.",
  Unidades = "Unidades",
}

export interface InfoAdicional {
  campoAdicional: Array<number | string>;
}

export interface InfoFactura {
  fechaEmision: string;
  dirEstablecimiento?: string;
  obligadoContabilidad?: string;
  tipoIdentificacionComprador: string;
  razonSocialComprador: string;
  identificacionComprador: string;
  direccionComprador?: string;
  totalSinImpuestos: number;
  totalDescuento: number;
  totalConImpuestos: TotalConImpuestos;
  propina?: string;
  importeTotal: number;
  moneda?: string;
  pagos?: Pagos;
  valorRetIva?: number;
  valorRetRenta?: number;
  contribuyenteEspecial?: string;
  placa?: string;
  totalSubsidio?: number;
  guiaRemision?: string;
}

export interface Pagos {
  pago: PagoElement[];
}

export interface PagoElement {
  formaPago: string;
  total: number;
  plazo?: number;
  unidadTiempo?: string;
}

export interface TotalConImpuestos {
  totalImpuesto: TotalImpuestoElement[];
}

export interface TotalImpuestoElement {
  codigo: number;
  codigoPorcentaje: number;
  descuentoAdicional?: number;
  baseImponible: number;
  valor: number;
  valorDevolucionIva?: number;
  tarifa?: number;
}

export interface InfoTributaria {
  ambiente: number;
  tipoEmision: number;
  razonSocial: string;
  nombreComercial?: string;
  ruc: string;
  claveAcceso: string;
  codDoc: string;
  estab: string;
  ptoEmi: string;
  secuencial: string;
  dirMatriz: string;
  agenteRetencion?: number;
  contribuyenteRimpe?: string;
}

export interface OtrosRubrosTerceros {
  rubro: Rubro[];
}

export interface Rubro {
  concepto: string;
  total: number;
}
