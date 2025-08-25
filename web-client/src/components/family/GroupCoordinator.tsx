import React, { useState } from 'react';
import { Users, Calendar, MapPin, DollarSign, MessageSquare, Check, X, AlertCircle } from 'lucide-react';

interface GroupCoordinatorProps {
  groups: FamilyGroup[];
  onUpdateGroup: (group: FamilyGroup) => void;
  onAddGroup: (group: FamilyGroup) => void;
  onSendUpdate: (groupId: string, message: string) => void;
}

interface FamilyGroup {
  id: string;
  name: string;
  members: GroupMember[];
  preferences: {
    dates: string[];
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    interests: string[];
    dietaryRestrictions: string[];
    accessibility: string[];
  };
  status: 'planning' | 'confirmed' | 'completed';
  votes: {
    [key: string]: {
      accommodation?: string;
      activities?: string[];
      dates?: string[];
    };
  };
}

interface GroupMember {
  id: string;
  name: string;
  role: 'organizer' | 'member';
  adults: number;
  children: number;
  childrenAges?: number[];
  confirmed: boolean;
}

const GroupCoordinator: React.FC<GroupCoordinatorProps> = ({
  groups,
  onUpdateGroup,
  onAddGroup,
  onSendUpdate
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showVoting, setShowVoting] = useState(false);

  const currentGroup = groups.find(g => g.id === selectedGroup);

  return (
    <div className="space-y-8">
      {/* Groups Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Family Groups</h2>
          <button
            onClick={() => onAddGroup({
              id: crypto.randomUUID(),
              name: 'New Group',
              members: [],
              preferences: {
                dates: [],
                budget: { min: 0, max: 0, currency: 'USD' },
                interests: [],
                dietaryRestrictions: [],
                accessibility: []
              },
              status: 'planning',
              votes: {}
            })}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Create Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                selectedGroup === group.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-100 bg-white hover:border-orange-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{group.name}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  group.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                  group.status === 'planning' ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {group.members.length} families ({
                      group.members.reduce((acc, m) => acc + m.adults + (m.children || 0), 0)
                    } people)
                  </span>
                </div>
                {group.preferences.dates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{group.preferences.dates[0]} - {group.preferences.dates[1]}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Group Details */}
      {currentGroup && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">{currentGroup.name} Details</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowVoting(!showVoting)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showVoting ? 'Hide Voting' : 'Show Voting'}
              </button>
              <button
                onClick={() => {
                  const message = `Update for ${currentGroup.name}: New activity suggestions available!`;
                  onSendUpdate(currentGroup.id, message);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Send Update
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="mb-8">
            <h4 className="font-medium mb-4">Group Members</h4>
            <div className="space-y-3">
              {currentGroup.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">
                        {member.adults} adults, {member.children} children
                        {member.childrenAges && ` (ages: ${member.childrenAges.join(', ')})`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === 'organizer' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-sm">
                        Organizer
                      </span>
                    )}
                    {member.confirmed ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voting Section */}
          {showVoting && (
            <div className="space-y-6">
              <h4 className="font-medium">Group Voting</h4>
              
              {/* Dates */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Preferred Dates</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['July 1-15', 'July 15-30', 'August 1-15'].map((date) => (
                    <button
                      key={date}
                      className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Suggested Activities</h5>
                <div className="space-y-2">
                  {['Theme Park Visit', 'Beach Day', 'Zoo Adventure'].map((activity) => (
                    <div
                      key={activity}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span>{activity}</span>
                      <div className="flex gap-2">
                        <button className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupCoordinator;