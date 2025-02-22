import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, ChevronDown, Clock, FileText, Mail, MessageSquare, Search, Users } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-8">
            <Link href="#" className="text-primary border-b-2 border-primary px-1">
              Dashboard
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              Planner
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              Messages
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              Settings
            </Link>
            <div className="relative">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                Help Center <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </div>
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
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <Avatar key={i} className="border-2 border-background">
                  <AvatarImage src={`/placeholder.svg`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>
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
        <div className="grid gap-6">
          {/* Statistics Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
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
                [Line Chart Visualization]
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Trends Calculation</h3>
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
                [Pie Chart Visualization]
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Happy Customer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">600</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">274</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">177</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">130</div>
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
                    <TableHead>Lead Name</TableHead>
                    <TableHead>Email address</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      name: "BIG PLUG 25FLOW",
                      email: "esther@gmail.com",
                      phone: "(684) 555-0102",
                      company: "MasterCard",
                      status: "New Lead",
                    },
                    {
                      name: "Kathryn Murphy",
                      email: "kathryn@gmail.com",
                      phone: "(316) 555-0116",
                      company: "eBay",
                      status: "Lost Client",
                    },
                    {
                      name: "Courtney Henry",
                      email: "courtney@gmail.com",
                      phone: "(629) 555-0129",
                      company: "Gillette",
                      status: "Converted",
                    },
                  ].map((lead) => (
                    <TableRow key={lead.email}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>{lead.name[0]}</AvatarFallback>
                          </Avatar>
                          {lead.name}
                        </div>
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            lead.status === "New Lead"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : lead.status === "Lost Client"
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-green-50 text-green-600 border-green-200"
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

