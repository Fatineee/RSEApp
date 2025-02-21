import Image from 'next/image';

interface NewsCardProps {
  image: string;
  title: string;
  source: string;
  date: string;
}

const NewsCard = ({ image, title, source, date }: NewsCardProps) => {
  return (
    <div className="group cursor-pointer border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <Image
          src={image}
          alt={title}
          width={400} 
          height={192} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy" 
        />
      </div>

      <div className="space-y-2">
        {/* Source */}
        <p className="text-blue-600 text-sm font-semibold">{source}</p>

        {/* Title */}
        <h3 className="text-gray-800 font-medium leading-snug group-hover:text-purple-600">
          {title}
        </h3>

        {/* Date */}
        <p className="text-gray-500 text-xs">{date}</p>
      </div>
    </div>
  );
};

export default NewsCard;
