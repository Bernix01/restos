"use client";
import { Button } from "@/app/_components/ui/button";
import { useRouter } from "next/navigation";

const ImportInvoiceButton: React.FC = () => {
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        router.push("/invoices/import");
      }}
    >
      Import
    </Button>
  );
};

export default ImportInvoiceButton;
