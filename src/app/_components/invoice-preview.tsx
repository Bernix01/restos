import { isRuc, type InvoiceFile, getInvoiceTaxTotal } from "@/lib/invoice.parser";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";

type InvoicePreviewProps = {
  invoice: InvoiceFile;
  taxesTypes: number[];
};
const variants = ["default", "secondary", "destructive"];

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, taxesTypes }) => {

  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{invoice.content.infoTributaria.razonSocial}</CardTitle>
        <CardDescription className="flow flow-row gap-2">
          <Badge variant={"outline"}>
            {isRuc(invoice.content.infoFactura.identificacionComprador)
              ? "RUC"
              : "PERSONA"}
          </Badge>
          <Badge variant={"outline"}>
            {invoice.content.infoFactura.fechaEmision}
          </Badge>
          <Badge variant={"outline"}>
            {invoice.content.infoTributaria.estab}-
            {invoice.content.infoTributaria.ptoEmi}-
            {invoice.content.infoTributaria.secuencial}
          </Badge>
          <Badge variant={"outline"}>
            {invoice.content.detalles.detalle.length} items
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <p className="text-xs font-medium">
        </p>
      </CardFooter>

      <CardFooter className="space-x-2">
        {taxesTypes.map((tax, index) => (
          <Badge
            variant={variants[Math.min(variants.length - 1, index)] as "default" | "secondary" | "destructive" | "outline"}
            key={tax}
          >
            {USDollar.format(
              getInvoiceTaxTotal(invoice, tax))}{" "}
            - {tax}%
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
};

export default InvoicePreview;
