import React from 'react';
import { Leaf, Recycle, TreePine, Globe } from 'lucide-react';

const SustainabilityInfo = () => {
  const initiatives = [
    {
      icon: TreePine,
      title: "Carbon Offset Program",
      description: "We partner with environmental organizations to offset the carbon footprint of your travels"
    },
    {
      icon: Recycle,
      title: "Eco-Friendly Partners",
      description: "We work exclusively with accommodations and tour operators committed to sustainable practices"
    },
    {
      icon: Globe,
      title: "Local Community Support",
      description: "A portion of every booking goes directly to supporting local communities"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=80"
            alt="Nature"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-8 h-8" />
            <h2 className="text-2xl font-semibold">Our Commitment to Sustainability</h2>
          </div>
          <p className="text-green-50 max-w-2xl">
            We believe in responsible tourism that preserves destinations for future generations.
            Learn about our initiatives to make travel more sustainable and environmentally conscious.
          </p>
        </div>
      </div>

      {/* Initiatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initiatives.map((initiative, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <initiative.icon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{initiative.title}</h3>
            <p className="text-gray-600">{initiative.description}</p>
          </div>
        ))}
      </div>

      {/* Impact Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6">Our Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { value: "50K+", label: "Trees Planted" },
            { value: "100K", label: "CO₂ Offset (tons)" },
            { value: "200+", label: "Local Communities" },
            { value: "85%", label: "Eco-Certified Partners" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Eco Tips */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Sustainable Travel Tips</h3>
        <div className="space-y-4">
          {[
            "Choose eco-friendly accommodations",
            "Support local businesses and artisans",
            "Use public transportation when possible",
            "Minimize plastic waste while traveling"
          ].map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-gray-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityInfo;