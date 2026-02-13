import React, { useState } from 'react';
import { X, Plane, Hotel, Activity, Plus, Loader2 } from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import FlightSearchWrapper from './search-wrappers/FlightSearchWrapper';
import HotelSearchWrapper from './search-wrappers/HotelSearchWrapper';
import ActivitySearchWrapper from './search-wrappers/ActivitySearchWrapper';
import SeatSelection, { SelectedSeat } from '@/components/flights/SeatSelection';
import MealSelection, { SelectedMeal } from '@/components/flights/MealSelection';
import BaggageSelection, { SelectedBaggage } from '@/components/flights/BaggageSelection';
import PassengerInfo, { PassengerDetails } from '@/components/flights/PassengerInfo';
import {
  flightToItineraryItem,
  hotelToItineraryItem,
  activityToItineraryItem
} from '@/utils/itineraryTransformers';
import { enrichFlightWithItineraries } from '@/utils/flightUtils';

interface AddItemModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
  onSuccess?: () => void;
}

type TabType = 'FLIGHT' | 'HOTEL' | 'ACTIVITY';
type CustomizationStep = 'search' | 'customize-seats' | 'customize-meals' | 'customize-baggage' | 'passenger-info' | 'confirm';

const AddItemModalV2: React.FC<AddItemModalV2Props> = ({
  isOpen,
  onClose,
  itineraryId,
  onSuccess
}) => {
  const { addItem, isSaving } = useItineraryStore();
  const [selectedTab, setSelectedTab] = useState<TabType>('FLIGHT');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<CustomizationStep>('search');
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal[]>([]);
  const [selectedBaggage, setSelectedBaggage] = useState<SelectedBaggage[]>([]);
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails[]>([]);

  const tabs = [
    {
      id: 'FLIGHT' as TabType,
      label: 'Flight',
      icon: Plane,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      activeBorder: 'border-blue-500'
    },
    {
      id: 'HOTEL' as TabType,
      label: 'Hotel',
      icon: Hotel,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      activeBorder: 'border-green-500'
    },
    {
      id: 'ACTIVITY' as TabType,
      label: 'Activity',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      activeBorder: 'border-orange-500'
    }
  ];

  const handleAddToItinerary = async () => {
    if (!selectedItem) return;

    try {
      let itemDto;

      switch (selectedTab) {
        case 'FLIGHT':
          itemDto = flightToItineraryItem(selectedItem, {
            seats: selectedSeats,
            meals: selectedMeals,
            baggage: selectedBaggage,
            passengers: passengerDetails
          });
          break;
        case 'HOTEL':
          itemDto = hotelToItineraryItem(selectedItem);
          break;
        case 'ACTIVITY':
          itemDto = activityToItineraryItem(selectedItem);
          break;
        default:
          throw new Error('Invalid tab type');
      }

      await addItem(itineraryId, itemDto);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add item to itinerary:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    setSelectedTab('FLIGHT');
    setCurrentStep('search');
    setSelectedSeats([]);
    setSelectedMeals([]);
    setSelectedBaggage([]);
    setPassengerDetails([]);
    onClose();
  };

  const handleSelectItem = (item: any) => {
    console.log('[AddItemModalV2] Selected item:', item);
    console.log('[AddItemModalV2] Item has itineraries?', !!item?.itineraries);

    // For flights, enrich with itineraries structure if missing
    if (selectedTab === 'FLIGHT') {
      const enrichedFlight = enrichFlightWithItineraries(item);
      console.log('[AddItemModalV2] Enriched flight:', enrichedFlight);
      setSelectedItem(enrichedFlight);
      // Always proceed to customization for flights
      setCurrentStep('customize-seats');
    } else {
      // For hotels and activities, keep on search step
      setSelectedItem(item);
    }
  };

  if (!isOpen) return null;

  const currentTab = tabs.find(t => t.id === selectedTab)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add to Itinerary</h2>
            <p className="text-sm text-gray-600 mt-1">
              Search and select {currentTab.label.toLowerCase()} to add to your trip
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id);
                  setSelectedItem(null);
                  setCurrentStep('search');
                  setSelectedSeats([]);
                  setSelectedMeals([]);
                  setSelectedBaggage([]);
                  setPassengerDetails([]);
                }}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  isActive
                    ? `${tab.activeBorder} ${tab.color} font-semibold`
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search Step */}
          {currentStep === 'search' && (
            <>
              {selectedTab === 'FLIGHT' && (
                <FlightSearchWrapper
                  onSelectFlight={handleSelectItem}
                  selectedFlightId={selectedItem?.id}
                />
              )}

              {selectedTab === 'HOTEL' && (
                <HotelSearchWrapper
                  onSelectHotel={handleSelectItem}
                  selectedHotelId={selectedItem?.id}
                />
              )}

              {selectedTab === 'ACTIVITY' && (
                <ActivitySearchWrapper
                  onSelectActivity={handleSelectItem}
                  selectedActivityId={selectedItem?.id}
                />
              )}
            </>
          )}

          {/* Seat Selection Step (only for flights) */}
          {currentStep === 'customize-seats' && selectedItem && selectedTab === 'FLIGHT' && (
            <SeatSelection
              flight={selectedItem}
              returnFlight={null}
              passengers={selectedItem.passengers?.adults || 1}
              onBack={() => {
                setCurrentStep('search');
                setSelectedSeats([]);
              }}
              onContinue={(seats) => {
                setSelectedSeats(seats);
                setCurrentStep('customize-meals');
              }}
            />
          )}

          {/* Meal Selection Step (only for flights) */}
          {currentStep === 'customize-meals' && selectedItem && selectedTab === 'FLIGHT' && (
            <MealSelection
              flight={selectedItem}
              returnFlight={null}
              passengers={selectedItem.passengers?.adults || 1}
              onBack={() => {
                setCurrentStep('customize-seats');
                setSelectedMeals([]);
              }}
              onContinue={(meals) => {
                setSelectedMeals(meals);
                setCurrentStep('customize-baggage');
              }}
            />
          )}

          {/* Baggage Selection Step (only for flights) */}
          {currentStep === 'customize-baggage' && selectedItem && selectedTab === 'FLIGHT' && (
            <BaggageSelection
              passengers={selectedItem.passengers?.adults || 1}
              hasReturnFlight={false}
              onBack={() => {
                setCurrentStep('customize-meals');
                setSelectedBaggage([]);
              }}
              onContinue={(baggage) => {
                setSelectedBaggage(baggage);
                setCurrentStep('passenger-info');
              }}
            />
          )}

          {/* Passenger Information Step (only for flights) */}
          {currentStep === 'passenger-info' && selectedItem && selectedTab === 'FLIGHT' && (
            <PassengerInfo
              flight={selectedItem}
              onBack={() => {
                setCurrentStep('customize-baggage');
                setPassengerDetails([]);
              }}
              onContinue={(passengers) => {
                setPassengerDetails(passengers);
                setCurrentStep('confirm');
              }}
            />
          )}
        </div>

        {/* Footer */}
        {selectedItem && (
          (selectedTab === 'FLIGHT' && currentStep === 'confirm') ||
          (selectedTab !== 'FLIGHT' && currentStep === 'search')
        ) && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected</p>
                <p className="font-semibold text-gray-900">
                  {selectedItem.name ||
                   (typeof selectedItem.airline === 'object' ? selectedItem.airline?.name : selectedItem.airline) ||
                   selectedItem.title || 'Item'}
                </p>
                <p className="text-lg font-bold text-orange-600 mt-1">
                  {selectedItem.price?.currency || selectedItem.price?.currencyCode || 'USD'}{' '}
                  {typeof selectedItem.price === 'object'
                    ? (selectedItem.price?.total || selectedItem.price?.amount || selectedItem.price?.base || '0')
                    : (selectedItem.price || '0')
                  }
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToItinerary}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add to Itinerary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddItemModalV2;
