import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CostBreakdown } from "@/lib/cost/calculate-cost";

export function CostBreakdownTable({
  cost,
  currency,
}: {
  cost: CostBreakdown;
  currency: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>البند</TableHead>
          <TableHead className="text-end">القيمة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>سعر الغرفة ({cost.nights} ليالي)</TableCell>
          <TableCell className="text-end">
            {cost.roomSubtotal.toLocaleString()} {currency}
          </TableCell>
        </TableRow>
        {cost.childCharges.map((c, i) => (
          <TableRow key={i}>
            <TableCell className="text-muted-foreground">
              طفل بعمر {c.age} — {c.reason}
            </TableCell>
            <TableCell className="text-end text-muted-foreground">
              {c.charge.toLocaleString()} {currency}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-bold">الإجمالي</TableCell>
          <TableCell className="text-end font-bold">
            {cost.total.toLocaleString()} {currency}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
