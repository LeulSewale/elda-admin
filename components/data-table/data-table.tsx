"use client"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, RefreshCw, Eye, Pencil, Trash2, FileDown } from "lucide-react"
import { useTranslations } from 'next-intl'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
 
  searchKey: string
  searchPlaceholder?: string
  // Quick filter buttons (e.g., for status)
  quickFilterKey?: keyof TData | string
  quickFilterLabel?: string
  quickFilterLimit?: number
  // Export functionality
  onExportCSV?: () => void
  showExportButton?: boolean
  // Server-side pagination support
  pageIndex?: number
  pageSize?: number
  pageCount?: number
  onPaginationChange?: (updater: { pageIndex: number; pageSize: number } | ((prev: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number })) => void
  manualPagination?: boolean
  // Custom row styling
  getRowClassName?: (row: TData, index: number) => string
}

export function DataTable<TData, TValue>({
  columns,
 
  data,
  searchKey,
  searchPlaceholder = "Search...",
  quickFilterKey,
  quickFilterLabel = "Status",
  quickFilterLimit = 5,
  onExportCSV,
  showExportButton = false,
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
  manualPagination = false,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const tCommon = useTranslations('common');
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  // Internal state for client-side pagination fallback
  const [internalPageIndex, setInternalPageIndex] = useState(0)
  const [internalPageSize, setInternalPageSize] = useState(10)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination,
    pageCount: manualPagination && pageCount !== undefined ? pageCount : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: manualPagination
        ? {
            pageIndex: pageIndex ?? 0,
            pageSize: pageSize ?? 10,
          }
        : {
            pageIndex: internalPageIndex,
            pageSize: internalPageSize,
          },
    },
    onPaginationChange: manualPagination
      ? (updater) => {
          if (onPaginationChange) {
            if (typeof updater === 'function') {
              const next = updater({
                pageIndex: pageIndex ?? 0,
                pageSize: pageSize ?? 10,
              })

              onPaginationChange(next)
            } else {
              onPaginationChange(updater)
            }
          }
        }
      : (updater) => {
          if (typeof updater === 'function') {
            const next = updater({
              pageIndex: internalPageIndex,
              pageSize: internalPageSize,
            })
            setInternalPageIndex(next.pageIndex)
            setInternalPageSize(next.pageSize)
          } else {
            setInternalPageIndex(updater.pageIndex)
            setInternalPageSize(updater.pageSize)
          }
        },
  })

  // Quick filter support (derive unique values from data based on quickFilterKey)
  const quickFilterValues = useMemo(() => {
    if (!quickFilterKey) return [] as string[];
    try {
      const rawValues = (data as any[]).map((row) => row?.[quickFilterKey as any]);
      const unique = Array.from(
        new Set(
          rawValues
            .filter((v) => v !== undefined && v !== null && v !== "")
            .map((v) => String(v))
        )
      );
      return unique;
    } catch {
      return [] as string[];
    }
  }, [data, quickFilterKey]);

  const quickCol = quickFilterKey ? table.getColumn(String(quickFilterKey)) : undefined;
  const currentQuickValue = (quickCol?.getFilterValue() as string | undefined) ?? undefined;

  const setQuickFilter = (value?: string) => {
    if (!quickCol) return;
    if (!value) quickCol.setFilterValue(undefined);
    else quickCol.setFilterValue(value);
  };

  // Function to handle CSV export
  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
    } else {
      // Default CSV export behavior if no handler is provided
      console.log('Exporting to CSV...');
      // Example: exportToCSV(data, 'export.csv');
    }
  };

  return (
    <div className="space-y-0">
      <div className="px-2 py-3">
        <div className="flex items-center justify-between mb-1">
          {/* Left group: Filter section with employment type filters */}
          <div className="flex items-center gap-2">
            {quickFilterKey && quickFilterValues.length > 0 && (
              <div className="flex items-center gap-2">
                
                <div className="inline-flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-9 rounded-none rounded-l-md px-3 text-xs ${!currentQuickValue ? 'bg-[#EEF5FF] text-[#1E66F5] border-[#BBD3FF]' : ''}`}
                    onClick={() => setQuickFilter(undefined)}
                    aria-pressed={!currentQuickValue}
                  >
                    {tCommon('all')}
                  </Button>
                  {quickFilterValues.slice(0, quickFilterLimit).map((val, idx, arr) => (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      className={`h-9 rounded-none -ml-px px-3 text-xs capitalize ${idx === arr.length - 1 ? 'rounded-r-md' : ''} ${currentQuickValue === val ? 'bg-[#EEF5FF] text-[#1E66F5] border-[#BBD3FF]' : ''}`}
                      onClick={() => setQuickFilter(val)}
                      title={`${quickFilterLabel}: ${val}`}
                      aria-pressed={currentQuickValue === val}
                    >
                      {val.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Right group: Search and actions */}
          <div className="flex items-center gap-2">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                className="pl-10 h-10 text-sm border-[#e7eeff] focus-visible:ring-1 focus-visible:ring-[#e7eeff]"
              />
            </div>
            {showExportButton && (
              <Button
                variant="outline"
                size="sm"
                className="h-10 border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                onClick={handleExportCSV}
              >
                <FileDown className="h-4 w-4 mr-2" />
                {tCommon('exportCSV')}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-10 border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              onClick={() => table.reset()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        `font-semibold text-gray-700 select-none group ${canSort ? 'cursor-pointer' : ''}`
                      }
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="flex flex-row gap-1 ml-1">
                            {isSorted === false && (
                              <>
                                <ArrowUp className="w-3 h-3 text-gray-300" />
                                <ArrowDown className="w-3 h-3 text-gray-300" />
                              </>
                            )}
                            {isSorted === 'asc' && <ArrowUp className="w-3 h-3 text-blue-500" />}
                            {isSorted === 'desc' && <ArrowDown className="w-3 h-3 text-blue-500" />}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    `hover:bg-[#F6FAF0] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 ${
                      getRowClassName ? getRowClassName(row.original, i) : ''
                    }`
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`py-4 px-4 text-[13px] font-semibold`}
                      data-cell-id={cell.column.id}
                    >
                      {flexRender(cell.column.columnDef.cell, { ...cell.getContext(), visibleIndex: i })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {tCommon('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{tCommon('showing')}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[7, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm font-medium">{tCommon('of')} {table.getFilteredRowModel().rows.length} {tCommon('entries')}</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
              const pageIndex = i + 1
              const isCurrentPage = table.getState().pagination.pageIndex + 1 === pageIndex

              return (
                <Button
                  key={pageIndex}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex(pageIndex - 1)}
                  className="w-8 h-8 p-0"
                >
                  {pageIndex}
                </Button>
              )
            })}

            {table.getPageCount() > 5 && (
              <>
                <span className="px-2">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  className="w-8 h-8 p-0"
                >
                  {table.getPageCount()}
                </Button>
              </>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
