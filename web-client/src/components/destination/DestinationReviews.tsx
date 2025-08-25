import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';

interface DestinationReviewsProps {
  destinationId: string;
}

const DestinationReviews: React.FC<DestinationReviewsProps> = ({ destinationId }) => {
  const reviews = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
        location: "New York, USA"
      },
      rating: 5,
      date: "February 2024",
      content: "An absolutely magical experience! The local guides were knowledgeable and friendly, and the views were breathtaking.",
      helpful: 24
    },
    {
      id: 2,
      user: {
        name: "Marco Rossi",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80",
        location: "Milan, Italy"
      },
      rating: 4,
      date: "January 2024",
      content: "Beautiful destination with amazing cultural experiences. The only minor issue was the weather, but that's beyond anyone's control.",
      helpful: 15
    }
  ];

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={review.user.image}
              alt={review.user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{review.user.name}</h4>
                  <p className="text-sm text-gray-500">{review.user.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-orange-400 text-orange-400" />
                  <span className="font-medium">{review.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{review.content}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{review.date}</span>
                <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DestinationReviews;