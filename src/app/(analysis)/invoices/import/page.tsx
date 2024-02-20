"use client";
import { Button } from "@/app/_components/ui/button";
import { useEffect, useMemo, useState } from "react";
import type { CreditNoteFile, InvoiceFile, ParseError } from "@/lib/invoice.parser";
import { useFilePicker } from "use-file-picker";
import { getInvoiceTaxTotal, parseTributaryFile } from "@/lib/invoice.parser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import InvoicePreview from "@/app/_components/invoice-preview";
import CreditNotePreview from "@/app/_components/creditnote-preview";
import { type ImpuestosClass } from "@/lib/invoice.parser.types";
import moment from "moment";
import ExpensesGraph from "@/app/_components/expenses-graph";

const ImportPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceFile[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNoteFile[]>([]);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: ".xml",
    multiple: true,
    readAs: "ArrayBuffer",
    readFilesContent: true,
  });

  useEffect(() => {
    if (filesContent.length > 0) {
      const docs: [InvoiceFile[], CreditNoteFile[], ParseError[]] = filesContent.reduce(
        (p, f) => {
          const [invoice, creditnote, parseError] = parseTributaryFile(
            f.name,
            Buffer.from(f.content),
          );
          if (invoice) {
            p[0].push(invoice);
            return p;
          }
          if (creditnote) {
            p[1].push(creditnote);
            return p;
          }
          if (parseError) {
            p[2].push(parseError);
            return p;
          }
          p[2].push({ fileName: f.name, error: "Unknown error" });
          return p;
        },
        [[], [], []] as [InvoiceFile[], CreditNoteFile[], ParseError[]],
      );
      setInvoices(docs[0]);
      setCreditNotes(docs[1]);
      setParseErrors(docs[2]);
    }
  }, [filesContent]);

  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const businessInvoices = useMemo(() => {
    return invoices.filter((v) =>
      v.content.infoFactura.identificacionComprador.endsWith("001"),
    );
  }, [invoices]);

  const business1SInvoices = useMemo(() => {
    return businessInvoices.filter((v) => {
      const date = moment(v.content.infoFactura.fechaEmision, 'DD/MM/YYYY');
      return date.get('month') <= 5;
    });
  }, [businessInvoices]);

  const business2SInvoices = useMemo(() => {
    return businessInvoices.filter((v) => {
      const date = moment(v.content.infoFactura.fechaEmision, 'DD/MM/YYYY');
      if (date.get('year') <= 2020) {
        console.error("Invalid date", date, v.content.infoFactura.fechaEmision);
      }
      return date.get('month') > 5;
    });
  }, [businessInvoices]);

  const businessCreditNotes = useMemo(() => {
    return creditNotes.filter((v) =>
      v.content.infoNotaCredito.identificacionComprador.endsWith("001"),
    );
  }, [creditNotes]);

  const business1SCreditNotes = useMemo(() => {
    return businessCreditNotes.filter((v) => {
      const date = moment(v.content.infoNotaCredito.fechaEmision, 'DD/MM/YYYY');
      return date.get('month') <= 5;
    });
  }, [businessCreditNotes]);

  const business2SCreditNotes = useMemo(() => {
    return businessCreditNotes.filter((v) => {
      const date = moment(v.content.infoNotaCredito.fechaEmision, 'DD/MM/YYYY');
      return date.get('month') > 5;
    });
  }, [businessCreditNotes]);

  const personalInvoices = useMemo(() => {
    return invoices.filter(
      (v) => !v.content.infoFactura.identificacionComprador.endsWith("001"),
    );
  }, [invoices]);

  // const personalCreditNotes = useMemo(() => {
  //   return creditNotes.filter(
  //     (v) => !v.content.infoNotaCredito.identificacionComprador.endsWith("001"),
  //   );
  // }, [creditNotes]);

  const invoicesTotal = useMemo(() => {
    return invoices.reduce((p, c) => {
      return p + c.content.infoFactura.importeTotal;
    }, 0);
  }, [invoices]);

  const [invoicesAverage, businessInvoicesAverage, personalInvoicesAverage] = useMemo(() => {
    const total = invoices.reduce((p, c) => {
      return p + c.content.infoFactura.importeTotal;
    }, 0);
    const businessTotal = businessInvoices.reduce((p, c) => {
      return p + c.content.infoFactura.importeTotal;
    }, 0);
    const personalTotal = personalInvoices.reduce((p, c) => {
      return p + c.content.infoFactura.importeTotal;
    }, 0);
    return [total / invoices.length, businessTotal / businessInvoices.length, personalTotal / personalInvoices.length];
  }, [invoices, businessInvoices, personalInvoices]);

  const taxesTypes = useMemo(() => {
    return invoices
      .reduce((p, c) => {
        return [
          ...p,
          ...c.content.detalles.detalle.reduce((p, c) => {
            return [
              ...p,
              ...c.impuestos.impuesto.map((v) => {
                return v.tarifa;
              }),
            ];
          }, [] as number[]),
        ];
      }, [] as number[])
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a - b);
  }, [invoices]);

  // const reasonTypes = useMemo(() => {
  //   return creditNotes
  //     .reduce((p, c) => {
  //       return [...p, c.content.infoNotaCredito.motivo];
  //     }, [] as string[])
  //     .filter((v, i, a) => a.indexOf(v) === i);
  // }, [creditNotes]);


  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <section className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Import</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={openFilePicker} disabled={loading}>
            Load Files
          </Button>
        </div>
      </section>
      {parseErrors.length > 0 ? <section>
        <h3 className="text-2xl font-bold tracking-tight">Errors</h3>
        <ul>
          {parseErrors.map((error, index) => (
            <li key={index}>
              <h4 className="text-xl font-bold tracking-tight">
                {error.fileName}
              </h4>
              <p>{error.error}</p>
            </li>
          ))}
        </ul>
      </section> : null}
      <section className="grid grid-cols-2 gap-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Total {USDollar.format(invoicesTotal)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1">
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {invoices.length + creditNotes.length}
                </h5>
                <p className="text-xs font-medium">files imported</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    businessInvoices.reduce((p, c) => {
                      return p + c.content.infoFactura.importeTotal;
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">Business expenses</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    personalInvoices.reduce((p, c) => {
                      return p + c.content.infoFactura.importeTotal;
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">Personal expenses</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(invoicesAverage)}
                </h5>
                <p className="text-xs font-medium">Average expense</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(businessInvoicesAverage)}
                </h5>
                <p className="text-xs font-medium">Avg business expense</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(personalInvoicesAverage)}
                </h5>
                <p className="text-xs font-medium">Avg personal expense</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Taxes</CardTitle>
            <CardDescription>Overview of generated taxes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1">
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    businessInvoices.reduce((p, c) => {
                      return (
                        p +
                        c.content.detalles.detalle.reduce((p, c) => {
                          return (
                            p +
                            c.impuestos.impuesto.reduce((p, c) => {
                              return p + c.valor;
                            }, 0)
                          );
                        }, 0)
                      );
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">Business taxes</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    personalInvoices.reduce((p, c) => {
                      return (
                        p +
                        c.content.detalles.detalle.reduce((p, c) => {
                          return (
                            p +
                            c.impuestos.impuesto.reduce((p, c) => {
                              return p + c.valor;
                            }, 0)
                          );
                        }, 0)
                      );
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">Personal taxes</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    invoices.reduce((p, c) => {
                      return (
                        p +
                        c.content.detalles.detalle.reduce((p, c) => {
                          return (
                            p +
                            c.impuestos.impuesto.reduce((p, c) => {
                              return p + c.valor;
                            }, 0)
                          );
                        }, 0)
                      );
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">Total taxes</p>
              </div>
              {taxesTypes.map((tax, index) => (
                <div key={index} className="flex flex-col text-center">
                  <h5 className="text-xl font-bold tracking-tight">
                    <Tooltip>
                      <TooltipContent>Personal</TooltipContent>
                      <TooltipTrigger>
                        {USDollar.format(
                          personalInvoices.reduce(
                            (p, c) =>
                              p +
                              getInvoiceTaxTotal(c, tax),
                            0,
                          ),
                        )}
                      </TooltipTrigger>
                    </Tooltip>
                    /
                    <Tooltip>
                      <TooltipContent>Business</TooltipContent>
                      <TooltipTrigger>
                        {USDollar.format(
                          businessInvoices.reduce(
                            (p, c) =>
                              p +
                              getInvoiceTaxTotal(c, tax),
                            0,
                          ),
                        )}
                      </TooltipTrigger>
                    </Tooltip>
                  </h5>
                  <p className="text-xs font-medium">{tax}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Semesters (Business)</CardTitle>
            <CardDescription>Subtotals invoices ({businessInvoices.length})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1">
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    business1SInvoices.reduce((p, c) => {
                      return (
                        p +
                        c.content.detalles.detalle.reduce((p, c) => {
                          return (
                            p +
                            c.impuestos.impuesto.reduce((p, c) => {
                              return p + c.baseImponible;
                            }, 0)
                          );
                        }, 0)
                      );
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">1st semester({business1SInvoices.length})</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    business2SInvoices.reduce((p, c) => {
                      return (
                        p +
                        c.content.detalles.detalle.reduce((p, c) => {
                          return (
                            p +
                            c.impuestos.impuesto.reduce((p, c) => {
                              return p + c.baseImponible;
                            }, 0)
                          );
                        }, 0)
                      );
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">2nd semester({business2SInvoices.length})</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    businessInvoices.reduce((p, c) => {
                      return (
                        p +
                        c.content.detalles.detalle.reduce((p, c) => {
                          return (
                            p +
                            c.impuestos.impuesto.reduce((p, c) => {
                              return p + c.baseImponible;
                            }, 0)
                          );
                        }, 0)
                      );
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">Total subtotal({businessInvoices.length})</p>
              </div>
              {taxesTypes.map((tax, index) => (
                <div key={index} className="flex flex-col text-center">
                  <h5 className="text-xl font-bold tracking-tight">
                    <Tooltip>
                      <TooltipContent>1st semester</TooltipContent>
                      <TooltipTrigger>
                        {USDollar.format(
                          business1SInvoices.reduce(
                            (p, c) =>
                              p +
                              c.content.detalles.detalle.reduce(
                                (p2, c2) =>
                                  p2 +
                                  c2.impuestos.impuesto
                                    .filter((v) => v.tarifa === tax)
                                    .reduce((p3, c3) => p3 + c3.baseImponible, 0),
                                0,
                              ),
                            0,
                          ),
                        )}
                      </TooltipTrigger>
                    </Tooltip>
                    /
                    <Tooltip>
                      <TooltipContent>2nd semester</TooltipContent>
                      <TooltipTrigger>
                        {USDollar.format(
                          business2SInvoices.reduce(
                            (p, c) =>
                              p +
                              getInvoiceTaxTotal(c, tax),
                            0,
                          ),
                        )}
                      </TooltipTrigger>
                    </Tooltip>
                  </h5>
                  <p className="text-xs font-medium">{tax}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Semesters (Business)</CardTitle>
            <CardDescription>Subtotals credit notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1">
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    business1SCreditNotes.reduce((p, c) => {
                      return (
                        p +
                        c.content.detalles.detalle.reduce((p, c) => {
                          if (!(c.impuestos as string[]).length) {
                            return (
                              p +
                              (c.impuestos as ImpuestosClass).impuesto.reduce(
                                (p, c) => {
                                  return p + c.baseImponible;
                                },
                                0,
                              )
                            );
                          }
                          return p;
                        }, 0)
                      );
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">1st semester</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    business2SCreditNotes.reduce((p, c) => {
                      return (
                        p +
                        c.content.detalles.detalle.reduce((p, c) => {
                          if (!(c.impuestos as string[]).length) {
                            return (
                              p +
                              (c.impuestos as ImpuestosClass).impuesto.reduce(
                                (p, c) => {
                                  return p + c.baseImponible;
                                },
                                0,
                              )
                            );
                          }
                          return p;
                        }, 0)
                      );
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">2nd semester</p>
              </div>
              <div className="flex flex-col text-center">
                <h5 className="text-xl font-bold tracking-tight">
                  {USDollar.format(
                    businessCreditNotes.reduce((p, c) => {
                      return (
                        p +
                        c.content.detalles.detalle.reduce((p, c) => {
                          if (!(c.impuestos as string[]).length) {
                            return (
                              p +
                              (c.impuestos as ImpuestosClass).impuesto.reduce(
                                (p, c) => {
                                  return p + c.baseImponible;
                                },
                                0,
                              )
                            );
                          }
                          return p;
                        }, 0)
                      );
                    }, 0),
                  )}
                </h5>
                <p className="text-xs font-medium">Total subtotal</p>
              </div>
              {taxesTypes.map((tax, index) => (
                <div key={index} className="flex flex-col text-center">
                  <h5 className="text-xl font-bold tracking-tight">
                    <Tooltip>
                      <TooltipContent>1st semester</TooltipContent>
                      <TooltipTrigger>
                        {USDollar.format(
                          business1SCreditNotes.reduce((p, c) => {
                            return (
                              p +
                              c.content.detalles.detalle.reduce((p, c) => {
                                if (!(c.impuestos as string[]).length) {
                                  return (
                                    p +
                                    (c.impuestos as ImpuestosClass).impuesto
                                      .filter((v) => v.tarifa === tax)
                                      .reduce((p, c) => {
                                        return p + c.baseImponible;
                                      }, 0)
                                  );
                                }
                                return p;
                              }, 0)
                            );
                          }, 0),
                        )}
                      </TooltipTrigger>
                    </Tooltip>
                    /
                    <Tooltip>
                      <TooltipContent>2nd semester</TooltipContent>
                      <TooltipTrigger>
                        {USDollar.format(
                          business2SCreditNotes.reduce((p, c) => {
                            return (
                              p +
                              c.content.detalles.detalle.reduce((p, c) => {
                                if (!(c.impuestos as string[]).length) {
                                  return (
                                    p +
                                    (c.impuestos as ImpuestosClass).impuesto
                                      .filter((v) => v.tarifa === tax)
                                      .reduce((p, c) => {
                                        return p + c.baseImponible;
                                      }, 0)
                                  );
                                }
                                return p;
                              }, 0)
                            );
                          }, 0),
                        )}
                      </TooltipTrigger>
                    </Tooltip>
                  </h5>
                  <p className="text-xs font-medium">{tax}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <h3 className="text-2xl font-bold tracking-tight">Expenses (Business)</h3>
      <ExpensesGraph invoices={businessInvoices} taxesType={taxesTypes} />
      <h3 className="text-2xl font-bold tracking-tight">Credit notes</h3>
      <h4 className="text-1xl font-bold tracking-tight">1st Semester</h4>
      <section className="grid grid-cols-4 gap-2">
        {business1SCreditNotes.map((creditNote, index) => (
          <CreditNotePreview
            taxesTypes={taxesTypes}
            creditNote={creditNote}
            key={index}
          />
        ))}
        {!business1SCreditNotes.length && (<p>No credit notes found</p>)}
      </section>
      <h4 className="text-1xl font-bold tracking-tight">2nd Semester</h4>
      <section className="grid grid-cols-4 gap-2">
        {business2SCreditNotes.map((creditNote) => (
          <CreditNotePreview
            taxesTypes={taxesTypes}
            creditNote={creditNote}
            key={creditNote.fileName}
          />
        ))}
        {!business2SCreditNotes.length && (<p>No credit notes found</p>)}
      </section>
      <h3 className="text-2xl font-bold tracking-tight">Invoices</h3>
      <section className="grid grid-cols-4 gap-2">
        {invoices.map((file) => (
          <InvoicePreview invoice={file} key={file.fileName} taxesTypes={taxesTypes} />
        ))}
      </section>
    </main>
  );
};
export default ImportPage;
