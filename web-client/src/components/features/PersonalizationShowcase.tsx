import React from 'react';
import { Brain, Zap, Calendar } from 'lucide-react';
import SectionTitle from '../shared/SectionTitle';

const benefits = [
  {
    icon: <Brain className="w-12 h-12 text-orange-400" />,
    title: "AI-Powered Recommendations",
    description: "Get personalized suggestions based on your preferences and travel history"
  },
  {
    icon: <Zap className="w-12 h-12 text-cyan-400" />,
    title: "Real-Time Personalization",
    description: "Experience dynamic adjustments as you explore and interact"
  },
  {
    icon: <Calendar className="w-12 h-12 text-pink-400" />,
    title: "Seamless Booking Experience",
    description: "Book your perfect trip with just a few clicks"
  }
];

const PersonalizationShowcase = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-amber-50 to-sky-50">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title="Travel Tailored to You"
          subtitle="Experience travel like never before"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-white shadow-md">
              <div className="mb-6 inline-block p-4 rounded-full bg-gray-50">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity">
            How It Works
          </button>
        </div>
      </div>
    </section>
  );
};

export default PersonalizationShowcase;