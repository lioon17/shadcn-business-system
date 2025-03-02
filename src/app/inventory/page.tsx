"use client"

import { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Download, Edit, MoreHorizontal, Plus, Search, Trash2, Upload } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  supplier: string
  status: string
}

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  supplier: z.string().optional(),
})

export default function InventoryPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [filterStock, setFilterStock] = useState("all"); // 🔹 New stock filter state
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 New search state

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      price: 0,
      stock: 0,
      supplier: "",
    },
  })

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/inventory");
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // 🔹 Apply category filter
      let filteredData = selectedCategory === "all"
        ? data
        : data.filter((product: Product) => product.category === selectedCategory);

      // 🔹 Apply stock filter
      if (filterStock === "low") {
        filteredData = filteredData.filter((product: Product) => product.stock > 0 && product.stock <= 5);
      } else if (filterStock === "out") {
        filteredData = filteredData.filter((product: Product) => product.stock === 0);
      }

      // 🔹 Apply search filter
      if (searchQuery.trim() !== "") {
        filteredData = filteredData.filter((product: Product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.supplier.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setProducts(filteredData);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, selectedCategory, filterStock, searchQuery]); // ✅ Re-fetch when filters change


  /**
   * 🔹 Sync Form with Selected Product
   */
  useEffect(() => {
    if (currentProduct) {
      form.reset({
        name: currentProduct.name,
        category: currentProduct.category,
        price: currentProduct.price,
        stock: currentProduct.stock,
        supplier: currentProduct.supplier,
      });
    }
  }, [currentProduct, form]); // ✅ Ensures form updates when currentProduct changes

  /**
   * 🔹 Fetch Data on Component Mount
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // ✅ Correctly references fetchProducts

  

    /**
   * 🔹 Export to CSV
   */
    const handleExport = () => {
      const csvContent = [
        ["Product ID", "Name", "Category", "Price", "Stock", "Supplier", "Status"],
        ...products.map((product) => [
          product.id,
          product.name,
          product.category,
          product.price,
          product.stock,
          product.supplier,
          product.status,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");
  
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "inventory.csv";
      a.click();
      URL.revokeObjectURL(url);
    };
  

  const handleAddProduct = async (data: z.infer<typeof productSchema>) => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to add product")
      await fetchProducts()
      setIsAddDialogOpen(false)
      form.reset()
      toast({
        title: "Success",
        description: "Product added successfully",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async (data: z.infer<typeof productSchema>) => {
    if (!currentProduct) return;
  
    try {
      console.log("Sending update request for:", currentProduct.id, data); // ✅ Debugging
  
      const response = await fetch(`/api/inventory/${currentProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to update product");
      }
  
      const updatedProduct = await response.json();
      console.log("Product updated successfully:", updatedProduct); // ✅ Debugging
  
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };
  

  const handleDeleteProduct = async () => {
    if (!currentProduct) return
    try {
      const response = await fetch(`/api/inventory/${currentProduct.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete product")
      await fetchProducts()
      setIsDeleteDialogOpen(false)
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Add a new product to your inventory.</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleAddProduct)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" {...form.register("name")} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select onValueChange={(value) => form.setValue("category", value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      {...form.register("price", { valueAsNumber: true })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">
                      Stock
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      {...form.register("stock", { valueAsNumber: true })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplier" className="text-right">
                      Supplier
                    </Label>
                    <Input id="supplier" {...form.register("supplier")} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full sm:w-[300px]"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All Categories</SelectItem> {/* ✅ Keep option for all categories */}
    <SelectItem value="watch section">Watch Section</SelectItem> {/* ✅ Updated category names */}
    <SelectItem value="necklaces section">Necklaces Section</SelectItem>
    <SelectItem value="ponds section">Ponds Section</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {/* 🔹 Stock Filter */}
          <Select value={filterStock} onValueChange={setFilterStock}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock (≤5)</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>KSH {product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.supplier}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        product.status === "In Stock"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-red-50 text-red-600 border-red-200"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => {
                            setCurrentProduct(product)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setCurrentProduct(product)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Make changes to your product here.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleEditProduct)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input id="edit-name" {...form.register("name")} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select onValueChange={(value) => form.setValue("category", value)} value={form.watch("category")}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  {...form.register("price", { valueAsNumber: true })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  {...form.register("stock", { valueAsNumber: true })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-supplier" className="text-right">
                  Supplier
                </Label>
                <Input id="edit-supplier" {...form.register("supplier")} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

