import { isRuc, type InvoiceFile } from "@/lib/invoice.parser";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";

type InvoicePreviewProps = {
  invoice: InvoiceFile;
};

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{invoice.content.infoTributaria.razonSocial}</CardTitle>
        <CardDescription>
          <Badge variant={"outline"}>
            {isRuc(invoice.content.infoFactura.identificacionComprador)
              ? "RUC"
              : "PERSONA"}
          </Badge>
          <Badge variant={"outline"}>
            {invoice.content.infoFactura.fechaEmision}
          </Badge>
          <Badge variant={"outline"}>
            {invoice.content.detalles.detalle.length} items
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <p className="text-xs font-medium">
          {invoice.content.infoTributaria.estab}-
          {invoice.content.infoTributaria.ptoEmi}-
          {invoice.content.infoTributaria.secuencial}
        </p>
      </CardFooter>
    </Card>
  );
};

export default InvoicePreview;
