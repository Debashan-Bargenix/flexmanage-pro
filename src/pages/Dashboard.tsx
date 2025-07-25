import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Plus,
  Bell,
  DollarSign
} from "lucide-react";

// Mock data - in real app this would come from your database
const mockStats = {
  totalMembers: 847,
  activeMembers: 732,
  monthlyRevenue: 28450,
  expiringMemberships: 23,
  newMembersThisMonth: 45,
  pendingPayments: 8
};

const mockRecentMembers = [
  { id: 1, name: "John Smith", plan: "Premium", status: "Active", joinDate: "2024-01-15" },
  { id: 2, name: "Sarah Johnson", plan: "Basic", status: "Active", joinDate: "2024-01-14" },
  { id: 3, name: "Mike Wilson", plan: "Premium", status: "Expiring", joinDate: "2023-12-15" },
  { id: 4, name: "Emily Davis", plan: "Basic", status: "Active", joinDate: "2024-01-13" },
];

const mockUpcomingPayments = [
  { id: 1, member: "Alex Thompson", amount: 79, dueDate: "2024-01-20" },
  { id: 2, member: "Lisa Brown", amount: 49, dueDate: "2024-01-22" },
  { id: 3, member: "David Miller", amount: 79, dueDate: "2024-01-25" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your gym overview.</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Quick Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.activeMembers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-success">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.newMembersThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.expiringMemberships}</div>
            <p className="text-xs text-warning">
              Memberships expiring soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.plan} Plan</p>
                  </div>
                  <Badge 
                    variant={member.status === "Active" ? "default" : "destructive"}
                  >
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUpcomingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payment.member}</p>
                    <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                  </div>
                  <Badge variant="outline">
                    ${payment.amount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Add Member</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Create Plan</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">Record Payment</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Schedule</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}