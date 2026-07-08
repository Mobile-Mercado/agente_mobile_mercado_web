import { useRef, useState } from "react";

interface UseVoiceRecordingResult {
  gravando: boolean;
  transcrevendo: boolean;
  iniciarGravacao: () => Promise<void>;
  pararGravacao: () => void;
}

export function useVoiceRecording(setInputText: (text: string) => void): UseVoiceRecordingResult {
  const [gravando, setGravando] = useState(false);
  const [transcrevendo, setTranscrevendo] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const transcreverAudio = async (blob: Blob) => {
    setTranscrevendo(true);
    try {
      const file = new File([blob], 'audio.webm', { type: blob.type });
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/transcribe', { method: 'POST', body: form });
      const data = await res.json();
      if (data.text?.trim()) setInputText(data.text.trim());
    } catch (e) {
      console.error('Erro ao transcrever áudio:', e);
    } finally {
      setTranscrevendo(false);
    }
  };

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        transcreverAudio(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setGravando(true);
    } catch (e) {
      console.error('Erro ao acessar microfone:', e);
    }
  };

  const pararGravacao = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setGravando(false);
  };

  return { gravando, transcrevendo, iniciarGravacao, pararGravacao };
}
