import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LucideIcon, TableIcon } from 'lucide-react';

interface DataTableColumn {
  header: string;
  className?: string;
}

interface DataTableProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  columns: DataTableColumn[];
  children: ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  actions?: ReactNode;
}

export function DataTable({
  title,
  description,
  icon: Icon,
  columns,
  children,
  isEmpty,
  emptyTitle = 'Nenhum dado encontrado',
  emptyDescription,
  emptyIcon,
  actions,
}: DataTableProps) {
  const content = isEmpty ? (
    <EmptyState
      icon={emptyIcon || TableIcon}
      title={emptyTitle}
      description={emptyDescription}
    />
  ) : (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((col, i) => (
              <TableHead key={i} className={col.className}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );

  if (!title) return content;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
              {title}
            </CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
