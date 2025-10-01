/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Papa from "papaparse"
import { Trash, Edit, Settings } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Admin() {
  const [history, setHistory] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedEntries, setSelectedEntries] = useState<number[]>([])
  const [editEntry, setEditEntry] = useState<any | null>(null)
  const [visibleColumns, setVisibleColumns] = useState({
    roomName: true,
    date: true,
    roomRent: true,
    elecUsage: true,
    waterUsage: true,
    bikeFee: true,
    trashFee: true,
    wifiFee: true,
    total: true,
  })

  useEffect(() => {
    // Load history với filter invalid entries
    const savedHistory = localStorage.getItem("rentHistory")
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        const validHistory = parsedHistory.filter((entry: any) => {
          return (
            entry &&
            typeof entry.id === "number" &&
            typeof entry.total === "number" &&
            !isNaN(entry.total) &&
            entry.total >= 0 &&
            typeof entry.roomRent === "number" &&
            !isNaN(entry.roomRent) &&
            typeof entry.date === "string" &&
            entry.roomName
          )
        })
        console.log("Admin: Loaded valid history entries:", validHistory.length) // Debug
        setHistory(validHistory)
        if (validHistory.length !== parsedHistory.length) {
          localStorage.setItem("rentHistory", JSON.stringify(validHistory))
        }
      } catch (e) {
        console.error("Admin: Error parsing rentHistory:", e)
        localStorage.removeItem("rentHistory")
        setHistory([])
      }
    }
  }, [])

  const updateHistory = (newHistory: any[]) => {
    setHistory(newHistory)
    localStorage.setItem("rentHistory", JSON.stringify(newHistory))
  }

  const deleteEntry = (id: number) => {
    const newHistory = history.filter((entry) => entry.id !== id)
    updateHistory(newHistory)
    setSelectedEntries(
      selectedEntries.filter((selectedId) => selectedId !== id)
    )
    toast(
      <>
        <div className="font-semibold">Đã xóa!</div>
      </>
    )
  }

  const deleteSelected = () => {
    const newHistory = history.filter(
      (entry) => !selectedEntries.includes(entry.id)
    )
    updateHistory(newHistory)
    setSelectedEntries([])
    toast(
      <>
        <div className="font-semibold">
          Đã xóa {selectedEntries.length} mục!
        </div>
      </>
    )
  }

  const saveEdit = () => {
    if (
      !editEntry ||
      isNaN(editEntry.roomRent) ||
      isNaN(editEntry.elecUsage) ||
      isNaN(editEntry.waterUsage)
    ) {
      toast.error("Dữ liệu không hợp lệ!")
      return
    }
    const newHistory = history.map((entry) =>
      entry.id === editEntry.id ? editEntry : entry
    )
    updateHistory(newHistory)
    setEditEntry(null)
    toast(
      <>
        <div className="font-semibold">Đã cập nhật!</div>
      </>
    )
  }

  const exportCSV = () => {
    const csvData = history.map((entry) => ({
      "Tên Phòng": entry.roomName,
      Ngày: entry.date,
      "Tiền Phòng": formatCurrency(entry.roomRent ?? 0),
      "Điện (sử dụng/cost)": `${entry.elecUsage ?? 0} kWh / ${formatCurrency(
        entry.elecCost ?? 0
      )}`,
      "Nước (sử dụng/cost)": `${entry.waterUsage ?? 0} m³ / ${formatCurrency(
        entry.waterCost ?? 0
      )}`,
      "Tiền Xe": formatCurrency(entry.bikeFee ?? 0),
      "Tiền Rác": formatCurrency(entry.trashFee ?? 0),
      "Tiền WiFi": formatCurrency(entry.wifiFee ?? 0),
      Tổng: formatCurrency(entry.total ?? 0),
    }))
    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "rent_history.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }))
  }

  const toggleSelectAll = () => {
    if (selectedEntries.length === history.length) {
      setSelectedEntries([])
    } else {
      setSelectedEntries(history.map((entry) => entry.id))
    }
  }

  const toggleSelectEntry = (id: number) => {
    if (selectedEntries.includes(id)) {
      setSelectedEntries(
        selectedEntries.filter((selectedId) => selectedId !== id)
      )
    } else {
      setSelectedEntries([...selectedEntries, id])
    }
  }

  const filteredHistory = history.filter(
    (entry) =>
      entry &&
      ((entry.roomName || "").toLowerCase().includes(search.toLowerCase()) ||
        (entry.date || "").includes(search) ||
        formatCurrency(entry.total ?? 0).includes(search))
  )

  // Xác định badge cho tổng tiền
  const getTotalBadge = (total: number) => {
    if (total < 2000000) return <Badge variant="default">Thấp</Badge>
    if (total < 5000000) return <Badge variant="secondary">Trung bình</Badge>
    return <Badge variant="destructive">Cao</Badge>
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Quản Lý Dữ Liệu Tiền Trọ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Input
              placeholder="Tìm kiếm theo tên phòng, ngày hoặc tổng tiền"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <div className="flex gap-2">
              <Button onClick={exportCSV}>Export CSV</Button>
              <Button
                onClick={deleteSelected}
                disabled={selectedEntries.length === 0}
                variant="destructive"
              >
                Xóa {selectedEntries.length > 0 ? selectedEntries.length : ""}{" "}
                mục
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" /> Cột hiển thị
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Chọn cột hiển thị</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.keys(visibleColumns).map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      checked={
                        visibleColumns[column as keyof typeof visibleColumns]
                      }
                      onCheckedChange={() =>
                        toggleColumn(column as keyof typeof visibleColumns)
                      }
                    >
                      {column === "roomName" && "Tên Phòng"}
                      {column === "date" && "Ngày"}
                      {column === "roomRent" && "Tiền Phòng"}
                      {column === "elecUsage" && "Điện (sử dụng/cost)"}
                      {column === "waterUsage" && "Nước (sử dụng/cost)"}
                      {column === "bikeFee" && "Tiền Xe"}
                      {column === "trashFee" && "Tiền Rác"}
                      {column === "wifiFee" && "Tiền WiFi"}
                      {column === "total" && "Tổng"}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={
                      selectedEntries.length === history.length &&
                      history.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                {visibleColumns.roomName && <TableHead>Tên Phòng</TableHead>}
                {visibleColumns.date && <TableHead>Ngày</TableHead>}
                {visibleColumns.roomRent && <TableHead>Tiền Phòng</TableHead>}
                {visibleColumns.elecUsage && (
                  <TableHead>Điện (sử dụng/cost)</TableHead>
                )}
                {visibleColumns.waterUsage && (
                  <TableHead>Nước (sử dụng/cost)</TableHead>
                )}
                {visibleColumns.bikeFee && <TableHead>Tiền Xe</TableHead>}
                {visibleColumns.trashFee && <TableHead>Tiền Rác</TableHead>}
                {visibleColumns.wifiFee && <TableHead>Tiền WiFi</TableHead>}
                {visibleColumns.total && <TableHead>Tổng</TableHead>}
                <TableHead>Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEntries.includes(entry.id)}
                      onCheckedChange={() => toggleSelectEntry(entry.id)}
                    />
                  </TableCell>
                  {visibleColumns.roomName && (
                    <TableCell>{entry.roomName || "N/A"}</TableCell>
                  )}
                  {visibleColumns.date && (
                    <TableCell>{entry.date || "N/A"}</TableCell>
                  )}
                  {visibleColumns.roomRent && (
                    <TableCell>{formatCurrency(entry.roomRent ?? 0)}</TableCell>
                  )}
                  {visibleColumns.elecUsage && (
                    <TableCell>
                      {entry.elecUsage ?? 0} kWh /{" "}
                      {formatCurrency(entry.elecCost ?? 0)}
                    </TableCell>
                  )}
                  {visibleColumns.waterUsage && (
                    <TableCell>
                      {entry.waterUsage ?? 0} m³ /{" "}
                      {formatCurrency(entry.waterCost ?? 0)}
                    </TableCell>
                  )}
                  {visibleColumns.bikeFee && (
                    <TableCell>{formatCurrency(entry.bikeFee ?? 0)}</TableCell>
                  )}
                  {visibleColumns.trashFee && (
                    <TableCell>{formatCurrency(entry.trashFee ?? 0)}</TableCell>
                  )}
                  {visibleColumns.wifiFee && (
                    <TableCell>{formatCurrency(entry.wifiFee ?? 0)}</TableCell>
                  )}
                  {visibleColumns.total && (
                    <TableCell>
                      {formatCurrency(entry.total ?? 0)}{" "}
                      {getTotalBadge(entry.total ?? 0)}
                    </TableCell>
                  )}
                  <TableCell className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditEntry({ ...entry })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Chỉnh Sửa Entry</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Tên Phòng</Label>
                            <Input
                              value={editEntry?.roomName || ""}
                              onChange={(e) =>
                                setEditEntry({
                                  ...editEntry,
                                  roomName: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Tiền Phòng (VNĐ)</Label>
                            <Input
                              type="number"
                              value={editEntry?.roomRent ?? 0}
                              onChange={(e) =>
                                setEditEntry({
                                  ...editEntry,
                                  roomRent: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Chỉ số điện sử dụng (kWh)</Label>
                            <Input
                              type="number"
                              value={editEntry?.elecUsage ?? 0}
                              onChange={(e) =>
                                setEditEntry({
                                  ...editEntry,
                                  elecUsage: parseInt(e.target.value) || 0,
                                  elecCost:
                                    (parseInt(e.target.value) || 0) *
                                    (parseInt(
                                      localStorage.getItem(
                                        "electricityPrice"
                                      ) || "0"
                                    ) || 0),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Chỉ số nước sử dụng (m³)</Label>
                            <Input
                              type="number"
                              value={editEntry?.waterUsage ?? 0}
                              onChange={(e) =>
                                setEditEntry({
                                  ...editEntry,
                                  waterUsage: parseInt(e.target.value) || 0,
                                  waterCost:
                                    (parseInt(e.target.value) || 0) *
                                    (parseInt(
                                      localStorage.getItem("waterPrice") || "0"
                                    ) || 0),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Tiền Xe (VNĐ)</Label>
                            <Input
                              type="number"
                              value={editEntry?.bikeFee ?? 0}
                              onChange={(e) =>
                                setEditEntry({
                                  ...editEntry,
                                  bikeFee: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Tiền Rác (VNĐ)</Label>
                            <Input
                              type="number"
                              value={editEntry?.trashFee ?? 0}
                              onChange={(e) =>
                                setEditEntry({
                                  ...editEntry,
                                  trashFee: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Tiền WiFi (VNĐ)</Label>
                            <Input
                              type="number"
                              value={editEntry?.wifiFee ?? 0}
                              onChange={(e) =>
                                setEditEntry({
                                  ...editEntry,
                                  wifiFee: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <Button onClick={saveEdit}>Lưu</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
