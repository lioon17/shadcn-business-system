export interface Inventory {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  supplier: string;
  status: "In Stock" | "Out of Stock";
  lastUpdated: string;
}
