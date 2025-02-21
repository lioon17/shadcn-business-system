"use client"

import { useState, useEffect } from "react"
import {
  Layout,
  LineChart,
  FileText,
  Calendar,
  Package,
  DollarSign,
  Plus,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsOpen(window.innerWidth >= 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 w-64 bg-[#0a1e46] text-white p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "shadow-lg" : ""}`}
      >
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="icon" className="text-white">
            <Plus className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">MagerCRM</span>
        </div>

        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" asChild>
            <Link href="/">
              <Layout className="mr-2 h-4 w-4" />
              General Menu
            </Link>
          </Button>
       
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" asChild>
          <Link href="/inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventory
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" asChild>
          <Link href="/sales">
            <DollarSign className="mr-2 h-4 w-4" />
            Sales Management
          </Link>
        </Button>
       
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" asChild>
          <Link href="/sales-report">
            <LineChart className="mr-2 h-4 w-4" />
            Sales Report
          </Link>
        </Button>
       
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" asChild>
          <Link href="/accounting">
            <FileText className="mr-2 h-4 w-4" />
            Accounting
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" asChild>
          <Link href="/calendar">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </Link>
        </Button>
      
       
       
      </div>
      <div className="mt-8">
          <div className="text-sm text-gray-400 mb-4">Active Members</div>
          <div className="space-y-4">
            {["Katchryn", "Courtney", "Marvin"].map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/placeholder.svg`} />
                  <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
                <span>{name}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 mt-4">
            <ChevronDown className="mr-2 h-4 w-4" />
            976+ More Members
          </Button>
        </div>
      </div>
    </>
  )
}

