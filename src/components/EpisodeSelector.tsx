import { Episode } from "@/lib/firebase";

interface EpisodeSelectorProps {
  episodes: Episode[];
  currentEpisode: number;
  onSelectEpisode: (episodeIndex: number) => void;
}

const EpisodeSelector = ({ episodes, currentEpisode, onSelectEpisode }: EpisodeSelectorProps) => {
  // Group episodes by season
  const seasons = episodes.reduce((acc, ep, index) => {
    const season = ep.season || 1;
    if (!acc[season]) acc[season] = [];
    acc[season].push({ ...ep, globalIndex: index });
    return acc;
  }, {} as Record<number, (Episode & { globalIndex: number })[]>);

  const seasonNumbers = Object.keys(seasons).map(Number).sort((a, b) => a - b);

  return (
    <div className="bg-card rounded-lg p-3 h-full max-h-[300px] overflow-y-auto">
      <h3 className="text-xs font-bold text-foreground mb-2">Episodes</h3>
      
      {seasonNumbers.map((seasonNum) => (
        <div key={seasonNum} className="mb-2">
          {seasonNumbers.length > 1 && (
            <p className="text-xs text-muted-foreground mb-1">Season {seasonNum}</p>
          )}
          <div className="grid grid-cols-5 md:grid-cols-4 gap-1.5">
            {seasons[seasonNum]
              .sort((a, b) => a.episodeNumber - b.episodeNumber)
              .map((ep) => (
                <button
                  key={ep.globalIndex}
                  onClick={() => onSelectEpisode(ep.globalIndex)}
                  className={`w-full h-9 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                    currentEpisode === ep.globalIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={ep.title || `Episode ${ep.episodeNumber}`}
                >
                  {ep.episodeNumber}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EpisodeSelector;
