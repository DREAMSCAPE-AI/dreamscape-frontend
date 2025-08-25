import React from 'react';
import { Leaf, Recycle, TreePine, Globe } from 'lucide-react';

interface SustainabilityScoreProps {
  carbonFootprint: number;
  sustainabilityScore: number;
  ecoInitiatives: string[];
  alternativeOptions?: {
    type: string;
    carbonSaving: number;
    price: number;
  }[];
}

const SustainabilityScore: React.FC<SustainabilityScoreProps> = ({
  carbonFootprint,
  sustainabilityScore,
  ecoInitiatives,
  alternativeOptions
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Environmental Impact</h2>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Carbon Footprint */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium">Carbon Footprint</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">{carbonFootprint} kg CO₂e</div>
          <div className="text-sm text-gray-500 mt-1">
            Equivalent to {(carbonFootprint / 2.5).toFixed(1)} tree-months to offset
          </div>
        </div>

        {/* Sustainability Score */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium">Sustainability Score</h3>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(sustainabilityScore)}`}>
            {sustainabilityScore}/100
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Based on eco-friendly practices
          </div>
        </div>
      </div>

      {/* Eco Initiatives */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Eco-Friendly Initiatives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ecoInitiatives.map((initiative, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
            >
              <Recycle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-green-800">{initiative}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Options */}
      {alternativeOptions && alternativeOptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Greener Alternatives</h3>
          <div className="space-y-4">
            {alternativeOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:border-green-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <TreePine className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">{option.type}</div>
                    <div className="text-sm text-green-600">
                      Save {option.carbonSaving} kg CO₂e
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${option.price.toFixed(2)}
                  </div>
                  <button className="text-sm text-green-600 hover:text-green-700">
                    Switch to this option
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityScore;