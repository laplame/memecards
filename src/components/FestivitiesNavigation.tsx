import { useState } from 'react';
import { Heart, Cake, Users, GraduationCap, UserCircle, Snowflake, ChevronDown } from 'lucide-react';

export type FestivityType = 
  | 'valentine' 
  | 'mothers-day' 
  | 'birthday' 
  | 'fathers-day' 
  | 'teachers-day' 
  | 'grandparents-day' 
  | 'christmas';

interface Festivity {
  id: FestivityType;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const festivities: Festivity[] = [
  {
    id: 'valentine',
    name: 'San Valentín',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    id: 'mothers-day',
    name: 'Día de la Madre',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    id: 'birthday',
    name: 'Cumpleaños',
    icon: <Cake className="w-5 h-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'fathers-day',
    name: 'Día del Padre',
    icon: <UserCircle className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'teachers-day',
    name: 'Día del Maestro',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'grandparents-day',
    name: 'Día del Abuelo',
    icon: <Users className="w-5 h-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    id: 'christmas',
    name: 'Navidad',
    icon: <Snowflake className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
];

interface FestivitiesNavigationProps {
  selectedFestivity?: FestivityType;
  onFestivityChange?: (festivity: FestivityType) => void;
}

export function FestivitiesNavigation({ 
  selectedFestivity = 'valentine',
  onFestivityChange 
}: FestivitiesNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedFestivityData = festivities.find(f => f.id === selectedFestivity) || festivities[0];

  const handleSelect = (festivity: FestivityType) => {
    onFestivityChange?.(festivity);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-center space-x-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-2 border border-white/20">
        {festivities.map((festivity) => (
          <button
            key={festivity.id}
            onClick={() => handleSelect(festivity.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              selectedFestivity === festivity.id
                ? `${festivity.bgColor} ${festivity.color} shadow-md transform scale-105`
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className={selectedFestivity === festivity.id ? festivity.color : 'text-gray-500'}>
              {festivity.icon}
            </span>
            <span className="font-medium text-sm">{festivity.name}</span>
          </button>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20"
        >
          <div className="flex items-center space-x-3">
            <div className={`${selectedFestivityData.bgColor} p-2 rounded-lg`}>
              <span className={selectedFestivityData.color}>
                {selectedFestivityData.icon}
              </span>
            </div>
            <span className="font-medium text-gray-800">{selectedFestivityData.name}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            {festivities.map((festivity) => (
              <button
                key={festivity.id}
                onClick={() => handleSelect(festivity.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 transition-all ${
                  selectedFestivity === festivity.id
                    ? `${festivity.bgColor} ${festivity.color}`
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`${festivity.bgColor} p-2 rounded-lg`}>
                  <span className={festivity.color}>
                    {festivity.icon}
                  </span>
                </div>
                <span className="font-medium">{festivity.name}</span>
                {selectedFestivity === festivity.id && (
                  <span className="ml-auto text-xs bg-white px-2 py-1 rounded-full">Seleccionado</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
