// src/components/ui/NewsCard.tsx
interface NewsCardProps {
    image: string;
    title: string;
    category: string;
  }
  
  const NewsCard = ({ image, title }: NewsCardProps) => {
    return (
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <h3 className="text-gray-800 font-medium leading-snug mb-2 group-hover:text-purple-600">
          {title}
        </h3>
      </div>
    );
  };
  
  export default NewsCard;