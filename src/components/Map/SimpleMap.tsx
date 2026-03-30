import { MapPin, Navigation } from 'lucide-react';

type SimpleMapProps = {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  destinationLat: number;
  destinationLng: number;
  destinationAddress: string;
};

export default function SimpleMap({
  pickupLat,
  pickupLng,
  pickupAddress,
  destinationLat,
  destinationLng,
  destinationAddress,
}: SimpleMapProps) {
  const centerLat = (pickupLat + destinationLat) / 2;
  const centerLng = (pickupLng + destinationLng) / 2;

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden border-2 border-gray-200">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Map View</div>
          <div className="text-xs text-gray-500">
            Center: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-gray-800">Pickup</div>
            <div className="text-gray-600">{pickupAddress}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="w-4 h-4 text-red-600 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-gray-800">Destination</div>
            <div className="text-gray-600">{destinationAddress}</div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md px-3 py-2 text-xs text-gray-600">
        Route visualization
      </div>
    </div>
  );
}
