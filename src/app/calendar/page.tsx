/* eslint-disable */
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight, CreditCard, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Product {
  id: number
  name: string
  price: number
}

interface Sale {
  id: number
  date: Date
  product: Product
  quantity: number
  price: number
  total: number
}

interface DailySales {
  total: number
  transactions: number
  sales: Sale[]
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSales = useCallback(async () => {
    try {
      const response = await fetch("/api/sales");
      if (!response.ok) throw new Error("Failed to fetch sales");
  
      const data = await response.json();
  
      setSales(
        data.map((sale: any) => ({
          ...sale,
          date: new Date(sale.date), // ✅ Ensure it remains a Date object
          total: Number(sale.total),
          price: Number(sale.price),
        }))
      );
    } catch (error) {
      console.error("❌ Error fetching sales:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const getDailySales = (date: Date): DailySales => {
    const dailySales = sales.filter((sale) => isSameDay(new Date(sale.date), date))
    return {
      total: dailySales.reduce((sum, sale) => sum + sale.total, 0),
      transactions: dailySales.length,
      sales: dailySales,
    }
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const today = new Date()

  const DayCard = ({ date, dailySales }: { date: Date; dailySales: DailySales }) => {
    const isToday = isSameDay(date, today)
    const isCurrentMonth = isSameMonth(date, currentDate)

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Card
            className={`min-h-[120px] cursor-pointer transition-all hover:shadow-md ${
              !isCurrentMonth
                ? "opacity-50"
                : isToday
                  ? "border-primary"
                  : dailySales.transactions > 0
                    ? "border-green-500"
                    : "border-red-200 bg-red-50/50"
            }`}
          >
            <CardContent className="p-2">
              <div className="text-right">
                <span
                  className={`inline-block rounded-full w-7 h-7 text-center leading-7 ${
                    isToday ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {format(date, "d")}
                </span>
              </div>
              {loading ? (
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                dailySales.transactions > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                      <CreditCard className="h-4 w-4" />
                      <span>{dailySales.transactions} sales</span>
                    </div>
                    <div className="flex items-center text-sm font-medium gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>KSH {dailySales.total.toLocaleString()}</span>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </PopoverTrigger>
        {dailySales.transactions > 0 && (
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Sales for {format(date, "MMMM d, yyyy")}</h3>
              <p className="text-sm text-muted-foreground">Total: KSH {dailySales.total.toLocaleString()}</p>
            </div>
            <div className="max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySales.sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.product.name}</TableCell>
                      <TableCell className="text-right">{sale.quantity}</TableCell>
                      <TableCell className="text-right">KSH {sale.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">KSH {sale.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PopoverContent>
        )}
      </Popover>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Sales Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="outline" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {/* Week day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-muted-foreground p-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the start of the month */}
        {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} />
        ))}

        {/* Calendar days */}
        {daysInMonth.map((date) => {
          const dailySales = getDailySales(date)
          return <DayCard key={date.toISOString()} date={date} dailySales={dailySales} />
        })}

        {/* Empty cells for days after the end of the month */}
        {Array.from({
          length: 6 - endOfMonth(currentDate).getDay(),
        }).map((_, index) => (
          <div key={`empty-end-${index}`} />
        ))}
      </div>

      {/* Monthly Summary */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Monthly Total</h3>
              <p className="text-2xl font-bold">
                KSH{" "}
                {sales
                  .filter((sale) => isSameMonth(new Date(sale.date), currentDate))
                  .reduce((sum, sale) => sum + sale.total, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Total Transactions</h3>
              <p className="text-2xl font-bold">
                {sales.filter((sale) => isSameMonth(new Date(sale.date), currentDate)).length}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Daily Average</h3>
              <p className="text-2xl font-bold">
                KSH{" "}
                {(
                  sales
                    .filter((sale) => isSameMonth(new Date(sale.date), currentDate))
                    .reduce((sum, sale) => sum + sale.total, 0) / daysInMonth.length
                ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

