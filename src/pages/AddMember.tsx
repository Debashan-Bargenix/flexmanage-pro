import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, User, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddMember() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch membership plans
  const { data: membershipPlans = [] } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    membershipPlan: "",
    startDate: "",
    notes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Create member mutation
  const createMemberMutation = useMutation({
    mutationFn: async (memberData: any) => {
      // Create member
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert({
          first_name: memberData.firstName,
          last_name: memberData.lastName,
          email: memberData.email,
          phone: memberData.phone,
          address: memberData.address,
          emergency_contact_name: memberData.emergencyContact,
          emergency_contact_phone: memberData.emergencyPhone,
          notes: memberData.notes,
          status: 'active'
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Create membership if plan selected
      if (memberData.membershipPlan && memberData.startDate) {
        const selectedPlan = membershipPlans.find(p => p.id === memberData.membershipPlan);
        if (selectedPlan) {
          const startDate = new Date(memberData.startDate);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + selectedPlan.duration_months);

          const { error: membershipError } = await supabase
            .from('member_memberships')
            .insert({
              member_id: member.id,
              membership_plan_id: selectedPlan.id,
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              status: 'active'
            });

          if (membershipError) throw membershipError;
        }
      }

      return member;
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      toast({
        title: "Member Added Successfully",
        description: `${formData.firstName} ${formData.lastName} has been added to the system.`,
      });

      navigate("/members");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    createMemberMutation.mutate(formData);
  };

  const selectedPlan = membershipPlans.find(plan => plan.id === formData.membershipPlan);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/members")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Members
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Member</h2>
          <p className="text-muted-foreground">Create a new gym membership account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact & Membership */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Membership Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="membershipPlan">Membership Plan *</Label>
                  <Select value={formData.membershipPlan} onValueChange={(value) => handleInputChange("membershipPlan", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a membership plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price}/{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlan && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">{selectedPlan.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Price: ${selectedPlan.price} per {selectedPlan.duration_months} month{selectedPlan.duration_months > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlan.description}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date {formData.membershipPlan ? '*' : ''}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required={!!formData.membershipPlan}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional notes or comments"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/members")}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-primary" disabled={createMemberMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {createMemberMutation.isPending ? 'Saving...' : 'Save Member'}
          </Button>
        </div>
      </form>
    </div>
  );
}