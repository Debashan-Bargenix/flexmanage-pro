import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Users, DollarSign } from "lucide-react";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  features: string[];
  description?: string;
  memberCount: number;
  is_active: boolean;
}

export default function Memberships() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration_months: "",
    features: "",
    description: ""
  });

  // Fetch membership plans
  const { data: plans = [] } = useQuery({
    queryKey: ['membership-plans-detailed'],
    queryFn: async () => {
      const { data: plansData, error: plansError } = await supabase
        .from('membership_plans')
        .select('*')
        .order('price');
      
      if (plansError) throw plansError;

      // Get member counts for each plan
      const plansWithCounts = await Promise.all(
        (plansData || []).map(async (plan) => {
          const { count } = await supabase
            .from('member_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('membership_plan_id', plan.id)
            .eq('status', 'active');
          
          return {
            ...plan,
            memberCount: count || 0
          };
        })
      );

      return plansWithCounts;
    }
  });

  // Create/Update plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const featuresArray = planData.features.split(',').map((f: string) => f.trim()).filter((f: string) => f);
      
      if (editingPlan) {
        const { error } = await supabase
          .from('membership_plans')
          .update({
            name: planData.name,
            price: parseFloat(planData.price),
            duration_months: parseInt(planData.duration_months),
            features: featuresArray,
            description: planData.description
          })
          .eq('id', editingPlan.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('membership_plans')
          .insert({
            name: planData.name,
            price: parseFloat(planData.price),
            duration_months: parseInt(planData.duration_months),
            features: featuresArray,
            description: planData.description,
            is_active: true
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      
      toast({
        title: editingPlan ? "Plan Updated" : "Plan Created",
        description: `${formData.name} has been ${editingPlan ? 'updated' : 'created'} successfully.`,
      });
      
      setFormData({ name: "", price: "", duration_months: "", features: "", description: "" });
      setEditingPlan(null);
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('membership_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      
      toast({
        title: "Plan Deleted",
        description: "The membership plan has been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Toggle plan status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ planId, newStatus }: { planId: string; newStatus: boolean }) => {
      const { error } = await supabase
        .from('membership_plans')
        .update({ is_active: newStatus })
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.duration_months) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    savePlanMutation.mutate(formData);
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration_months: plan.duration_months.toString(),
      features: plan.features?.join(', ') || '',
      description: plan.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (planId: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      deletePlanMutation.mutate(planId);
    }
  };

  const handleToggleStatus = (planId: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ planId, newStatus: !currentStatus });
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", duration_months: "", features: "", description: "" });
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Membership Plans</h2>
          <p className="text-muted-foreground">Create and manage your gym membership plans.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Membership Plan" : "Create New Membership Plan"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Premium Plan"
                  required
                />
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="49.99"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_months">Duration (months) *</Label>
                    <Input
                      id="duration_months"
                      type="number"
                      value={formData.duration_months}
                      onChange={(e) => handleInputChange("duration_months", e.target.value)}
                      placeholder="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Input
                    id="features"
                    value={formData.features}
                    onChange={(e) => handleInputChange("features", e.target.value)}
                    placeholder="Gym Access, Group Classes, Personal Training"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Plan description..."
                    rows={3}
                  />
                </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={plan.is_active ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleToggleStatus(plan.id, plan.is_active)}
                  >
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="text-3xl font-bold text-accent">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {(plan.features || []).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {plan.memberCount} members
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  ${(plan.price * plan.memberCount).toLocaleString()}/mo
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDelete(plan.id)}
                  disabled={plan.memberCount > 0}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No membership plans yet</h3>
              <p className="text-muted-foreground mb-4">Create your first membership plan to get started.</p>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}