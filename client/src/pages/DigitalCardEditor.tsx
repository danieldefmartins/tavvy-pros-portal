import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Palette,
  Eye,
  Save,
  Share2,
  QrCode,
  Phone,
  MessageSquare,
  Mail,
  FileText,
  Star,
  Globe,
  Instagram,
  Facebook,
  Briefcase,
  Check,
  X,
  ChevronDown
} from "lucide-react";
import { useLocation } from "wouter";

// Predefined gradient presets
const GRADIENT_PRESETS = [
  { id: 'purple-indigo', name: 'Purple Indigo', colors: ['#8B5CF6', '#6366F1'], preview: 'linear-gradient(135deg, #8B5CF6, #6366F1)' },
  { id: 'blue-cyan', name: 'Ocean Blue', colors: ['#3B82F6', '#06B6D4'], preview: 'linear-gradient(135deg, #3B82F6, #06B6D4)' },
  { id: 'orange-red', name: 'Sunset', colors: ['#F97316', '#EF4444'], preview: 'linear-gradient(135deg, #F97316, #EF4444)' },
  { id: 'green-teal', name: 'Forest', colors: ['#22C55E', '#14B8A6'], preview: 'linear-gradient(135deg, #22C55E, #14B8A6)' },
  { id: 'pink-purple', name: 'Berry', colors: ['#EC4899', '#8B5CF6'], preview: 'linear-gradient(135deg, #EC4899, #8B5CF6)' },
  { id: 'teal-blue', name: 'Aqua', colors: ['#14B8A6', '#3B82F6'], preview: 'linear-gradient(135deg, #14B8A6, #3B82F6)' },
  { id: 'amber-orange', name: 'Golden', colors: ['#F59E0B', '#F97316'], preview: 'linear-gradient(135deg, #F59E0B, #F97316)' },
  { id: 'slate-gray', name: 'Professional', colors: ['#475569', '#1E293B'], preview: 'linear-gradient(135deg, #475569, #1E293B)' },
];

// Available tabs for the card
const AVAILABLE_TABS = [
  { id: 'contact', name: 'Contact', icon: Phone, description: 'Call, Text, Email buttons' },
  { id: 'services', name: 'Services', icon: Briefcase, description: 'List your services' },
  { id: 'portfolio', name: 'Portfolio', icon: ImageIcon, description: 'Show your work' },
  { id: 'reviews', name: 'Reviews', icon: Star, description: 'Display customer reviews' },
  { id: 'about', name: 'About', icon: FileText, description: 'About your business' },
];

// Social media options
const SOCIAL_OPTIONS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'instagram.com/username' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'facebook.com/page' },
  { id: 'website', name: 'Website', icon: Globe, placeholder: 'www.yourwebsite.com' },
  { id: 'tiktok', name: 'TikTok', icon: Globe, placeholder: 'tiktok.com/@username' },
  { id: 'youtube', name: 'YouTube', icon: Globe, placeholder: 'youtube.com/@channel' },
  { id: 'linkedin', name: 'LinkedIn', icon: Globe, placeholder: 'linkedin.com/company/name' },
];

interface CardData {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  city: string;
  category: string;
  profilePhoto: string | null;
  logoPhoto: string | null;
  gradientPreset: string;
  customGradientStart: string;
  customGradientEnd: string;
  useCustomGradient: boolean;
  enabledTabs: string[];
  socialLinks: { [key: string]: string };
  services: string[];
  aboutText: string;
}

