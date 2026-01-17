
import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  url: string;
  isPlaying: boolean;
  volume: number;
  onLoadingStatusChange?: (isLoading: boolean) => void;
  onError?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  url, 
  isPlaying, 
  volume, 
  onLoadingStatusChange,
  onError 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Small delay to ensure browser allows play after interaction
      const playAudio = async () => {
        try {
          if (audio.paused) {
            await audio.play();
          }
        } catch (error) {
          console.warn("Autoplay was prevented or resource missing. Waiting for user interaction or fix.");
          if (onError) onError();
        }
      };
      playAudio();
    } else {
      audio.pause();
    }
  }, [isPlaying, url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleCanPlay = () => {
    if (onLoadingStatusChange) onLoadingStatusChange(false);
  };

  const handleWaiting = () => {
    if (onLoadingStatusChange) onLoadingStatusChange(true);
  };

  const handleAudioError = () => {
    // If the file is missing, we still want the app to function visually
    console.error(`Audio Resource Not Found at: ${url}. App will remain silent.`);
    if (onError) onError();
    if (onLoadingStatusChange) onLoadingStatusChange(false);
  };

  return (
    <audio 
      ref={audioRef} 
      src={url}
      loop 
      preload="auto"
      onCanPlayThrough={handleCanPlay}
      onWaiting={handleWaiting}
      onError={handleAudioError}
      className="hidden"
    />
  );
};

export default AudioPlayer;