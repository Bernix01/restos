import { isRuc, type CreditNoteFile } from "@/lib/invoice.parser";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { type ImpuestosClass } from "@/lib/invoice.parser.types";

type CreditNotePreviewProps = {
  creditNote: CreditNoteFile;
  taxesTypes: number[];
};

const variants = ["default", "secondary", "destructive"];

const CreditNotePreview: React.FC<CreditNotePreviewProps> = ({
  creditNote,
  taxesTypes,
}) => {
  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {creditNote.content.infoNotaCredito.motivo} -{" "}
          {USDollar.format(
            creditNote.content.infoNotaCredito.totalConImpuestos.totalImpuesto.reduce(
              (p, c) => p + c.baseImponible + c.valor,
              0,
            ),
          )}
        </CardTitle>
        <CardDescription>
          <Badge variant={"outline"}>
            {isRuc(creditNote.content.infoNotaCredito.identificacionComprador)
              ? "RUC"
              : "PERSONA"}
          </Badge>
          <Badge variant={"outline"}>
            {creditNote.content.infoNotaCredito.fechaEmision}
          </Badge>
          <Badge variant={"outline"}>
            {creditNote.content.infoNotaCredito.numDocModificado}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardFooter className="space-x-2">
        {taxesTypes.map((tax, index) => (
          <Badge
            variant={variants[Math.min(variants.length - 1, index)]}
            key={tax}
          >
            {USDollar.format(
              creditNote.content.detalles.detalle.reduce((p, c) => {
                if ((c.impuestos as ImpuestosClass).impuesto)
                  return (
                    p +
                    (c.impuestos as ImpuestosClass).impuesto
                      .filter((v) => v.tarifa === tax)
                      .reduce((p, c) => p + c.baseImponible, 0)
                  );
                return p;
              }, 0),
            )}{" "}
            - {tax}%
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
};

export default CreditNotePreview;
