/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download, LineChart, TrendingUp, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: number // Changed from string to number
  name: string
  price: number
  stock: number
}

interface Sale {
  id: number // Changed from string to number
  date: Date
  productId: number // Changed from string to number
  product: {
    name: string
  }
  quantity: number
  price: number
  total: number
}

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date.",
  }),
  productId: z.number({
    // Changed from string to number
    required_error: "Please select a product.",
  }),
  quantity: z
    .number({
      required_error: "Please enter a quantity.",
      invalid_type_error: "Quantity must be a number.",
    })
    .min(1, "Quantity must be at least 1."),
  price: z
    .number({
      required_error: "Please enter a price.",
      invalid_type_error: "Price must be a number.",
    })
    .min(0, "Price must be greater than or equal to 0."),
    total: z
    .number({
      required_error: "Please enter a total sale price.",
      invalid_type_error: "Total must be a number.",
    })
    .min(0, "Total price must be greater than or equal to 0."), // ✅ Added total column
})

export default function SalesPage() {
  const { toast } = useToast()
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      productId: 0,
      quantity: 1,
      price: 0,
      total: 0, 
    },
  })

  const fetchSales = useCallback(async () => {
    try {
      const response = await fetch("/api/sales");
      if (!response.ok) throw new Error("Failed to fetch sales");
  
      const data = await response.json();
  
      setSales(
        data.map((sale: any) => ({
          ...sale,
          date: new Date(new Date(sale.date).toLocaleString("en-US", { timeZone: "Africa/Nairobi" })), // ✅ Converts to local time
          total: Number(sale.total),
          price: Number(sale.price),
        }))
      );
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()

      console.log("📌 Fetched Products Data:", data)

      setProducts(data.map((product: Product) => ({ ...product, price: Number(product.price) })))
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      toast({ title: "Error", description: "Failed to fetch products.", variant: "destructive" })
    }
  }, [toast])

  useEffect(() => {
    fetchSales()
    fetchProducts()
  }, [fetchSales, fetchProducts])

  const handleProductChange = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    setSelectedProduct(product || null)
    if (product) {
      form.setValue("price", product.price)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a valid product.",
        variant: "destructive",
      })
      return
    }

    if (selectedProduct.stock < values.quantity) {
      toast({
        title: "Error",
        description: `Insufficient stock. Available: ${selectedProduct.stock}`,
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          productId: Number(values.productId), // Ensure productId is sent as a number
        }),
      })

      if (!response.ok) {
        const errorResponse = await response.json()
        throw new Error(errorResponse.error || "Failed to add sale")
      }

      const newSale = await response.json()
      setSales((prev) => [newSale, ...prev])
      form.reset()
      toast({ title: "Success", description: "Sale added successfully" })
      fetchProducts() // Refresh products to update stock
      fetchSales() // Refresh sales list
    } catch (error) {
      console.error("Error adding sale:", error)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const deleteSale = async (saleId: number) => {
    try {
      const response = await fetch(`/api/sales?id=${saleId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete sale")

      setSales((prev) => prev.filter((sale) => sale.id !== saleId))
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      })
      fetchProducts() // Refresh products to update stock
      fetchSales() // Refresh sales list
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast({
        title: "Error",
        description: "Failed to delete sale. Please try again.",
        variant: "destructive",
      })
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const todaySales = sales
    .filter((sale) => format(sale.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))
    .reduce((sum, sale) => sum + sale.total, 0)
  const averageOrderValue = totalSales / (sales.length || 1)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Management</h1>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Sales Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSH {totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSH {todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {sales.filter((sale) => format(sale.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length}{" "}
              transactions today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSH {averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+4.75% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Sale</CardTitle>
            <CardDescription>Add a new sales record to the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(Number(value)) // Convert to number
                          handleProductChange(Number(value)) // Convert to number
                        }}
                        value={field.value?.toString()} // Convert to string for Select component
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - KSH {product.price.toFixed(2)} (Stock: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {selectedProduct && (
                        <p className="text-sm text-muted-foreground mt-1">Available stock: {selectedProduct.stock}</p>
                      )}
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             <FormField
                    control={form.control}
                    name="total"  // ✅ New Input for Final Sale Amount
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Sale Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}  // ✅ Ensures proper number conversion
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
                <Button type="submit" className="w-full">
                  Add Sale
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest transactions in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchSales} className="mb-4">
              Refresh
            </Button>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No sales found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{format(sale.date, "PP")}</TableCell>
                      <TableCell>{sale.product?.name || "Unknown Product"}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell className="text-right">KSH {sale.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => deleteSale(sale.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

