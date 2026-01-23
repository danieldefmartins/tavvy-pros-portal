import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  FileText, 
  Share2, 
  Download,
  Check,
  Globe,
  Instagram,
  Facebook,
  Briefcase,
  MapPin,
  Star,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Mock data - will be replaced with API call
const MOCK_PRO_DATA = {
  id: "martinez-plumbing",
  companyName: "Martinez Plumbing",
  tagline: "Your Trusted Local Plumber",
  phone: "+15551234567",
  phoneDisplay: "(555) 123-4567",
  email: "contact@martinezplumbing.com",
  city: "Orlando",
  state: "FL",
  category: "Plumber",
  profilePhoto: null,
  logoPhoto: null,
  gradientColors: ['#8B5CF6', '#6366F1'],
  verified: true,
  enabledTabs: ['contact', 'services'],
  socialLinks: {
    instagram: 'martinezplumbing',
    facebook: 'martinezplumbingorlando',
    website: 'www.martinezplumbing.com',
  },
  services: [
    'Leak Repair',
    'Water Heater Installation',
    'Drain Cleaning',
    'Pipe Repair',
    'Emergency Services'
  ],
  tavvyProfileUrl: 'https://tavvy.com/pros/martinez-plumbing',
  portfolioUrl: 'https://tavvy.com/pros/martinez-plumbing/portfolio',
};

