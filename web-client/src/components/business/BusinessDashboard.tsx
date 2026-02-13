import React, { useState } from 'react';
import { Calendar, DollarSign, FileText, Clock, Shield, AlertCircle } from 'lucide-react';
import BusinessItinerary from './BusinessItinerary';
import ExpenseTracker from './ExpenseTracker';
import RebookingOptions from './RebookingOptions';

const meetings = [
  {
    id: '1',
    title: 'Client Meeting',
    location: 'Paris Office',
    startTime: '2024-03-20T10:00:00',
    endTime: '2024-03-20T11:30:00',
    participants: ['John Doe', 'Sarah Smith']
  },
  {
    id: '2',
    title: 'Team Workshop',
    location: 'Innovation Hub',
    startTime: '2024-03-20T14:00:00',
    endTime: '2024-03-20T16:00:00',
    participants: ['Team Alpha', 'Team Beta']
  }
];

const travelPolicies = [
  {
    category: 'Flights',
    rules: [
      'Business class allowed for flights over 6 hours',
      'Booking required 14 days in advance',
      'Preferred airlines: Star Alliance members'
    ]
  },
  {
    category: 'Hotels',
    rules: [
      'Maximum rate: $300/night',
      '4-star hotels or below',
      'Room service limit: $50/day'
    ]
  }
];

const BusinessDashboard = () => {
  const [showRebooking, setShowRebooking] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'expenses' | 'documents'>('itinerary');

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Next Meeting', value: '10:00 AM', icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { title: 'Monthly Expenses', value: '$2,450', icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { title: 'Policy Compliance', value: '98%', icon: Shield, color: 'bg-orange-50 text-orange-600' },
          { title: 'Pending Reports', value: '2', icon: FileText, color: 'bg-purple-50 text-purple-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'itinerary', label: 'Business Itinerary', icon: Calendar },
              { id: 'expenses', label: 'Expense Management', icon: DollarSign },
              { id: 'documents', label: 'Travel Documents', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 hover:text-orange-500'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'itinerary' && (
            <BusinessItinerary
              meetings={meetings}
              flights={[
                {
                  id: 'flight1',
                  itineraries: [{
                    segments: [{
                      departure: { iataCode: 'CDG', at: '2024-03-20T08:00:00' },
                      arrival: { iataCode: 'LHR', at: '2024-03-20T09:00:00' },
                      carrierCode: 'AF',
                      number: '1234'
                    }]
                  }]
                }
              ]}
              hotels={[
                {
                  id: 'hotel1',
                  name: 'Business Hotel Paris',
                  chainCode: 'HIL',
                  rating: '4'
                }
              ]}
              experiences={[]}
              onRebookFlight={() => setShowRebooking(true)}
            />
          )}

          {activeTab === 'expenses' && <ExpenseTracker />}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-medium">Travel Policy Highlights</h3>
                </div>
                <div className="space-y-4">
                  {travelPolicies.map((policy, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900 mb-2">{policy.category}</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {policy.rules.map((rule, ruleIndex) => (
                          <li key={ruleIndex}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Travel Insurance', type: 'PDF', date: '2024-02-15' },
                  { title: 'Visa Documents', type: 'PDF', date: '2024-02-10' },
                  { title: 'Company Policy', type: 'PDF', date: '2024-01-20' },
                  { title: 'Emergency Contacts', type: 'PDF', date: '2024-01-15' }
                ].map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-gray-500">
                          {doc.type} • Updated {doc.date}
                        </div>
                      </div>
                    </div>
                    <button className="text-orange-500 hover:text-orange-600">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rebooking Modal */}
      {showRebooking && (
        <RebookingOptions
          originalFlight={{
            id: 'flight1',
            itineraries: [{
              segments: [{
                departure: { iataCode: 'CDG', at: '2024-03-20T08:00:00' },
                arrival: { iataCode: 'LHR', at: '2024-03-20T09:00:00' },
                carrierCode: 'AF',
                number: '1234'
              }]
            }]
          }}
          alternativeFlights={[
            {
              id: 'flight2',
              itineraries: [{
                segments: [{
                  departure: { iataCode: 'CDG', at: '2024-03-20T10:00:00' },
                  arrival: { iataCode: 'LHR', at: '2024-03-20T11:00:00' },
                  carrierCode: 'BA',
                  number: '5678'
                }]
              }]
            }
          ]}
          onClose={() => setShowRebooking(false)}
          onSelect={() => {
            // Handle flight selection
            setShowRebooking(false);
          }}
        />
      )}
    </div>
  );
};

export default BusinessDashboard;