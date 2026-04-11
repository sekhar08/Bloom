'use client';

import MuxPlayer from '@mux/mux-player-react';

interface MuxPlayerWrapperProps {
    playbackId: string;
    title?: string;
}

const playerStyles = {
    '--controls-backdrop-color': 'rgba(24, 36, 52, 0.74)',
    '--controls-color': '#fdfaf3',
    '--seek-live-button': 'none',
} satisfies Record<`--${string}`, string>;

export default function MuxPlayerWrapper({ playbackId, title }: MuxPlayerWrapperProps) {
    return (
        <MuxPlayer
        playbackId={playbackId}
        metadata={{
            video_title: title || 'Screen Recording',
        }}
        streamType="on-demand"
        autoPlay={false}
        accentColor="#2c6a6b"
        style={playerStyles}
        />
    );
}
