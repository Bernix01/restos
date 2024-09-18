import { XMLParser } from "fast-xml-parser";
import { type CreditNoteXML, type InvoiceXML } from "./invoice.parser.types";

const isRuc = (ruc: string): boolean => {
  const rucRegex = /^[0-9]{13}$/;
  return rucRegex.test(ruc);
}

export interface ParseError {
  fileName: string;
  error: string;
}

const parseTributaryFile = (
  fileName: string,
  invoiceStr: Buffer,
): [InvoiceFile?, CreditNoteFile?, ParseError?] => {
  const parser = new XMLParser({
    cdataPropName: "__cdata",
    numberParseOptions: {
      leadingZeros: false,
      hex: false,
      eNotation: false,
    },
    isArray(tagName) {
      return (
        tagName === "detalle" ||
        tagName === "impuesto" ||
        tagName === "pago" ||
        tagName === "totalImpuesto" ||
        tagName === "campoAdicional" ||
        tagName === "detAdicional"
      );
    },
    parseTagValue: true,
    tagValueProcessor(tagName, tagValue) {
      if (
        tagName === "propina" ||
        tagName === "contribuyenteEspecial" ||
        tagName === "secuencial" ||
        tagName === "ruc" ||
        tagName === "estab" ||
        tagName === "ptoEmi" ||
        tagName === "formaPago" ||
        tagName === "codigoPrincipal" ||
        tagName === "codigoAuxiliar"
      ) {
        return `${tagValue}`;
      }
      return tagValue;
    },
  });

  const xml: XmlData | undefined = parser.parse(invoiceStr) as XmlData | undefined;
  if (!xml) {
    return [undefined, undefined, { fileName, error: "Invalid XML" }];
  }
  const tributaryFileContent: TributaryFile | undefined = parser.parse(
    xml?.autorizacion?.comprobante?.__cdata,
  ) as TributaryFile | undefined;

  if (!tributaryFileContent) {
    return [undefined, undefined, { fileName, error: "Invalid XML __cdata" }];
  }

  if (!tributaryFileContent.factura && !tributaryFileContent.notaCredito) {
    return [undefined, undefined, { fileName, error: "Invalid XML __cdata cannot found invoice or credit note field" }];
  }
  let invoiceFile: InvoiceFile | undefined = undefined;
  let creditNoteFile: CreditNoteFile | undefined = undefined;
  const invoiceContent: InvoiceXML | undefined = tributaryFileContent.factura;
  if (invoiceContent) {
    const month = parseInt(invoiceContent?.infoFactura.fechaEmision?.split("/")[1] ?? "-1");
    const fileMonth = parseInt(fileName.split("-")[0] ?? "-1");
    if (month === -1 || fileMonth === -1 || month !== fileMonth + 1) {
      return [undefined, undefined, { fileName, error: `Invalid month ${month} in XML vs ${fileMonth+1} in file` }];
    }
    invoiceFile = {
      fileName,
      content: invoiceContent,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const creditNoteContent = tributaryFileContent.notaCredito;

  if (creditNoteContent) {
    creditNoteFile = {
      fileName,
      content: creditNoteContent,
    };
  }

  return [invoiceFile, creditNoteFile];
};

type XmlData = {
  autorizacion: {
    comprobante: {
      __cdata: string;
    };
  };
  [key: string]: unknown;
};

export interface TributaryFile {
  factura?: InvoiceXML;
  notaCredito?: CreditNoteXML;
}

export interface InvoiceFile {
  fileName: string;
  content: InvoiceXML;
}

export interface CreditNoteFile {
  fileName: string;
  content: CreditNoteXML;
}

const getInvoiceTaxTotal = (invoice: InvoiceFile, tax: number): number => {
  return invoice.content.detalles.detalle.reduce((p, c) => p +
    c.impuestos.impuesto
      .filter((v) => v.tarifa === tax)
      .reduce((p2, c2) => p2 + c2.baseImponible, 0),
    0,
  );
}


export { parseTributaryFile, isRuc, getInvoiceTaxTotal };
