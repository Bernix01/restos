import { getInvoiceTaxTotal, type InvoiceFile } from "@/lib/invoice.parser";
import { ResponsiveBar } from "@nivo/bar";
import moment from "moment";

export interface ExpensesGraphProps {
  invoices: InvoiceFile[];
  taxesType: number[];
}

const ExpensesGraph: React.FC<ExpensesGraphProps> = ({ invoices, taxesType }) => {
  const data = invoices.reduce((acc, invoice) => {
    const month = moment(invoice.content.infoFactura.fechaEmision, "DD-MM-YYYY").format("MMM");
    const amount = invoice.content.infoFactura.importeTotal;
    const taxes: Record<number, number> = taxesType.reduce((acc, tax) => {
      const taxValue = getInvoiceTaxTotal(invoice, tax);
      return { ...acc, [tax]: acc[tax] ?? 0 + taxValue }
    }, {} as Record<number, number>);
    if (acc.some(e => e.month === month)) {
      return acc.map(e => {
        if (e.month === month) {
          // add the taxes if the key exists in e
          const newTaxes = taxesType.reduce((acc, tax) => {
            return { ...acc, [tax]: (e[tax] as number ?? 0) + (taxes[tax] ?? 0) }
          }, {} as Record<number, number>)
          return { ...e, amount: e.amount + amount, ...newTaxes } //TODO: add stuff
        }
        return e;
      })
    } else {
      return [...acc, { month, amount, ...taxes }];
    }
  }, [] as { month: string, amount: number, [key: string]: number | string }[]);
  console.log(data);
  return (
    <div className="h-lvh">
      <ResponsiveBar
        data={data}
        keys={[...taxesType.map(e => e.toString())]}
        layout="vertical"
        indexBy="month"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              1.6
            ]
          ]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'month',
          legendPosition: 'middle',
          legendOffset: 32,
          truncateTickAt: 0
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'amount',
          legendPosition: 'middle',
          legendOffset: -40,
          truncateTickAt: 0
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        role="application"
        ariaLabel="Expenses graph"
        barAriaLabel={e => e.id + ": " + e.formattedValue + " in date: " + e.indexValue}
        valueFormat=">-$0,.2f" />
    </div>
  );
}

export default ExpensesGraph;
