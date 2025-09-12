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
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  // Server-side pagination support
  pageIndex?: number
  pageSize?: number
  pageCount?: number
  onPaginationChange?: (updater: { pageIndex: number; pageSize: number }) => void
  manualPagination?: boolean
  // Custom row styling
  getRowClassName?: (row: TData, index: number) => string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
  manualPagination = false,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
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
            // updater is a function or object
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

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

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
                            {isSorted === 'asc' && <ArrowUp className="w-3 h-3 text-[#A4D65E]" />}
                            {isSorted === 'desc' && <ArrowDown className="w-3 h-3 text-[#A4D65E]" />}
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
                      className={`py-3 px-3 text-[13px] font-semibold ${cell.column.id === 'actions' ? 'pointer-events-auto relative z-10' : ''}`}
                      onClick={cell.column.id === 'actions' ? (e) => { e.stopPropagation(); } : undefined}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Showing</p>
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
          <p className="text-sm font-medium">of {table.getFilteredRowModel().rows.length} Entries</p>
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
