/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import NumberToWords from "@/components/NumberToWords"
import { toast } from "sonner"

export default function Home() {
  const [roomName, setRoomName] = useState("")
  const [roomRent, setRoomRent] = useState("")
  const [oldElectricity, setOldElectricity] = useState("")
  const [newElectricity, setNewElectricity] = useState("")
  const [electricityPrice, setElectricityPrice] = useState("")
  const [saveElectricityPrice, setSaveElectricityPrice] = useState(false)
  const [oldWater, setOldWater] = useState("")
  const [newWater, setNewWater] = useState("")
  const [waterPrice, setWaterPrice] = useState("")
  const [saveWaterPrice, setSaveWaterPrice] = useState(false)
  const [bikeFee, setBikeFee] = useState("")
  const [saveBikeFee, setSaveBikeFee] = useState(false)
  const [trashFee, setTrashFee] = useState("")
  const [saveTrashFee, setSaveTrashFee] = useState(false)
  const [wifiFee, setWifiFee] = useState("")
  const [total, setTotal] = useState(0)
  const [history, setHistory] = useState<any[]>([])
  const [search, setSearch] = useState("")

  // Hàm parse input số tiền (1.000.000 -> 1000000)
  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d]/g, "")
    return parseInt(cleaned) || 0
  }

  // Format input khi user nhập
  const formatInput = (value: string): string => {
    const num = parseCurrency(value)
    return num > 0 ? formatCurrency(num) : ""
  }

  // Xác định badge cho tổng tiền
  const getTotalBadge = (total: number) => {
    if (total < 2000000) return <Badge variant="default">Thấp</Badge>
    if (total < 5000000) return <Badge variant="secondary">Trung bình</Badge>
    return <Badge variant="destructive">Cao</Badge>
  }

  useEffect(() => {
    // Load saved prices from localStorage with validation
    const savedElec = localStorage.getItem("electricityPrice")
    if (savedElec && !isNaN(parseInt(savedElec))) {
      setElectricityPrice(formatCurrency(parseInt(savedElec)))
    }
    const savedWater = localStorage.getItem("waterPrice")
    if (savedWater && !isNaN(parseInt(savedWater))) {
      setWaterPrice(formatCurrency(parseInt(savedWater)))
    }
    const savedBike = localStorage.getItem("bikeFee")
    if (savedBike && !isNaN(parseInt(savedBike))) {
      setBikeFee(formatCurrency(parseInt(savedBike)))
    }
    const savedTrash = localStorage.getItem("trashFee")
    if (savedTrash && !isNaN(parseInt(savedTrash))) {
      setTrashFee(formatCurrency(parseInt(savedTrash)))
    }

    // Load history với filter invalid entries
    const savedHistory = localStorage.getItem("rentHistory")
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        // Filter chỉ giữ entry hợp lệ (total phải là number > 0, roomRent là number, etc.)
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
        console.log("Loaded valid history entries:", validHistory.length) // Debug: xóa sau
        setHistory(validHistory)

        // Nếu có entry invalid, cập nhật lại localStorage để tránh lỗi lần sau
        if (validHistory.length !== parsedHistory.length) {
          localStorage.setItem("rentHistory", JSON.stringify(validHistory))
        }
      } catch (e) {
        console.error("Error parsing rentHistory:", e)
        // Clear invalid data
        localStorage.removeItem("rentHistory")
        setHistory([])
      }
    }
  }, [])

  const calculate = () => {
    const roomRentNum = parseCurrency(roomRent)
    const elecUsage =
      parseCurrency(newElectricity) - parseCurrency(oldElectricity)
    const elecCost = Math.max(0, elecUsage) * parseCurrency(electricityPrice) // Đảm bảo >=0
    const waterUsage = parseCurrency(newWater) - parseCurrency(oldWater)
    const waterCost = Math.max(0, waterUsage) * parseCurrency(waterPrice) // Đảm bảo >=0
    const bikeFeeNum = parseCurrency(bikeFee)
    const trashFeeNum = parseCurrency(trashFee)
    const wifiFeeNum = parseCurrency(wifiFee)
    const totalCost =
      roomRentNum + elecCost + waterCost + bikeFeeNum + trashFeeNum + wifiFeeNum

    // Validate trước khi lưu
    if (totalCost < 0 || isNaN(totalCost)) {
      toast.error("Lỗi tính toán: Tổng tiền không hợp lệ!")
      return
    }

    setTotal(totalCost)

    // Save to history với giá trị an toàn
    const newEntry = {
      id: Date.now(),
      roomName: roomName || "Phòng không tên",
      roomRent: Math.max(0, roomRentNum), // Đảm bảo >=0
      elecUsage: Math.max(0, elecUsage),
      elecCost: Math.max(0, elecCost),
      waterUsage: Math.max(0, waterUsage),
      waterCost: Math.max(0, waterCost),
      bikeFee: Math.max(0, bikeFeeNum),
      trashFee: Math.max(0, trashFeeNum),
      wifiFee: Math.max(0, wifiFeeNum),
      total: Math.max(0, totalCost),
      date: new Date().toLocaleString("vi-VN"),
    }
    const updatedHistory = [...history, newEntry]
    setHistory(updatedHistory)
    localStorage.setItem("rentHistory", JSON.stringify(updatedHistory))

    // Save prices if checked
    if (saveElectricityPrice) {
      localStorage.setItem(
        "electricityPrice",
        parseCurrency(electricityPrice).toString()
      )
    }
    if (saveWaterPrice) {
      localStorage.setItem("waterPrice", parseCurrency(waterPrice).toString())
    }
    if (saveBikeFee) {
      localStorage.setItem("bikeFee", parseCurrency(bikeFee).toString())
    }
    if (saveTrashFee) {
      localStorage.setItem("trashFee", parseCurrency(trashFee).toString())
    }

    toast(
      <>
        <div className="font-semibold">Tính toán thành công!</div>
        <div>Tổng: {formatCurrency(totalCost)}</div>
      </>
    )
  }

  // Lọc lịch sử với guard an toàn
  const filteredHistory = history.filter((entry) => {
    // Guard cho entry hợp lệ
    if (!entry || typeof entry.total !== "number" || isNaN(entry.total)) {
      return false
    }
    return (
      (entry.roomName || "").toLowerCase().includes(search.toLowerCase()) ||
      (entry.date || "").includes(search) ||
      formatCurrency(entry.total ?? 0).includes(search)
    )
  })

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tính Tiền Trọ Phòng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Form nhập liệu - giữ nguyên */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Label htmlFor="roomName" className="text-base font-medium">
                Tên phòng
              </Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="VD: Phòng A1"
                className="h-10"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="roomRent" className="text-base font-medium">
                Tiền phòng (VNĐ)
              </Label>
              <Input
                id="roomRent"
                value={roomRent}
                onChange={(e) => setRoomRent(formatInput(e.target.value))}
                placeholder="VD: 2.000.000"
                className="h-10"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="wifiFee" className="text-base font-medium">
                Tiền WiFi (VNĐ)
              </Label>
              <Input
                id="wifiFee"
                value={wifiFee}
                onChange={(e) => setWifiFee(formatInput(e.target.value))}
                placeholder="VD: 100.000"
                className="h-10"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-medium">Điện</Label>
              <Input
                placeholder="Chỉ số điện cũ (kWh)"
                value={oldElectricity}
                onChange={(e) => setOldElectricity(formatInput(e.target.value))}
                className="h-10"
              />
              <Input
                placeholder="Chỉ số điện mới (kWh)"
                value={newElectricity}
                onChange={(e) => setNewElectricity(formatInput(e.target.value))}
                className="h-10"
              />
              <Input
                placeholder="Giá điện/kWh (VNĐ)"
                value={electricityPrice}
                onChange={(e) =>
                  setElectricityPrice(formatInput(e.target.value))
                }
                className="h-10"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveElec"
                  checked={saveElectricityPrice}
                  onCheckedChange={(checked) =>
                    setSaveElectricityPrice(!!checked)
                  }
                />
                <Label htmlFor="saveElec">Lưu giá điện</Label>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-base font-medium">Nước</Label>
              <Input
                placeholder="Chỉ số nước cũ (m³)"
                value={oldWater}
                onChange={(e) => setOldWater(formatInput(e.target.value))}
                className="h-10"
              />
              <Input
                placeholder="Chỉ số nước mới (m³)"
                value={newWater}
                onChange={(e) => setNewWater(formatInput(e.target.value))}
                className="h-10"
              />
              <Input
                placeholder="Giá nước/m³ (VNĐ)"
                value={waterPrice}
                onChange={(e) => setWaterPrice(formatInput(e.target.value))}
                className="h-10"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveWater"
                  checked={saveWaterPrice}
                  onCheckedChange={(checked) => setSaveWaterPrice(!!checked)}
                />
                <Label htmlFor="saveWater">Lưu giá nước</Label>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="bikeFee" className="text-base font-medium">
                Tiền xe (VNĐ)
              </Label>
              <Input
                id="bikeFee"
                value={bikeFee}
                onChange={(e) => setBikeFee(formatInput(e.target.value))}
                placeholder="VD: 50.000"
                className="h-10"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveBike"
                  checked={saveBikeFee}
                  onCheckedChange={(checked) => setSaveBikeFee(!!checked)}
                />
                <Label htmlFor="saveBike">Lưu giá xe</Label>
              </div>
              <Label htmlFor="trashFee" className="text-base font-medium">
                Tiền rác (VNĐ)
              </Label>
              <Input
                id="trashFee"
                value={trashFee}
                onChange={(e) => setTrashFee(formatInput(e.target.value))}
                placeholder="VD: 30.000"
                className="h-10"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveTrash"
                  checked={saveTrashFee}
                  onCheckedChange={(checked) => setSaveTrashFee(!!checked)}
                />
                <Label htmlFor="saveTrash">Lưu giá rác</Label>
              </div>
            </div>
          </div>
          <Button
            onClick={calculate}
            className="w-full md:w-auto px-6 py-2 text-base"
          >
            Tính Toán
          </Button>

          {/* Kết quả - guard total */}
          {total > 0 && (
            <div className="mt-8">
              <p className="text-lg font-semibold">
                Tổng cộng: {formatCurrency(total ?? 0)} (
                <NumberToWords amount={total ?? 0} />){" "}
                {getTotalBadge(total ?? 0)}
              </p>
            </div>
          )}

          {/* Bảng thống kê - guard trong render */}
          {history.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Lịch Sử Tính Toán</h2>
              <Input
                placeholder="Tìm kiếm theo tên phòng, ngày hoặc tổng tiền"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 max-w-md"
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Phòng</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Tiền Phòng</TableHead>
                    <TableHead>Điện (sử dụng/cost)</TableHead>
                    <TableHead>Nước (sử dụng/cost)</TableHead>
                    <TableHead>Tiền Xe</TableHead>
                    <TableHead>Tiền Rác</TableHead>
                    <TableHead>Tiền WiFi</TableHead>
                    <TableHead>Tổng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.roomName || "N/A"}</TableCell>
                      <TableCell>{entry.date || "N/A"}</TableCell>
                      <TableCell>
                        {formatCurrency(entry.roomRent ?? 0)}
                      </TableCell>
                      <TableCell>
                        {entry.elecUsage ?? 0} kWh /{" "}
                        {formatCurrency(entry.elecCost ?? 0)}
                      </TableCell>
                      <TableCell>
                        {entry.waterUsage ?? 0} m³ /{" "}
                        {formatCurrency(entry.waterCost ?? 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(entry.bikeFee ?? 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(entry.trashFee ?? 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(entry.wifiFee ?? 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(entry.total ?? 0)}{" "}
                        {getTotalBadge(entry.total ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
