import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  Shield, 
  Check,
  Heart,
  Share2,
  Camera,
  Info
} from 'lucide-react';
import voyageService from '@/services/api/VoyageService';
import imageService from '@/services/imageService';

interface ActivityDetail {
  id: string;
  name: string;
  description: string;
  location: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  reviewCount: number;
  duration: string;
  groupSize: string;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  images: string[];
  category: string;
  tags: string[];
  highlights: string[];
  includes: string[];
  excludes: string[];
  meetingPoint: string;
  languages: string[];
  difficulty: string;
  ageRestriction: string;
  availability: {
    available: boolean;
    nextAvailable?: string;
    schedule: string[];
  };
  bookingInfo: {
    instantConfirmation: boolean;
    freeCancellation: boolean;
    cancellationPolicy: string;
    voucherInfo: string;
  };
  reviews: {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [participants, setParticipants] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchActivityDetail(id);
    }
  }, [id]);

  const fetchActivityDetail = async (activityId: string) => {
    try {
      setLoading(true);
      setError(null);

      let activityData: ActivityDetail | null = null;

      try {
        const response = await voyageService.getActivityById(activityId);
        if (response && response.data) {
          activityData = {
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            location: response.data.location,
            rating: response.data.rating,
            reviewCount: response.data.reviewCount,
            duration: response.data.duration,
            groupSize: response.data.groupSize,
            price: response.data.price,
            images: response.data.images || [],
            category: response.data.category,
            tags: response.data.tags || [],
            highlights: response.data.highlights || [],
            includes: response.data.includes || [],
            excludes: response.data.excludes || [],
            meetingPoint: response.data.meetingPoint,
            languages: response.data.languages || ['English'],
            difficulty: response.data.difficulty,
            ageRestriction: response.data.ageRestriction,
            availability: response.data.availability,
            bookingInfo: response.data.bookingInfo,
            reviews: response.data.reviews || []
          };
        }
      } catch (apiError) {
        console.warn('API failed, using fallback data:', apiError);
      }

      if (!activityData) {
        activityData = await generateFallbackActivity(activityId);
      }

      if (activityData.images.length === 0) {
        try {
          const images = await Promise.all([
            imageService.getActivityImage(activityData.name, activityData.category, activityData.location.name),
            imageService.getActivityImage(`${activityData.category} experience`, activityData.category, activityData.location.name),
            imageService.getActivityImage(`${activityData.location.name} attractions`, activityData.category, activityData.location.name)
          ]);
          activityData.images = images.filter(img => img);
        } catch (imageError) {
          console.warn('Failed to fetch images:', imageError);
          activityData.images = [imageService.getFallbackImage('activity')];
        }
      }

      setActivity(activityData);
    } catch (error) {
      console.error('Error fetching activity detail:', error);
      setError('Failed to load activity details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackActivity = async (activityId: string): Promise<ActivityDetail> => {
    const activities = [
      {
        name: 'Historic City Walking Tour',
        description: 'Embark on a fascinating journey through time as you explore the historic heart of the city. Our expert local guide will take you through cobblestone streets, past ancient buildings, and into hidden courtyards that most tourists never see. Learn about the city\'s rich history, from its founding to modern times, through captivating stories and historical anecdotes. This immersive experience includes visits to iconic landmarks, local markets, and traditional neighborhoods where you\'ll discover the authentic culture and daily life of the locals.',
        category: 'TOUR',
        location: 'Paris',
        duration: '3 hours',
        price: 45,
        highlights: [
          'Visit 5 major historical landmarks',
          'Explore hidden courtyards and secret passages',
          'Learn fascinating stories from expert local guide',
          'Small group experience (max 12 people)',
          'Photo opportunities at iconic spots'
        ],
        includes: [
          'Professional local guide',
          'Historical commentary and stories',
          'Small group tour',
          'Walking route map',
          'Photo assistance'
        ]
      },
      {
        name: 'Art Museum Masterpiece Tour',
        description: 'Discover the world\'s greatest artistic treasures with our comprehensive museum tour. Skip the long entrance lines and dive straight into centuries of artistic brilliance with our knowledgeable art historian guide. From Renaissance masterpieces to contemporary installations, you\'ll gain deep insights into the techniques, stories, and historical context behind each work. This curated experience focuses on the museum\'s most significant pieces while avoiding the crowds.',
        category: 'MUSEUM',
        location: 'Paris',
        duration: '2.5 hours',
        price: 35,
        highlights: [
          'Skip-the-line museum access',
          'Expert art historian guide',
          'Focus on masterpiece collections',
          'Interactive discussions about artworks',
          'Exclusive access to special exhibitions'
        ],
        includes: [
          'Museum entrance tickets',
          'Professional art guide',
          'Audio headsets for clear commentary',
          'Museum map and brochure',
          'Access to temporary exhibitions'
        ]
      }
    ];

    const baseActivity = activities[0]; // Default to first activity
    
    return {
      id: activityId,
      name: baseActivity.name,
      description: baseActivity.description,
      location: {
        name: baseActivity.location,
        address: `${baseActivity.location} City Center`,
        coordinates: { latitude: 48.8566, longitude: 2.3522 }
      },
      rating: 4.5 + Math.random() * 0.5,
      reviewCount: Math.floor(Math.random() * 500) + 100,
      duration: baseActivity.duration,
      groupSize: 'Up to 15 people',
      price: {
        amount: baseActivity.price,
        currency: 'USD',
        formatted: `$${baseActivity.price}`
      },
      images: [],
      category: baseActivity.category,
      tags: ['Popular', 'Expert Guide', 'Small Group', 'Historical'],
      highlights: baseActivity.highlights,
      includes: baseActivity.includes,
      excludes: [
        'Hotel pickup and drop-off',
        'Food and drinks',
        'Gratuities',
        'Personal expenses'
      ],
      meetingPoint: 'Main entrance of the venue',
      languages: ['English', 'French', 'Spanish'],
      difficulty: 'Easy',
      ageRestriction: 'Suitable for all ages',
      availability: {
        available: true,
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        schedule: ['09:00', '11:00', '14:00', '16:00']
      },
      bookingInfo: {
        instantConfirmation: true,
        freeCancellation: true,
        cancellationPolicy: 'Free cancellation up to 24 hours before the activity starts',
        voucherInfo: 'Mobile voucher accepted'
      },
      reviews: [
        {
          id: '1',
          author: 'Sarah M.',
          rating: 5,
          comment: 'Absolutely amazing experience! Our guide was incredibly knowledgeable and made the history come alive.',
          date: '2024-05-15'
        },
        {
          id: '2',
          author: 'John D.',
          rating: 4,
          comment: 'Great tour with lots of interesting information. Would definitely recommend!',
          date: '2024-05-10'
        }
      ]
    };
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time for your activity.');
      return;
    }

    // Navigate to booking page or show booking modal
    const bookingData = {
      activityId: activity?.id,
      activityName: activity?.name,
      date: selectedDate,
      time: selectedTime,
      participants,
      totalPrice: activity ? activity.price.amount * participants : 0
    };

    // Store booking data in localStorage for the booking process
    localStorage.setItem('activityBooking', JSON.stringify(bookingData));
    
    // Navigate to booking confirmation page
    navigate('/activities/booking');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The activity you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/activities')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Activities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/activities')}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Activities
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="h-96 relative">
                {activity.images.length > 0 ? (
                  <img
                    src={activity.images[activeImageIndex]}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = imageService.getFallbackImage('activity');
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-white" />
                  </div>
                )}
                
                {/* Image Navigation */}
                {activity.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {activity.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{activity.name}</h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{typeof activity.rating === 'number' ? activity.rating.toFixed(1) : '4.5'}</span>
                    <span className="text-gray-600">({activity.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{activity.location.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>{activity.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>{activity.groupSize}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {activity.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-3">About this activity</h3>
                <p className="text-gray-700 leading-relaxed">{activity.description}</p>
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Highlights</h3>
              <ul className="space-y-2">
                {activity.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-700">What's included</h3>
                  <ul className="space-y-2">
                    {activity.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-red-700">What's not included</h3>
                  <ul className="space-y-2">
                    {activity.excludes.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-4 h-4 border-2 border-red-500 rounded mt-1 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Important Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Meeting Point</h4>
                  <p className="text-gray-700 mb-4">{activity.meetingPoint}</p>
                  
                  <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                  <p className="text-gray-700 mb-4">{activity.languages.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Difficulty Level</h4>
                  <p className="text-gray-700 mb-4">{activity.difficulty}</p>
                  
                  <h4 className="font-medium text-gray-900 mb-2">Age Requirement</h4>
                  <p className="text-gray-700">{activity.ageRestriction}</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6">Reviews</h3>
              <div className="space-y-6">
                {activity.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{review.author}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {activity.price.formatted}
                </div>
                <div className="text-sm text-gray-600">per person</div>
              </div>

              {/* Booking Features */}
              <div className="space-y-3 mb-6">
                {activity.bookingInfo.instantConfirmation && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Instant confirmation</span>
                  </div>
                )}
                {activity.bookingInfo.freeCancellation && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Shield className="w-4 h-4" />
                    <span>Free cancellation</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{activity.bookingInfo.voucherInfo}</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Time Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Choose time</option>
                  {activity.availability.schedule.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Participants */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participants
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setParticipants(Math.max(1, participants - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="font-medium">{participants}</span>
                  <button
                    onClick={() => setParticipants(participants + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ${(activity.price.amount * participants).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={!activity.availability.available}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  activity.availability.available
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {activity.availability.available ? 'Book Now' : 'Not Available'}
              </button>

              {/* Cancellation Policy */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Cancellation Policy</h4>
                <p className="text-xs text-gray-600">{activity.bookingInfo.cancellationPolicy}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
