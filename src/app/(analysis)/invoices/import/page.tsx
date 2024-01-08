"use client";
import { Button } from "@/app/_components/ui/button";
import { useEffect, useMemo, useState } from "react";
import type { Detalle, InvoiceFile } from "@/lib/invoice.parser";
import { useFilePicker } from "use-file-picker";
import { parseInvoice } from "@/lib/invoice.parser";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/_components/ui/tooltip";

const ImportPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceFile[]>([]);
  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: ".xml",
    multiple: true,
    readAs: "ArrayBuffer",
    readFilesContent: true,
  });

  useEffect(() => {
    if (filesContent.length > 0) {
      setInvoices(
        filesContent.map((f) => parseInvoice(f.name, Buffer.from(f.content))),
      );
    }
  }, [filesContent]);

  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const invoicesAverage = useMemo(() => {
    const total = invoices.reduce((p, c) => {
      return p + c.content.infoFactura.importeTotal;
    }, 0);
    return total / invoices.length;
  }, [invoices]);

  const businessInvoices = useMemo(() => {
    return invoices.filter((v) =>
      v.content.infoFactura.identificacionComprador.endsWith("001"),
    );
  }, [invoices]);

  const personalInvoices = useMemo(() => {
    return invoices.filter(
      (v) => !v.content.infoFactura.identificacionComprador.endsWith("001"),
    );
  }, [invoices]);

  const invoicesTotal = useMemo(() => {
    return invoices.reduce((p, c) => {
      return p + c.content.infoFactura.importeTotal;
    }, 0);
  }, [invoices]);

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
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [invoices]);

  return (
    <>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <section className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Import</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={openFilePicker} disabled={loading}>
              Load Files
            </Button>
            <Button>Import</Button>
          </div>
        </section>
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
                    {invoices.length}
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
                    {USDollar.format(
                      businessInvoices.reduce((p, c) => {
                        return p + c.content.infoFactura.importeTotal;
                      }, 0) / businessInvoices.length,
                    )}
                  </h5>
                  <p className="text-xs font-medium">Avg business expense</p>
                </div>
                <div className="flex flex-col text-center">
                  <h5 className="text-xl font-bold tracking-tight">
                    {USDollar.format(
                      personalInvoices.reduce((p, c) => {
                        return p + c.content.infoFactura.importeTotal;
                      }, 0) / personalInvoices.length,
                    )}
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
                                c.content.detalles.detalle.reduce(
                                  (p, c) =>
                                    p +
                                    c.impuestos.impuesto
                                      .filter((v) => v.tarifa === tax)
                                      .reduce((p, c) => p + c.valor, 0),
                                  0,
                                ),
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
                                c.content.detalles.detalle.reduce(
                                  (p, c) =>
                                    p +
                                    c.impuestos.impuesto
                                      .filter((v) => v.tarifa === tax)
                                      .reduce((p, c) => p + c.valor, 0),
                                  0,
                                ),
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
        </section>
        <section className="grid grid-cols-2 gap-4">
          {invoices.map((file, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle>
                  {file.content.infoFactura.razonSocialComprador}
                </CardTitle>
                <CardDescription>
                  {file.fileName}
                  <br />
                  {file.content.infoTributaria.estab}-
                  {file.content.infoTributaria.ptoEmi}-
                  {file.content.infoTributaria.secuencial}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-xs">
                {file.content.detalles.detalle.length ? (
                  file.content.detalles.detalle
                    .slice(0, 2)
                    .map((detalle, index) => (
                      <div key={index} className="flex justify-between gap-4">
                        <p>{detalle.descripcion}</p>
                        {detalle.impuestos.impuesto.map((v) => (
                          <p key={v.codigo}>
                            {v.tarifa}%<strong>({v.codigo})</strong>
                            {USDollar.format(v.valor)}
                          </p>
                        ))}
                        <p>{USDollar.format(detalle.precioTotalSinImpuesto)}</p>
                        <p>
                          {USDollar.format(
                            detalle.precioTotalSinImpuesto +
                              detalle.impuestos.impuesto.reduce(
                                (p, c) => p + c.valor,
                                0,
                              ),
                          )}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="flex justify-between gap-4">
                    <p>Sin items</p>
                    <p></p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-xs font-medium">
                  {file.content.infoFactura.fechaEmision}
                </p>
              </CardFooter>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
};
export default ImportPage;
