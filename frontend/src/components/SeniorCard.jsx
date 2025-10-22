import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const SeniorCard = ({ senior }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={i} className="text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FaStar key="half" className="text-yellow-400 opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={senior.profile?.profilePicture || '/default-avatar.png'}
          alt={senior.username}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {senior.profile?.firstName} {senior.profile?.lastName}
          </h3>
          <p className="text-sm text-gray-600">@{senior.username}</p>

          <div className="flex items-center mt-1">
            <div className="flex items-center">
              {renderStars(senior.averageRating || 0)}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              ({senior.reviewCount || 0} reviews)
            </span>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-700 line-clamp-2">
              {senior.seniorProfile?.bio || 'No bio available'}
            </p>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {senior.seniorProfile?.skills?.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {senior.seniorProfile?.skills?.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{senior.seniorProfile.skills.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <FaMapMarkerAlt className="inline mr-1" />
              {senior.profile?.location || 'Location not specified'}
            </div>

            <Link
              to={`/profile/${senior._id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorCard;