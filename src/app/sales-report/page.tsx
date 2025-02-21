"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/components/ui/use-toast";

export default function SalesReportPage() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("2025");
  const [salesData, setSalesData] = useState<{ month: string; total_sales: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalesData(selectedYear);
  }, [selectedYear]);

  /**
   * 🔹 Fetch Sales Report Data from API
   */
  const fetchSalesData = async (year: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sales-report?year=${year}`);
      if (!response.ok) throw new Error("Failed to fetch sales data");

      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error("Error fetching sales report:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sales data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Year Selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Report</h1>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Monthly Sales Overview (Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Overview</CardTitle>
          <CardDescription>Sales performance for each month in {selectedYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_sales" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Sales Breakdown (Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Breakdown</CardTitle>
          <CardDescription>Detailed view of sales for each month</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.length > 0 ? (
                  salesData.map((item) => (
                    <TableRow key={item.month}>
                      <TableCell>{item.month}</TableCell>
                      <TableCell className="text-right">KSH {item.total_sales.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No sales data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
