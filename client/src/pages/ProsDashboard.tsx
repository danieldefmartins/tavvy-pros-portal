import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  User, 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
  ExternalLink,
  CreditCard,
  Share2
} from "lucide-react";
import { useLocation } from "wouter";

export default function ProsDashboard() {
  const { user } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [profileComplete] = useState(75); // Percentage of profile completion

  // Mock data - replace with actual data from API
  const stats = {
    totalLeads: 24,
    activeLeads: 8,
    responseRate: 92,
    avgRating: 4.8,
    reviewCount: 47,
    profileViews: 156
  };

  const recentLeads = [
    { id: 1, name: "John D.", service: "Plumbing Repair", location: "Miami, FL", date: "Today", status: "new" },
    { id: 2, name: "Sarah M.", service: "Water Heater", location: "Fort Lauderdale, FL", date: "Yesterday", status: "contacted" },
    { id: 3, name: "Mike R.", service: "Drain Cleaning", location: "Hollywood, FL", date: "2 days ago", status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-[#f9f7f2]">
      {/* Header */}
      <header className="bg-[#0f172a] text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-horizontal.png" alt="Tavvy" className="h-8" />
            <span className="text-orange-500 font-semibold">Pros</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{user?.email}</span>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your Tavvy Pro account.</p>
        </div>

        {/* Profile Completion Alert */}
        {profileComplete < 100 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Complete your profile</p>
                    <p className="text-sm text-gray-600">Profiles that are 100% complete get 3x more leads</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-orange-600">{profileComplete}%</span>
                    <p className="text-xs text-gray-500">complete</p>
                  </div>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeLeads}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Response Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.responseRate}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">Excellent!</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="text-3xl font-bold text-gray-900">{stats.avgRating}</p>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stats.reviewCount} reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Leads */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Leads</CardTitle>
                    <CardDescription>Customers looking for your services</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-500">{lead.service}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {lead.location}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{lead.date}</span>
                          <Badge 
                            variant={lead.status === "new" ? "default" : lead.status === "contacted" ? "secondary" : "outline"}
                            className={lead.status === "new" ? "bg-green-500" : ""}
                          >
                            {lead.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600" 
                  onClick={() => setLocation('/digital-card')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Digital Business Card
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Business Profile
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Update Service Areas
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Set Availability
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Badge className="bg-green-500 mb-2">Active</Badge>
                  <p className="text-2xl font-bold text-gray-900">$99</p>
                  <p className="text-sm text-gray-500">Founding Pro Rate</p>
                  <p className="text-xs text-gray-400 mt-2">First year pricing • Then $499/year</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
