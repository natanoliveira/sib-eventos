import { CardTitle, CardDescription } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface DataTableHeaderProps {
  title: string;
  totalItems: number;
  itemLabel?: string;
  itemsPerPage: number;
  onItemsPerPageChange: (value: string) => void;
}

export function DataTableHeader({
  title,
  totalItems,
  itemLabel = "itens",
  itemsPerPage,
  onItemsPerPageChange,
}: DataTableHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <CardTitle className="text-blue-900">{title}</CardTitle>
        <CardDescription>
          {totalItems} {itemLabel} {totalItems === 1 ? itemLabel.slice(0, -1) : itemLabel} encontrado{totalItems === 1 ? '' : 's'}
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Itens por página:</span>
        <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
