import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  url: string;
  isPlaying: boolean;
  volume: number; // 0 to 1
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, isPlaying, volume }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    
    // Handle Play/Pause
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Auto-play prevented:", error);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    // Handle Volume Fading smoothly
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Handle URL Change
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = url;
      audioRef.current.load();
      if (wasPlaying && isPlaying) {
         audioRef.current.play().catch(() => {});
      }
    }
  }, [url]);

  return (
    <audio 
      ref={audioRef} 
      loop 
      preload="auto"
      className="hidden"
    >
      <source src={url} type="audio/mpeg" />
      <source src={url} type="audio/ogg" />
    </audio>
  );
};

export default AudioPlayer;