// Generate vCard string
function generateVCard(pro: typeof MOCK_PRO_DATA): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${pro.companyName}`,
    `ORG:${pro.companyName}`,
    `TEL;TYPE=WORK,VOICE:${pro.phone}`,
    `EMAIL;TYPE=WORK:${pro.email}`,
    `ADR;TYPE=WORK:;;${pro.city};${pro.state};;;`,
    `URL:${pro.socialLinks.website || pro.tavvyProfileUrl}`,
    `NOTE:${pro.category} - ${pro.tagline}`,
    'END:VCARD'
  ].join('\n');
  return vcard;
}

// Download vCard
function downloadVCard(pro: typeof MOCK_PRO_DATA) {
  const vcard = generateVCard(pro);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${pro.companyName.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Share card
async function shareCard(pro: typeof MOCK_PRO_DATA, cardUrl: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: pro.companyName,
        text: `Check out ${pro.companyName} - ${pro.tagline}`,
        url: cardUrl,
      });
    } catch (err) {
      console.log('Share cancelled');
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(cardUrl);
    alert('Link copied to clipboard!');
  }
}

export default function PublicProCard() {
  const [, params] = useRoute("/pro/:slug");
  const slug = params?.slug || "martinez-plumbing";
  
  const [proData, setProData] = useState(MOCK_PRO_DATA);
  const [activeTab, setActiveTab] = useState('contact');
  const [showQR, setShowQR] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const cardUrl = `${window.location.origin}/pro/${slug}`;
  const gradient = `linear-gradient(135deg, ${proData.gradientColors[0]}, ${proData.gradientColors[1]})`;

  // Load pro data
  useEffect(() => {
    // TODO: Fetch from Supabase based on slug
    // For now using mock data
  }, [slug]);

  // Handle save contact
  const handleSaveContact = () => {
    downloadVCard(proData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle share
  const handleShare = () => {
    shareCard(proData, cardUrl);
  };

  // Social link click
  const openSocialLink = (type: string, value: string) => {
    let url = '';
    switch (type) {
      case 'instagram':
        url = `https://instagram.com/${value}`;
        break;
      case 'facebook':
        url = `https://facebook.com/${value}`;
        break;
      case 'website':
        url = value.startsWith('http') ? value : `https://${value}`;
        break;
      case 'tavvy':
        url = proData.tavvyProfileUrl;
        break;
      case 'portfolio':
        url = proData.portfolioUrl;
        break;
    }
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Gradient Header */}
        <div 
          className="pt-10 pb-8 px-6 text-white relative"
          style={{ background: gradient }}
        >
          {/* Tavvy Badge */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <img src="/logo-icon.png" alt="Tavvy" className="h-4 w-4" />
            <span className="text-xs font-medium">Tavvy Pro</span>
          </div>

          {/* Profile Photo */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/50 overflow-hidden flex items-center justify-center">
              {proData.profilePhoto ? (
                <img src={proData.profilePhoto} alt={proData.companyName} className="w-full h-full object-cover" />
              ) : (
                <div className="text-white/60">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>
          
          {/* Company Info */}
          <div className="text-center">
            <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
              {proData.companyName}
              {proData.verified && (
                <span className="bg-blue-500 rounded-full p-1">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </h1>
            <p className="text-white/80 text-sm mt-1">{proData.tagline}</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-white/70 text-sm">
              <MapPin className="h-3 w-3" />
              <span>{proData.category} • {proData.city}, {proData.state}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b px-4 py-3 flex gap-2">
          {proData.enabledTabs.map((tabId) => (
            <button
              key={tabId}
              className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === tabId
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={activeTab === tabId ? { background: gradient } : {}}
              onClick={() => setActiveTab(tabId)}
            >
              {tabId.charAt(0).toUpperCase() + tabId.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 space-y-3">
          {activeTab === 'contact' && (
            <>
              <a 
                href={`tel:${proData.phone}`}
                className="w-full py-3.5 px-4 bg-slate-800 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
              <a 
                href={`sms:${proData.phone}`}
                className="w-full py-3.5 px-4 bg-slate-800 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Send Text
              </a>
              <a 
                href={`mailto:${proData.email}`}
                className="w-full py-3.5 px-4 bg-slate-800 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
              <button 
                className="w-full py-3.5 px-4 bg-slate-800 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-700 transition-colors"
                onClick={() => window.open(`${proData.tavvyProfileUrl}/quote`, '_blank')}
              >
                <FileText className="h-4 w-4" />
                Request Quote
              </button>
            </>
          )}
          
          {activeTab === 'services' && (
            <div className="space-y-2">
              {proData.services.map((service, i) => (
                <div 
                  key={i} 
                  className="py-3.5 px-4 bg-gray-50 rounded-xl text-sm text-gray-700 flex items-center justify-between"
                >
                  <span>{service}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="px-4 py-4 flex justify-center gap-3 border-t">
          {proData.socialLinks.instagram && (
            <button 
              onClick={() => openSocialLink('instagram', proData.socialLinks.instagram)}
              className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <Instagram className="h-5 w-5 text-white" />
            </button>
          )}
          {proData.socialLinks.facebook && (
            <button 
              onClick={() => openSocialLink('facebook', proData.socialLinks.facebook)}
              className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <Facebook className="h-5 w-5 text-white" />
            </button>
          )}
          {proData.socialLinks.website && (
            <button 
              onClick={() => openSocialLink('website', proData.socialLinks.website)}
              className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <Globe className="h-5 w-5 text-white" />
            </button>
          )}
          <button 
            onClick={() => openSocialLink('tavvy', '')}
            className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <img src="/logo-icon.png" alt="Tavvy" className="h-5 w-5" />
          </button>
          <button 
            onClick={() => openSocialLink('portfolio', '')}
            className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <Briefcase className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="px-4 pb-6 pt-2 flex gap-3">
          <button 
            onClick={handleShare}
            className="flex-1 py-3.5 px-4 border-2 border-gray-300 text-gray-700 rounded-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share Card
          </button>
          <button 
            onClick={handleSaveContact}
            className="flex-1 py-3.5 px-4 text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            style={{ background: gradient }}
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Save Contact
              </>
            )}
          </button>
          <button 
            onClick={() => setShowQR(!showQR)}
            className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <QRCodeSVG value={cardUrl} size={32} />
          </button>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQR(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-center mb-4">Scan to Save</h3>
              <div className="flex justify-center mb-4">
                <QRCodeSVG 
                  value={cardUrl} 
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-sm text-gray-500 text-center mb-4">
                Scan this QR code to open {proData.companyName}'s digital card
              </p>
              <button 
                onClick={() => setShowQR(false)}
                className="w-full py-3 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Save to Wallet Banner */}
        <div className="px-4 pb-4">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-colors"
            onClick={() => {
              // TODO: Implement save to Tavvy Wallet
              alert('Save to Tavvy Wallet - Coming Soon!');
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <img src="/logo-icon.png" alt="Tavvy" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Save to Tavvy Wallet</p>
                <p className="text-white/70 text-xs">Keep all your contractors in one place</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
