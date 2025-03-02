"use client"; // ✅ Add this at the top

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell,Mail,Search} from "lucide-react";
import Link from "next/link";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  category: string;
  supplier: string;
  status: string;
}

// ✅ Register Chart.js Components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Page() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([]);
  const [totalStockWorth, setTotalStockWorth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("/api/inventory");
        if (!response.ok) throw new Error("Failed to fetch inventory");

        const data: InventoryItem[] = await response.json();

        // 🔹 Filter inventory by stock level
        setLowStockItems(data.filter((item) => item.stock > 0 && item.stock <= 5));
        setOutOfStockItems(data.filter((item) => item.stock === 0));
      } catch (error) {
        console.error("❌ Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTotalStockWorth = async () => {
      try {
        const response = await fetch("/api/total-stock-worth");
        if (!response.ok) throw new Error("Failed to fetch total stock worth");

        const data = await response.json();
        setTotalStockWorth(data.total_stock_worth);
      } catch (error) {
        console.error("❌ Error fetching total stock worth:", error);
      }
    };

    fetchInventory();
    fetchTotalStockWorth();
  }, []);

  // ✅ Chart Data Configuration (Dark Blue Theme)
  const chartData = {
    labels: ["Stock Worth"],
    datasets: [
      {
        data: [totalStockWorth],
        backgroundColor: ["#1E3A8A"], // Dark Blue
        borderColor: ["#1E40AF"], // Slightly Lighter Blue Border
        borderWidth: 1,
      },
    ],
  };



  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-8">
            <Link href="#" className="text-primary border-b-2 border-primary px-1">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search here"
                className="pl-8 h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
              Online
            </Badge>
            <Button variant="ghost" size="icon">
              <Mail className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        <div className="grid gap-6 ">
          {/* Statistics Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 ">
              <div className="rounded-lg border bg-card p-6 " >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Statistic</h3>
                  <Select defaultValue="this-month">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <CardContent className="h-[300px] flex items-center justify-center">
                    {totalStockWorth > 0 ? (
                      
                      <Pie data={chartData} />
                    ) : (
                      <p className="text-gray-500">Loading...</p>
                    )}
                  </CardContent>
                </div>
              </div>
        {/* Statistics Section */}
        <Card>
          <CardHeader className="flex items-center justify-between ">
            <CardTitle className="text-lg font-semibold">Money Machine</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {/* 🔹 Lottie Animation */}
            <DotLottieReact
              src="https://lottie.host/c677b08d-814e-4e80-b532-957c1c7e5d9b/cRx2qoSIMB.lottie"
              loop
              autoplay
              style={{ width: "450px", height: "450px" }} // ✅ Adjust size
            />
          </CardContent>
        </Card>
      </div>

          {/* Lead Monthly Progress */}
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between p-6">
              <h3 className="text-lg font-semibold">Lead Monthly Progress</h3>
              <Select defaultValue="this-month">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Stock Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    [...outOfStockItems, ...lowStockItems].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>{item.name[0]}</AvatarFallback>
                            </Avatar>
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.stock === 0
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-yellow-50 text-yellow-600 border-yellow-200"
                            }
                          >
                            {item.stock === 0 ? "Out of Stock" : "Low Stock"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