export default function DigitalCardEditor() {
  const [, setLocation] = useLocation();
  const { user } = useSupabaseAuth();
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const logoPhotoRef = useRef<HTMLInputElement>(null);
  
  const [cardData, setCardData] = useState<CardData>({
    companyName: "Martinez Plumbing",
    tagline: "Your Trusted Local Plumber",
    phone: "(555) 123-4567",
    email: "contact@martinezplumbing.com",
    city: "Orlando, FL",
    category: "Plumber",
    profilePhoto: null,
    logoPhoto: null,
    gradientPreset: 'purple-indigo',
    customGradientStart: '#8B5CF6',
    customGradientEnd: '#6366F1',
    useCustomGradient: false,
    enabledTabs: ['contact', 'services'],
    socialLinks: {
      instagram: '',
      facebook: '',
      website: '',
    },
    services: ['Leak Repair', 'Water Heater', 'Drain Cleaning'],
    aboutText: '',
  });

  const [activePreviewTab, setActivePreviewTab] = useState('contact');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get current gradient
  const getCurrentGradient = () => {
    if (cardData.useCustomGradient) {
      return `linear-gradient(135deg, ${cardData.customGradientStart}, ${cardData.customGradientEnd})`;
    }
    const preset = GRADIENT_PRESETS.find(p => p.id === cardData.gradientPreset);
    return preset?.preview || GRADIENT_PRESETS[0].preview;
  };

  // Handle photo upload
  const handlePhotoUpload = (type: 'profile' | 'logo') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({
          ...prev,
          [type === 'profile' ? 'profilePhoto' : 'logoPhoto']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle tab
  const toggleTab = (tabId: string) => {
    setCardData(prev => {
      const isEnabled = prev.enabledTabs.includes(tabId);
      if (isEnabled && prev.enabledTabs.length <= 1) {
        return prev; // Keep at least one tab
      }
      return {
        ...prev,
        enabledTabs: isEnabled 
          ? prev.enabledTabs.filter(t => t !== tabId)
          : [...prev.enabledTabs, tabId].slice(0, 2) // Max 2 tabs
      };
    });
  };

  // Update social link
  const updateSocialLink = (id: string, value: string) => {
    setCardData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [id]: value }
    }));
  };

  // Save card
  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#f9f7f2]">
      {/* Header */}
      <header className="bg-[#0f172a] text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/10"
              onClick={() => setLocation('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <img src="/logo-horizontal.png" alt="Tavvy" className="h-8" />
              <span className="text-orange-500 font-semibold">Digital Card</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Card'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Editor */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your business details shown on the card</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName"
                      value={cardData.companyName}
                      onChange={(e) => setCardData(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category"
                      value={cardData.category}
                      onChange={(e) => setCardData(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input 
                    id="tagline"
                    value={cardData.tagline}
                    onChange={(e) => setCardData(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Your Trusted Local Plumber"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone"
                      value={cardData.phone}
                      onChange={(e) => setCardData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={cardData.email}
                      onChange={(e) => setCardData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    value={cardData.city}
                    onChange={(e) => setCardData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Orlando, FL"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>Upload your profile photo and logo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* Profile Photo */}
                  <div>
                    <Label className="mb-2 block">Profile Photo</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-orange-500 transition-colors"
                      onClick={() => profilePhotoRef.current?.click()}
                    >
                      {cardData.profilePhoto ? (
                        <img 
                          src={cardData.profilePhoto} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full mx-auto object-cover"
                        />
                      ) : (
                        <div className="py-4">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload</p>
                        </div>
                      )}
                    </div>
                    <input 
                      ref={profilePhotoRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handlePhotoUpload('profile')}
                    />
                  </div>

                  {/* Logo */}
                  <div>
                    <Label className="mb-2 block">Company Logo</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-orange-500 transition-colors"
                      onClick={() => logoPhotoRef.current?.click()}
                    >
                      {cardData.logoPhoto ? (
                        <img 
                          src={cardData.logoPhoto} 
                          alt="Logo" 
                          className="w-24 h-24 mx-auto object-contain"
                        />
                      ) : (
                        <div className="py-4">
                          <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload</p>
                        </div>
                      )}
                    </div>
                    <input 
                      ref={logoPhotoRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handlePhotoUpload('logo')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Card Colors
                </CardTitle>
                <CardDescription>Choose your card's gradient colors</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Preset Gradients */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      className={`h-16 rounded-lg transition-all ${
                        cardData.gradientPreset === preset.id && !cardData.useCustomGradient
                          ? 'ring-2 ring-orange-500 ring-offset-2'
                          : 'hover:scale-105'
                      }`}
                      style={{ background: preset.preview }}
                      onClick={() => setCardData(prev => ({ 
                        ...prev, 
                        gradientPreset: preset.id,
                        useCustomGradient: false 
                      }))}
                      title={preset.name}
                    />
                  ))}
                </div>

                {/* Custom Colors Toggle */}
                <div className="flex items-center justify-between py-3 border-t">
                  <div>
                    <p className="font-medium text-sm">Use Custom Colors</p>
                    <p className="text-xs text-gray-500">Pick your own gradient colors</p>
                  </div>
                  <Switch 
                    checked={cardData.useCustomGradient}
                    onCheckedChange={(checked) => setCardData(prev => ({ ...prev, useCustomGradient: checked }))}
                  />
                </div>

                {/* Custom Color Pickers */}
                {cardData.useCustomGradient && (
                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div>
                      <Label className="text-xs">Start Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input 
                          type="color" 
                          value={cardData.customGradientStart}
                          onChange={(e) => setCardData(prev => ({ ...prev, customGradientStart: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input 
                          value={cardData.customGradientStart}
                          onChange={(e) => setCardData(prev => ({ ...prev, customGradientStart: e.target.value }))}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">End Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input 
                          type="color" 
                          value={cardData.customGradientEnd}
                          onChange={(e) => setCardData(prev => ({ ...prev, customGradientEnd: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input 
                          value={cardData.customGradientEnd}
                          onChange={(e) => setCardData(prev => ({ ...prev, customGradientEnd: e.target.value }))}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Card Tabs</CardTitle>
                <CardDescription>Choose up to 2 tabs to display on your card</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {AVAILABLE_TABS.map((tab) => {
                    const isEnabled = cardData.enabledTabs.includes(tab.id);
                    const Icon = tab.icon;
                    return (
                      <div 
                        key={tab.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          isEnabled ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleTab(tab.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isEnabled ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tab.name}</p>
                            <p className="text-xs text-gray-500">{tab.description}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isEnabled ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                        }`}>
                          {isEnabled && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Add up to 3 social media links (plus Tavvy profile)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {SOCIAL_OPTIONS.slice(0, 3).map((social) => {
                  const Icon = social.icon;
                  return (
                    <div key={social.id} className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input 
                        placeholder={social.placeholder}
                        value={cardData.socialLinks[social.id] || ''}
                        onChange={(e) => updateSocialLink(social.id, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  );
                })}
                <p className="text-xs text-gray-500 pt-2">
                  Your Tavvy profile and Portfolio links are automatically included.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Card Preview</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Phone Frame */}
                <div className="bg-gray-900 p-4 flex justify-center">
                  <div className="w-[320px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-gray-800">
                    {/* Phone Notch */}
                    <div className="bg-gray-800 h-6 flex justify-center items-end pb-1">
                      <div className="w-20 h-4 bg-black rounded-full" />
                    </div>
                    
                    {/* Card Content */}
                    <div className="bg-gray-100 min-h-[580px]">
                      {/* Gradient Header */}
                      <div 
                        className="pt-8 pb-6 px-6 text-white"
                        style={{ background: getCurrentGradient() }}
                      >
                        {/* Profile Photo */}
                        <div className="flex justify-center mb-4">
                          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/50 overflow-hidden">
                            {cardData.profilePhoto ? (
                              <img src={cardData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/50">
                                <ImageIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Company Info */}
                        <div className="text-center">
                          <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                            {cardData.companyName}
                            <span className="bg-blue-500 rounded-full p-0.5">
                              <Check className="h-3 w-3" />
                            </span>
                          </h2>
                          <p className="text-white/80 text-sm mt-1">{cardData.tagline}</p>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="bg-white border-b px-4 py-2 flex gap-2">
                        {cardData.enabledTabs.map((tabId) => {
                          const tab = AVAILABLE_TABS.find(t => t.id === tabId);
                          if (!tab) return null;
                          return (
                            <button
                              key={tabId}
                              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                                activePreviewTab === tabId
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                              onClick={() => setActivePreviewTab(tabId)}
                            >
                              {tab.name}
                            </button>
                          );
                        })}
                      </div>

                      {/* Tab Content */}
                      <div className="p-4 space-y-3">
                        {activePreviewTab === 'contact' && (
                          <>
                            <button className="w-full py-3 px-4 bg-slate-800 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium">
                              <Phone className="h-4 w-4" />
                              Call Now
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-800 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium">
                              <MessageSquare className="h-4 w-4" />
                              Send Text
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-800 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium">
                              <Mail className="h-4 w-4" />
                              Email
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-800 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium">
                              <FileText className="h-4 w-4" />
                              Request Quote
                            </button>
                          </>
                        )}
                        {activePreviewTab === 'services' && (
                          <div className="space-y-2">
                            {cardData.services.map((service, i) => (
                              <div key={i} className="py-3 px-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                                {service}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Social Links */}
                      <div className="px-4 py-3 flex justify-center gap-4">
                        {Object.entries(cardData.socialLinks).map(([key, value]) => {
                          if (!value) return null;
                          const social = SOCIAL_OPTIONS.find(s => s.id === key);
                          if (!social) return null;
                          const Icon = social.icon;
                          return (
                            <div key={key} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                          );
                        })}
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="px-4 pb-6 pt-2 flex gap-3">
                        <button className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-full flex items-center justify-center gap-2 text-sm font-medium">
                          <Share2 className="h-4 w-4" />
                          Share Card
                        </button>
                        <button className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium">
                          <Phone className="h-4 w-4" />
                          Save Contact
                        </button>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <QrCode className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Phone Home Bar */}
                    <div className="bg-gray-100 h-6 flex justify-center items-center">
                      <div className="w-32 h-1 bg-gray-800 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card URL */}
            <Card className="mt-4">
              <CardContent className="py-4">
                <Label className="text-xs text-gray-500">Your Card URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={`tavvy.com/pro/${cardData.companyName.toLowerCase().replace(/\s+/g, '-')}`}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button variant="outline" size="sm">
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
