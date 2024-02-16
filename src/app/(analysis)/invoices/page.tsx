import { CalendarDateRangePicker } from "@/app/_components/date-range-picker";
import { db } from "@/server/db";
import type { Metadata } from "next";
import ImportInvoiceButton from "@/app/_components/import-invoice-btn";

export const metadata: Metadata = {
  title: "Invoices",
  description: "View all your invoices.",
};

const InvoicesPage: React.FC = async () => {
  // const invoices = await db.invoice.findMany();

  return (
    <>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <section className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <ImportInvoiceButton />
          </div>
        </section>
        {/* {invoices.map((invoice) => (
          <article key={invoice.id}>
            <h3>{invoice.invoiceDate.toLocaleString()}</h3>
            <p>${invoice.totalAmount.toString()}</p>
          </article>
        ))} */}
      </main>
    </>
  );
};
export default InvoicesPage;
