import React from 'react';
import { Clock, Info } from 'lucide-react';

interface PostingTimeHeatmapProps {
  filters: any;
}

const PostingTimeHeatmap: React.FC<PostingTimeHeatmapProps> = ({ filters }) => {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const hours = ['6', '9', '12', '15', '18', '21'];

  // Mock heatmap data (0-100 performance score)
  const heatmapData: Record<string, Record<string, number>> = {
    'Mo': { '6': 20, '9': 45, '12': 35, '15': 55, '18': 75, '21': 40 },
    'Di': { '6': 15, '9': 65, '12': 45, '15': 70, '18': 60, '21': 35 },
    'Mi': { '6': 25, '9': 50, '12': 80, '15': 65, '18': 85, '21': 45 },
    'Do': { '6': 30, '9': 55, '12': 60, '15': 75, '18': 70, '21': 50 },
    'Fr': { '6': 20, '9': 40, '12': 55, '15': 85, '18': 95, '21': 65 },
    'Sa': { '6': 35, '9': 25, '12': 40, '15': 60, '18': 80, '21': 70 },
    'So': { '6': 40, '9': 30, '12': 45, '15': 55, '18': 75, '21': 85 }
  };

  const getHeatmapColor = (score: number) => {
    if (score >= 80) return 'bg-[#49D69E]'; // Sehr gut
    if (score >= 60) return 'bg-[#B4E8E5]'; // Gut
    if (score >= 40) return 'bg-[#B6EBF7]'; // Mittel
    if (score >= 20) return 'bg-[#F4BE9D]'; // Schwach
    return 'bg-[#B6EBF7]/20'; // Sehr schwach
  };

  const getHeatmapIntensity = (score: number) => {
    return Math.max(0.2, score / 100);
  };

  const getBestTime = () => {
    let bestScore = 0;
    let bestDay = '';
    let bestHour = '';

    Object.entries(heatmapData).forEach(([day, hours]) => {
      Object.entries(hours).forEach(([hour, score]) => {
        if (score > bestScore) {
          bestScore = score;
          bestDay = day;
          bestHour = hour;
        }
      });
    });

    return { day: bestDay, hour: bestHour, score: bestScore };
  };

  const bestTime = getBestTime();

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#111111] flex items-center space-x-2">
          <Clock className="w-5 h-5 text-[#49B7E3]" />
          <span>Beste Posting-Zeiten</span>
        </h3>
        <div className="flex items-center space-x-2 text-sm text-[#7A7A7A]">
          <Info className="w-4 h-4" />
          <span>Basierend auf Engagement-Rate</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-6">
        <div className="grid grid-cols-8 gap-1">
          {/* Header Row */}
          <div></div>
          {hours.map(hour => (
            <div key={hour} className="text-center text-xs text-[#7A7A7A] font-medium p-2">
              {hour}:00
            </div>
          ))}

          {/* Data Rows */}
          {days.map(day => (
            <React.Fragment key={day}>
              <div className="text-xs text-[#7A7A7A] font-medium p-2 flex items-center">
                {day}
              </div>
              {hours.map(hour => {
                const score = heatmapData[day][hour];
                const isBestTime = day === bestTime.day && hour === bestTime.hour;
                
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`aspect-square rounded-[var(--vektrus-radius-sm)] ${getHeatmapColor(score)} relative cursor-pointer hover:scale-110 transition-all duration-200 group ${
                      isBestTime ? 'ring-2 ring-[#49D69E] ring-offset-1' : ''
                    }`}
                    style={{ opacity: getHeatmapIntensity(score) }}
                    title={`${day} ${hour}:00 - Performance: ${score}%`}
                  >
                    {isBestTime && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#49D69E] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">★</span>
                      </div>
                    )}
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded-[var(--vektrus-radius-sm)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {day} {hour}:00 - {score}% Performance
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-[#7A7A7A]">Performance:</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#B6EBF7]/20 rounded"></div>
              <span className="text-xs text-[#7A7A7A]">Schwach</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#F4BE9D] rounded"></div>
              <span className="text-xs text-[#7A7A7A]">Mittel</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#B6EBF7] rounded"></div>
              <span className="text-xs text-[#7A7A7A]">Gut</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#49D69E] rounded"></div>
              <span className="text-xs text-[#7A7A7A]">Sehr gut</span>
            </div>
          </div>
          
          <div className="text-xs text-[#7A7A7A]">
            ★ = Beste Zeit
          </div>
        </div>
      </div>

      {/* Best Time Highlight */}
      <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] p-4 border border-[#B6EBF7]">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-[#111111] mb-1">🎯 Deine optimale Posting-Zeit</h4>
            <p className="text-sm text-[#7A7A7A]">
              {bestTime.day === 'Mo' ? 'Montags' :
               bestTime.day === 'Di' ? 'Dienstags' :
               bestTime.day === 'Mi' ? 'Mittwochs' :
               bestTime.day === 'Do' ? 'Donnerstags' :
               bestTime.day === 'Fr' ? 'Freitags' :
               bestTime.day === 'Sa' ? 'Samstags' : 'Sonntags'} um {bestTime.hour}:00 Uhr
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#49D69E]">{bestTime.score}%</div>
            <div className="text-xs text-[#7A7A7A]">Performance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostingTimeHeatmap;