import { WatchIcon } from "lucide-react";


const Maintenance = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 px-4 text-white relative overflow-hidden">
      {/* Floating Background Circles */}
      <div className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-blue-300 rounded-full opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-blue-200 rounded-full opacity-20 animate-pulse-slow"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Icon */}
        <div className="bg-white bg-opacity-20 rounded-full p-6 mb-6 shadow-lg animate-bounce">
          <WatchIcon className="w-14 h-14 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          We'll Be Back Soon
        </h1>

        {/* Message */}
        <p className="text-white/90 mb-6">
          Our system is currently undergoing scheduled maintenance.
          <br />
          We appreciate your patience and will be back online shortly!
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-white/90 transition duration-300"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default Maintenance;
