/* eslint-disable */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface StockMovement {
  id: string
  productId: string
  product: {
    name: string
  }
  quantity: number
  type: string
  date: string
}

interface Sale {
  id: string
  date: string
  productId: string
  product: {
    name: string
  }
  quantity: number
  price: number // Original price
  total: number // Final price after discount
}

export default function AccountingPage() {
  const [selectedMonth, setSelectedMonth] = useState("All")
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [salesSearch, setSalesSearch] = useState("")
  const [stockSearch, setStockSearch] = useState("")
  const [newStockEntry, setNewStockEntry] = useState({
    productId: "",
    quantity: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchStockMovements()
    fetchSales()
  }, [])

  const fetchStockMovements = async () => {
    try {
      const response = await fetch("/api/stock-movements")
      if (!response.ok) throw new Error("Failed to fetch stock movements")
      const data = await response.json()
      setStockMovements(data)
    } catch (error) {
      console.error("Error fetching stock movements:", error)
      toast({
        title: "Error",
        description: "Failed to fetch stock movements. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales")
      if (!response.ok) throw new Error("Failed to fetch sales")
      const data = await response.json()
      setSales(data)
    } catch (error) {
      console.error("Error fetching sales:", error)
      toast({
        title: "Error",
        description: "Failed to fetch sales. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewStockEntry((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddStockEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStockEntry.productId || !newStockEntry.quantity) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/stock-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStockEntry),
      })

      if (!response.ok) throw new Error("Failed to add stock entry")

      setNewStockEntry({ productId: "", quantity: "" })
      toast({
        title: "Success",
        description: "New stock entry added successfully",
      })
      fetchStockMovements() // Refresh stock movements
    } catch (error) {
      console.error("Error adding stock entry:", error)
      toast({
        title: "Error",
        description: "Failed to add stock entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredStockMovements =
    selectedMonth === "All"
      ? stockMovements
      : stockMovements.filter(
          (item) => new Date(item.date).toLocaleString("default", { month: "long" }) === selectedMonth,
        )

  const filteredSales =
    selectedMonth === "All"
      ? sales
      : sales.filter((item) => new Date(item.date).toLocaleString("default", { month: "long" }) === selectedMonth)

  // Search filtering functions
  const searchedSales = filteredSales.filter(
    (sale) =>
      sale.product.name.toLowerCase().includes(salesSearch.toLowerCase()) ||
      new Date(sale.date).toLocaleDateString().includes(salesSearch) ||
      sale.total.toString().includes(salesSearch),
  )

  const searchedStockMovements = filteredStockMovements.filter(
    (movement) =>
      movement.product.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
      new Date(movement.date).toLocaleDateString().includes(stockSearch) ||
      movement.type.toLowerCase().includes(stockSearch.toLowerCase()),
  )

  const monthlyStockInData = stockMovements
    .filter((movement) => movement.type === "IN")
    .reduce(
      (acc, movement) => {
        const month = new Date(movement.date).toLocaleString("default", { month: "long" })
        acc[month] = (acc[month] || 0) + movement.quantity
        return acc
      },
      {} as Record<string, number>,
    )

  const monthlyProfitData = sales.reduce(
    (acc, sale) => {
      const month = new Date(sale.date).toLocaleString("default", { month: "long" })
      acc[month] = (acc[month] || 0) + (sale.total - sale.price * sale.quantity)
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.keys(monthlyStockInData).map((month) => ({
    month,
    stockIn: monthlyStockInData[month],
    profit: monthlyProfitData[month] || 0,
  }))

  // Calculate total discount amount for filtered sales
  const totalDiscount = filteredSales.reduce((sum, sale) => {
    const originalTotal = sale.price * sale.quantity
    const discount = originalTotal - sale.total
    return sum + discount
  }, 0)

  // Calculate average discount rate
  const averageDiscountRate =
    filteredSales.length > 0
      ? (totalDiscount / filteredSales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0)) * 100
      : 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Accounting</h1>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Months</SelectItem>
            <SelectItem value="January">January</SelectItem>
            <SelectItem value="February">February</SelectItem>
            <SelectItem value="March">March</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit Overview</CardTitle>
            <CardDescription>Profit trends across months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock In Analysis</CardTitle>
            <CardDescription>Monthly breakdown of stock in quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stockIn" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Overview of sales and discounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600">
                  KSH {filteredSales.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Discount</p>
                <p className="text-2xl font-bold text-amber-600">KSH {totalDiscount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">({averageDiscountRate.toFixed(1)}% avg. rate)</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold text-purple-600">{filteredSales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock In Summary</CardTitle>
            <CardDescription>Overview of stock in quantities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Items Stocked</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredStockMovements
                    .filter((m) => m.type === "IN")
                    .reduce((sum, item) => sum + item.quantity, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Stock Movements</p>
                <p className="text-2xl font-bold text-indigo-600">{filteredStockMovements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Stock Entry</CardTitle>
          <CardDescription>Enter details for a new stock entry</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddStockEntry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID</Label>
                <Input
                  id="productId"
                  name="productId"
                  value={newStockEntry.productId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={newStockEntry.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <Button type="submit">Add Stock Entry</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Details</CardTitle>
          <CardDescription>Breakdown of sales and discounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search sales by product, date, or amount..."
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                className="max-w-sm"
              />
              {salesSearch && (
                <Button variant="ghost" onClick={() => setSalesSearch("")} className="px-2">
                  Clear
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {searchedSales.length} of {filteredSales.length} sales
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Original Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchedSales.map((sale) => {
                  const originalTotal = sale.price * sale.quantity
                  const discount = originalTotal - sale.total
                  const discountRate = (discount / originalTotal) * 100

                  return (
                    <TableRow key={sale.id}>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>{sale.product.name}</TableCell>
                      <TableCell className="text-right">{sale.quantity}</TableCell>
                      <TableCell className="text-right">KSH {sale.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">KSH {sale.total.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            discount > 0
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }
                        >
                          {discount > 0
                            ? `${discountRate.toFixed(1)}% (KSH ${discount.toLocaleString()})`
                            : "No discount"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock In Details</CardTitle>
          <CardDescription>Breakdown of stock movements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search stock movements by product, date, or type..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="max-w-sm"
              />
              {stockSearch && (
                <Button variant="ghost" onClick={() => setStockSearch("")} className="px-2">
                  Clear
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {searchedStockMovements.length} of {filteredStockMovements.length} movements
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchedStockMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                    <TableCell>{movement.product.name}</TableCell>
                    <TableCell className="text-right">{movement.quantity}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          movement.type === "IN"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }
                      >
                        {movement.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

