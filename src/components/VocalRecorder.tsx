import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { useStore } from '../store';
import type { VocalType } from '../types';

interface VocalRecorderProps {
  trackId: string;
  onClose: () => void;
}

const VOCAL_TYPES: { value: VocalType; label: string; color: string }[] = [
  { value: 'topline', label: 'Topline', color: 'bg-purple-500/80 border-purple-400' },
  { value: 'yaourt', label: 'Yaourt', color: 'bg-pink-500/80 border-pink-400' },
  { value: 'couplet', label: 'Couplet', color: 'bg-blue-500/80 border-blue-400' },
  { value: 'refrain', label: 'Refrain', color: 'bg-emerald-500/80 border-emerald-400' },
  { value: 'test', label: 'Test', color: 'bg-amber-500/80 border-amber-400' },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function VocalRecorder({ trackId, onClose }: VocalRecorderProps) {
  const { state, dispatch } = useStore();

  const [vocalType, setVocalType] = useState<VocalType>('topline');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // ---- Waveform drawing ----
  const drawWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const barCount = 64;
    const step = Math.floor(bufferLength / barCount);
    const barWidth = width / barCount - 2;
    const goldColor = '#D4A843';

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step];
      const barHeight = (value / 255) * height * 0.85;
      const x = i * (barWidth + 2);
      const y = height - barHeight;

      ctx.fillStyle = goldColor;
      ctx.globalAlpha = 0.6 + (value / 255) * 0.4;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  // ---- Idle waveform (flat line) ----
  const drawIdleWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const barCount = 64;
    const barWidth = width / barCount - 2;
    const goldColor = '#D4A843';

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + 2);
      ctx.fillStyle = goldColor;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.roundRect(x, height - 4, barWidth, 4, 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, []);

  // ---- Draw idle waveform on mount ----
  useEffect(() => {
    if (!isRecording && !recordedBlob) {
      drawIdleWaveform();
    }
  }, [isRecording, recordedBlob, drawIdleWaveform]);

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
    };
  }, []);

  // ---- Start recording ----
  const startRecording = async () => {
    setError(null);
    setRecordedBlob(null);
    setElapsedSec(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio context + analyser for waveform
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blobType = mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        setRecordedBlob(blob);

        // Stop waveform animation
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };

      recorder.start(250);
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);

      // Timer
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);

      // Start waveform
      drawWaveform();
    } catch (err: unknown) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone refus\u00e9. Autorise l\u2019acc\u00e8s au micro dans les r\u00e9glages de ton navigateur.'
          : 'Impossible d\u2019acc\u00e9der au microphone. V\u00e9rifie tes permissions.';
      setError(message);
    }
  };

  // ---- Stop recording ----
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ---- Playback ----
  const playRecording = () => {
    if (!recordedBlob) return;

    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }

    const url = URL.createObjectURL(recordedBlob);
    const audio = new Audio(url);
    audioElRef.current = audio;
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
      audioElRef.current = null;
    };

    audio.play();
  };

  const stopPlayback = () => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    setIsPlaying(false);
  };

  // ---- Save ----
  const saveRecording = () => {
    if (!recordedBlob || !state.currentUser) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      dispatch({
        type: 'ADD_VOCAL',
        payload: {
          trackId,
          authorId: state.currentUser!.id,
          type: vocalType,
          dataUrl,
          durationSec: elapsedSec,
        },
      });
      onClose();
    };
    reader.readAsDataURL(recordedBlob);
  };

  // ---- Discard ----
  const discardRecording = () => {
    stopPlayback();
    setRecordedBlob(null);
    setElapsedSec(0);
    drawIdleWaveform();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Enregistrer un vocal" width="max-w-md">
      <div className="flex flex-col gap-5">
        {/* ---- Type selector ---- */}
        <div>
          <label className="block text-xs text-txt3 mb-2 uppercase tracking-wider">Type de vocal</label>
          <div className="flex flex-wrap gap-2">
            {VOCAL_TYPES.map((vt) => (
              <button
                key={vt.value}
                onClick={() => setVocalType(vt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  vocalType === vt.value
                    ? `${vt.color} text-white shadow-lg scale-105`
                    : 'bg-white/5 border-white/10 text-txt2 hover:bg-white/10'
                }`}
              >
                {vt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Waveform visualizer ---- */}
        <div className="relative rounded-xl bg-black/20 border border-white/5 p-3">
          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            className="w-full h-[100px] rounded-lg"
          />
          {isRecording && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Rec</span>
            </div>
          )}
        </div>

        {/* ---- Timer ---- */}
        <div className="text-center">
          <span
            className="text-3xl font-bold text-txt tabular-nums"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatTime(elapsedSec)}
          </span>
        </div>

        {/* ---- Error message ---- */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ---- Controls ---- */}
        <div className="flex items-center justify-center gap-4">
          {/* Record button */}
          {!isRecording && !recordedBlob && (
            <button
              onClick={startRecording}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95"
              title="Enregistrer"
            >
              <span className="w-5 h-5 rounded-full bg-white" />
            </button>
          )}

          {/* Stop button (during recording) */}
          {isRecording && (
            <button
              onClick={stopRecording}
              className="w-14 h-14 rounded-full bg-red-500 animate-pulse flex items-center justify-center transition-all shadow-lg shadow-red-500/30"
              title="Arr\u00eater"
            >
              <span className="w-5 h-5 rounded-sm bg-white" />
            </button>
          )}

          {/* After recording: Play / Save / Delete */}
          {recordedBlob && !isRecording && (
            <>
              {/* Play / Stop playback */}
              {!isPlaying ? (
                <button
                  onClick={playRecording}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all"
                  title="\u00c9couter"
                >
                  <svg className="w-5 h-5 text-txt ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={stopPlayback}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all"
                  title="Pause"
                >
                  <svg className="w-5 h-5 text-txt" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 5h3v10H6V5zm5 0h3v10h-3V5z" />
                  </svg>
                </button>
              )}

              {/* Save */}
              <button
                onClick={saveRecording}
                className="w-12 h-12 rounded-full bg-emerald-500/80 hover:bg-emerald-500 flex items-center justify-center transition-all shadow-lg hover:shadow-emerald-500/30"
                title="Sauvegarder"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>

              {/* Discard */}
              <button
                onClick={discardRecording}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 flex items-center justify-center transition-all"
                title="Supprimer"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* ---- Cancel button ---- */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-txt3 hover:text-txt transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </Modal>
  );
}
