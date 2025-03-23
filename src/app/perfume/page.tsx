/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, MoreHorizontal, Plus, Trash2, Droplets, TrendingUp, DollarSign, ShoppingBag } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

// Types
interface Perfume {
  id: number
  name: string
  category: string
  brand: string
  price: number
  stock: number
  supplier: string
  status: string
  stockMl: number
  lastUpdated: string
}

interface PerfumeSale {
  id: number
  date: Date
  perfumeId: number
  perfume: {
    name: string
  }
  quantityMl: number
  bottleSize: "3ml" | "6ml"
  totalPrice: number
}

const perfumeSchema = z.object({
  name: z.string().min(2, {
    message: "Perfume name must be at least 2 characters.",
  }),
  stockMl: z.number().min(1, {
    message: "Stock must be at least 1ml.",
  }),
  retailPrice6ml: z.number().min(1, {
    message: "Price must be at least $1.",
  }),
})

const saleSchema = z.object({
  perfumeId: z.number(),
  bottleSize: z.enum(["3ml", "6ml"]),
  quantity: z.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  date: z.date(),
})

export default function PerfumePage() {
  const { toast } = useToast()
  const [perfumes, setPerfumes] = useState<Perfume[]>([])
  const [sales, setSales] = useState<PerfumeSale[]>([])
  const [isAddPerfumeDialogOpen, setIsAddPerfumeDialogOpen] = useState(false)
  const [isAddSaleDialogOpen, setIsAddSaleDialogOpen] = useState(false)
  const [isEditPerfumeDialogOpen, setIsEditPerfumeDialogOpen] = useState(false)
  const [isDeletePerfumeDialogOpen, setIsDeletePerfumeDialogOpen] = useState(false)
  const [currentPerfume, setCurrentPerfume] = useState<Perfume | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch perfumes and sales data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch perfumes
        const perfumesResponse = await fetch("/api/perfumes")
        if (!perfumesResponse.ok) throw new Error("Failed to fetch perfumes")
        const perfumesData = await perfumesResponse.json()
        setPerfumes(perfumesData)

        // Fetch sales
        const salesResponse = await fetch("/api/perfume_sales")
        if (!salesResponse.ok) throw new Error("Failed to fetch sales")
        const salesData = await salesResponse.json()

        // Convert date strings to Date objects
        const formattedSales = salesData.map((sale: any) => ({
          ...sale,
          date: new Date(sale.date),
        }))

        setSales(formattedSales)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const perfumeSchema = z.object({
    name: z.string().min(2, { message: "Perfume name must be at least 2 characters." }),
    category: z.string().min(2, { message: "Category is required." }),
    brand: z.string().min(2, { message: "Brand is required." }),
    supplier: z.string().min(2, { message: "Supplier is required." }),
    stockMl: z.number().min(1, { message: "Stock must be at least 1ml." }),
    retailPrice6ml: z.number().min(1, { message: "Price must be at least $1." }),
    status: z.enum(["In Stock", "Low Stock", "Out of Stock"]).default("In Stock"),
  });
  
  const perfumeForm = useForm<z.infer<typeof perfumeSchema>>({ // ✅ Now it's defined before use
    resolver: zodResolver(perfumeSchema),
    defaultValues: {
      name: "",
      stockMl: 0,
      retailPrice6ml: 0,
      category: "", // ✅ Ensure default values match the schema
      brand: "",
      supplier: "",
      status: "In Stock",
    },
  });
  
  

  const saleForm = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      perfumeId: 0,
      bottleSize: "3ml",
      quantity: 1,
      date: new Date(),
    },
  })

  // Add new perfume
  const handleAddPerfume = async (data: z.infer<typeof perfumeSchema>) => {
    try {
      const response = await fetch("/api/perfumes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          brand: data.brand,
          price: data.retailPrice6ml,
          stockMl: data.stockMl,
          supplier: data.supplier,
          status: data.status as "In Stock" | "Low Stock" | "Out of Stock", // ✅ Fixed
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add perfume");
      }
  
      // ✅ Refresh perfume list after adding
      const perfumesResponse = await fetch("/api/perfumes");
      if (!perfumesResponse.ok) throw new Error("Failed to fetch updated perfumes");
      const perfumesData = await perfumesResponse.json();
      setPerfumes(perfumesData);
  
      setIsAddPerfumeDialogOpen(false);
      toast({ title: "Success", description: "Perfume added successfully" });
    } catch (error) {
      console.error("Error adding perfume:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add perfume. Please try again.",
        variant: "destructive",
      });
    }
  };
  

  // Add new sale
  const handleAddSale = async (data: z.infer<typeof saleSchema>) => {
    const perfume = perfumes.find((p) => p.id === data.perfumeId);
    if (!perfume) {
      toast({ title: "Error", description: "Selected perfume not found", variant: "destructive" });
      return;
    }
  
    const quantityMl = data.bottleSize === "3ml" ? 3 * data.quantity : 6 * data.quantity;
  
    if (perfume.stockMl < quantityMl) {
      toast({ title: "Error", description: `Not enough stock. Available: ${perfume.stockMl}ml`, variant: "destructive" });
      return;
    }
  
    try {
      const response = await fetch("/api/perfumes/add-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perfumeId: data.perfumeId,
          bottleSize: data.bottleSize,
          quantity: data.quantity,
          date: data.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record sale");
      }
  
      setIsAddSaleDialogOpen(false);
      saleForm.reset({ perfumeId: 0, bottleSize: "3ml", quantity: 1, date: new Date() });
  
      toast({ title: "Success", description: "Sale recorded successfully" });
    } catch (error) {
      console.error("Error recording sale:", error);
      toast({ title: "Error",  variant: "destructive" });
    }
  };
  
  

  // Add stock to perfume
  const handleAddStock = async (perfumeId: number, stockMl: number) => {
    try {
      const response = await fetch("/api/perfumes/add-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          perfumeId,
          stockMl,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add stock");
      }
  
      // ✅ Refresh perfumes list
      const perfumesResponse = await fetch("/api/perfumes");
      if (!perfumesResponse.ok) throw new Error("Failed to fetch updated perfumes");
      const perfumesData = await perfumesResponse.json();
      setPerfumes(perfumesData);
  
      toast({
        title: "Success",
        description: "Stock added successfully",
      });
  
      setIsAddPerfumeDialogOpen(false); // Close dialog after success
    } catch (error) {
      console.error("Error adding stock:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add stock. Please try again.",
        variant: "destructive",
      });
    }
  };
  

  const filteredPerfumes = perfumes.filter((perfume) => {
    const searchRegex = new RegExp(searchQuery, "i")
    const categoryMatch = selectedCategory === "all" || perfume.category === selectedCategory
    const searchMatch = searchRegex.test(perfume.name) || searchRegex.test(perfume.brand)

    return categoryMatch && searchMatch
  })

  const handleEditPerfume = async (updatedFields: Partial<Perfume>) => {
    if (!currentPerfume) return;
  
    try {
      const updatedPerfume: Perfume = {
        ...currentPerfume, // Keep existing values
        ...updatedFields, // Apply updated values
        supplier: updatedFields.supplier || currentPerfume.supplier || "Unknown Supplier",
        status: updatedFields.status || currentPerfume.status || "In Stock",
      };
  
      const response = await fetch("/api/perfumes/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPerfume),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update perfume");
      }
  
      // ✅ Refresh perfumes list after edit
      const perfumesResponse = await fetch("/api/perfumes");
      if (!perfumesResponse.ok) throw new Error("Failed to fetch updated perfumes");
      const perfumesData = await perfumesResponse.json();
      setPerfumes(perfumesData);
  
      toast({
        title: "Success",
        description: "Perfume updated successfully",
      });
  
      setIsEditPerfumeDialogOpen(false);
    } catch (error) {
      console.error("Error updating perfume:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update perfume. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  
  
  const handleDeletePerfume = async (perfumeId: number) => {
  try {
    const response = await fetch("/api/perfumes/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: perfumeId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete perfume");
    }

    // ✅ Refresh perfumes list after deletion
    const perfumesResponse = await fetch("/api/perfumes");
    if (!perfumesResponse.ok) throw new Error("Failed to fetch updated perfumes");
    const perfumesData = await perfumesResponse.json();
    setPerfumes(perfumesData);

    toast({
      title: "Success",
      description: "Perfume deleted successfully",
    });

    setIsDeletePerfumeDialogOpen(false); // Close the delete dialog
  } catch (error) {
    console.error("Error deleting perfume:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to delete perfume. Please try again.",
      variant: "destructive",
    });
  }
};




  return (
    <div className="container py-10">
      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Perfume Inventory</CardTitle>
              <CardDescription>Manage your perfume stock and sales.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="inventory" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="inventory" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="search"
                        placeholder="Search perfume..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="floral">Floral</SelectItem>
                          <SelectItem value="woody">Woody</SelectItem>
                          <SelectItem value="oriental">Oriental</SelectItem>
                          <SelectItem value="fresh">Fresh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                   
                    
                      <Dialog open={isAddPerfumeDialogOpen} onOpenChange={setIsAddPerfumeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Perfume
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Perfume</DialogTitle>
                          <DialogDescription>Enter details to add a new perfume to the inventory.</DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddPerfume({
                              name: formData.get("name") as string,
                              category: formData.get("category") as string,
                              brand: formData.get("brand") as string,
                              retailPrice6ml: Number(formData.get("price")),
                              stockMl: Number(formData.get("stockMl")),
                              supplier: formData.get("supplier") as string,
                              status: (formData.get("status") as string) as "In Stock" | "Low Stock" | "Out of Stock", // ✅ Fixed
                            });
                          }}
                          className="grid gap-4 py-4"
                        >
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" required className="col-span-3" />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Input id="category" name="category" required className="col-span-3" />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="brand" className="text-right">Brand</Label>
                            <Input id="brand" name="brand" required className="col-span-3" />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" name="price" type="number" required className="col-span-3" />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stockMl" className="text-right">Stock (ml)</Label>
                            <Input id="stockMl" name="stockMl" type="number" required className="col-span-3" />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="supplier" className="text-right">Supplier</Label>
                            <Input id="supplier" name="supplier" required className="col-span-3" />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select name="status" defaultValue="In Stock">
                              <SelectTrigger className="w-[180px] col-span-3">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="In Stock">In Stock</SelectItem>
                                <SelectItem value="Low Stock">Low Stock</SelectItem>
                                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <DialogFooter>
                            <Button type="submit">Add Perfume</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Stock (ml)</TableHead>
                        <TableHead>Price (6ml)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPerfumes.map((perfume) => (
                        <TableRow key={perfume.id}>
                          <TableCell>{perfume.name}</TableCell>
                          <TableCell>{perfume.category}</TableCell>
                          <TableCell>{perfume.brand}</TableCell>
                          <TableCell>{perfume.stockMl}</TableCell>
                          <TableCell>${perfume.price}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onSelect={() => {
                                      setCurrentPerfume(perfume);
                                      setIsEditPerfumeDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>

                                <DropdownMenuItem
                                  onSelect={() => {
                                    setCurrentPerfume(perfume)
                                    // Open the Add Stock dialog
                                    const addStockButton = document.querySelector("button.hidden") as HTMLButtonElement
                                    if (addStockButton) addStockButton.click()
                                  }}
                                >
                                  <Droplets className="w-4 h-4 mr-2" />
                                  Add Stock
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onSelect={() => {
                                    setCurrentPerfume(perfume);
                                    setIsDeletePerfumeDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="sales" className="space-y-4">
                  <div className="flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Sale
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record New Sale</DialogTitle>
                          <DialogDescription>Record a new perfume sale.</DialogDescription>
                        </DialogHeader>
                    <form onSubmit={saleForm.handleSubmit(handleAddSale)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="perfumeId" className="text-right">Perfume</Label>
                      <Select onValueChange={(value) => saleForm.setValue("perfumeId", Number.parseInt(value))}>
                        <SelectTrigger className="w-[180px] col-span-3">
                          <SelectValue placeholder="Select a perfume" />
                        </SelectTrigger>
                        <SelectContent>
                          {perfumes.map((perfume) => (
                            <SelectItem key={perfume.id} value={perfume.id.toString()}>{perfume.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bottleSize" className="text-right">Bottle Size</Label>
                      <Select onValueChange={(value) => saleForm.setValue("bottleSize", value as "3ml" | "6ml")}>
                        <SelectTrigger className="w-[180px] col-span-3">
                          <SelectValue placeholder="Select bottle size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3ml">3ml</SelectItem>
                          <SelectItem value="6ml">6ml</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">Quantity</Label>
                      <Input id="quantity" type="number" {...saleForm.register("quantity", { valueAsNumber: true })} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">Sale Date</Label>
                      <Input
                        id="date"
                        type="date"
                        {...saleForm.register("date", { valueAsDate: true })}
                        className="col-span-3"
                      />
                    </div>

                    <DialogFooter>
                      <Button type="submit">Record Sale</Button>
                    </DialogFooter>
                  </form>


                      </DialogContent>
                    </Dialog>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Perfume</TableHead>
                        <TableHead>Bottle Size</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{format(sale.date, "PPP")}</TableCell>
                          <TableCell>{sale.perfume.name}</TableCell>
                          <TableCell>{sale.bottleSize}</TableCell>
                          <TableCell>{sale.quantityMl / (sale.bottleSize === "3ml" ? 3 : 6)}</TableCell>
                          <TableCell>${sale.totalPrice}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales Overview</CardTitle>
                      <CardDescription>A summary of your sales data.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Total Sales</CardTitle>
                            <CardDescription>Total revenue from sales</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">$12,500</div>
                            <div className="text-sm text-muted-foreground">
                              <TrendingUp className="h-4 w-4 mr-2 inline-block" />
                              12% increase from last month
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Most Popular Perfume</CardTitle>
                            <CardDescription>The perfume with the most sales</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">Chanel No. 5</div>
                            <div className="text-sm text-muted-foreground">
                              <ShoppingBag className="h-4 w-4 mr-2 inline-block" />
                              Sold 250 bottles
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Average Order Value</CardTitle>
                            <CardDescription>The average amount spent per order</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">$50</div>
                            <div className="text-sm text-muted-foreground">
                              <DollarSign className="h-4 w-4 mr-2 inline-block" />
                              5% increase from last month
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Stock Alerts</CardTitle>
                            <CardDescription>Perfumes with low stock levels</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <div className="text-sm text-muted-foreground">
                              <Badge variant="destructive">Low Stock</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Edit Perfume Dialog */}
          <Dialog open={isEditPerfumeDialogOpen} onOpenChange={setIsEditPerfumeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Perfume</DialogTitle>
                <DialogDescription>Modify the perfume details.</DialogDescription>
              </DialogHeader>
              <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!currentPerfume) return;

                const formData = new FormData(e.currentTarget);
                handleEditPerfume({
                  id: currentPerfume.id,
                  name: formData.get("name") as string,
                  category: formData.get("category") as string,
                  brand: formData.get("brand") as string,
                  price: Number(formData.get("price")),
                  stockMl: Number(formData.get("stockMl")),
                  supplier: (formData.get("supplier") as string) || currentPerfume.supplier || "Unknown Supplier", // ✅ Prevents null
                  status: (formData.get("status") as string) || currentPerfume.status || "In Stock", // ✅ Prevents null
                });
              }}
               className="grid gap-4 py-4"
              >
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" defaultValue={currentPerfume?.name} className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Input id="category" name="category" defaultValue={currentPerfume?.category} className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand" className="text-right">Brand</Label>
                  <Input id="brand" name="brand" defaultValue={currentPerfume?.brand} className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price</Label>
                  <Input id="price" name="price" type="number" defaultValue={currentPerfume?.price} className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stockMl" className="text-right">Stock (ml)</Label>
                  <Input id="stockMl" name="stockMl" type="number" defaultValue={currentPerfume?.stockMl} className="col-span-3" />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">Supplier</Label>
                  <Input id="supplier" name="supplier" defaultValue={currentPerfume?.supplier ?? ""} className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select name="status" defaultValue={currentPerfume?.status ?? "In Stock"}>
                    <SelectTrigger className="w-[180px] col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>


          {/* Delete Perfume Dialog */}
          <Dialog open={isDeletePerfumeDialogOpen} onOpenChange={setIsDeletePerfumeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Perfume</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <b>{currentPerfume?.name}</b>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDeletePerfumeDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => currentPerfume && handleDeletePerfume(currentPerfume.id)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



          {/* Add Stock Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="hidden">
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock</DialogTitle>
                <DialogDescription>Add stock to {currentPerfume?.name}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="add-stock">Stock to Add (ml)</Label>
                  <Input id="add-stock" type="number" min="1" placeholder="Enter amount in ml" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    const stockInput = document.getElementById("add-stock") as HTMLInputElement
                    const stockToAdd = Number.parseInt(stockInput.value)
                    if (currentPerfume && !isNaN(stockToAdd) && stockToAdd > 0) {
                      handleAddStock(currentPerfume.id, stockToAdd)
                    }
                  }}
                >
                  Add Stock
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

