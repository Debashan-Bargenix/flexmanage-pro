import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Edit,
  Trash2,
  Eye,
  Filter
} from "lucide-react";

export default function Members() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch members with their memberships
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          member_memberships(
            id, status, end_date,
            membership_plans(name, price)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(member => {
        const activeMembership = member.member_memberships?.find(m => m.status === 'active');
        const endDate = activeMembership?.end_date;
        const plan = activeMembership?.membership_plans?.name || 'No Plan';
        
        // Determine status based on membership end date
        let memberStatus = member.status;
        if (endDate) {
          const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry <= 0) {
            memberStatus = 'Expired';
          } else if (daysUntilExpiry <= 7) {
            memberStatus = 'Expiring';
          }
        }
        
        return {
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email || '',
          phone: member.phone || '',
          plan,
          status: memberStatus,
          joinDate: member.created_at.split('T')[0],
          expiryDate: endDate || 'N/A',
          paymentStatus: endDate && new Date(endDate) > new Date() ? 'Paid' : 'Due'
        };
      }) || [];
    }
  });

  // Delete member mutation
  const deleteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: "Member Deleted",
        description: "Member has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (memberId: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      deleteMutation.mutate(memberId);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default" className="bg-success">Active</Badge>;
      case "Expiring":
        return <Badge variant="default" className="bg-warning">Expiring</Badge>;
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge variant="outline" className="text-success border-success">Paid</Badge>;
      case "Due":
        return <Badge variant="outline" className="text-warning border-warning">Due</Badge>;
      case "Overdue":
        return <Badge variant="outline" className="text-destructive border-destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">Manage your gym members and their memberships.</p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => navigate('/add-member')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Member
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Active", "Expiring", "Expired"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{member.plan} Plan</p>
                    <p className="text-xs text-muted-foreground">Expires: {member.expiryDate}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(member.status)}
                    {getPaymentBadge(member.paymentStatus)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/members/${member.id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/members/${member.id}/edit`)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No members found matching your search criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}