import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-white py-6 border-t">
      {/* LOGOS */}
      <div className="flex justify-center gap-x-8 mb-4">
        <Image src="/images/logo1.png" alt="Logo 1" width={100} height={50} className="h-12 object-contain" />
        <Image src="/images/logo2.png" alt="Logo 2" width={100} height={50} className="h-12 object-contain" />
        <Image src="/images/logo3.png" alt="Logo 3" width={100} height={50} className="h-12 object-contain" />
        <Image src="/images/logo4.png" alt="Logo 4" width={100} height={50} className="h-12 object-contain" />
      </div>

      {/* COPYRIGHT */}
      <p className="text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} AI Expert. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
