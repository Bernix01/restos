"use client";
import { Button } from "@/app/_components/ui/button";
import { useEffect, useState } from "react";
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
                {(file.content.detalles.detalle as Detalle[]).length ? (
                  (file.content.detalles.detalle as Detalle[])
                    .slice(0, 2)
                    .map((detalle, index) => (
                      <div key={index} className="flex justify-between gap-4">
                        <p>{detalle.descripcion}</p>
                        <p>{detalle.precioTotalSinImpuesto}</p>
                      </div>
                    ))
                ) : (
                  <div key={index} className="flex justify-between gap-4">
                    <p>
                      {(file.content.detalles.detalle as Detalle).descripcion}
                    </p>
                    <p>
                      {
                        (file.content.detalles.detalle as Detalle)
                          .precioTotalSinImpuesto
                      }
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="font-medium">
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
