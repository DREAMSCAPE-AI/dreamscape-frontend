import React, { useState } from 'react';
import { Search, Book, MessageCircle, HelpCircle, Leaf, Headset, Bot, X } from 'lucide-react';
import HelpSearch from './HelpSearch';
import AIGuides from './AIGuides';
import DynamicFAQ from './DynamicFAQ';
import BlogSection from './BlogSection';
import VRTutorials from './VRTutorials';
import SustainabilityInfo from './SustainabilityInfo';
import LiveChat from './LiveChat';

const SupportCenter = () => {
  const [activeSection, setActiveSection] = useState('search');
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'search', label: 'Help Center', icon: Search },
    { id: 'guides', label: 'Travel Guides', icon: Book },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'blog', label: 'Blog', icon: MessageCircle },
    { id: 'vr', label: 'VR Tutorials', icon: Headset },
    { id: 'sustainability', label: 'Sustainability', icon: Leaf }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveSection('search');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-md rounded-lg placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-600 hover:text-orange-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {activeSection === 'search' && <HelpSearch initialQuery={searchQuery} />}
          {activeSection === 'guides' && <AIGuides />}
          {activeSection === 'faq' && <DynamicFAQ />}
          {activeSection === 'blog' && <BlogSection />}
          {activeSection === 'vr' && <VRTutorials />}
          {activeSection === 'sustainability' && <SustainabilityInfo />}
        </div>
      </div>

      {/* Live Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <Bot className="w-6 h-6" />
        <span className="hidden md:inline">Need Help?</span>
      </button>

      {/* Live Chat Widget */}
      {showChat && (
        <LiveChat onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default SupportCenter;