import React, { useState, useRef, useEffect } from 'react';
import { MdArrowForward, MdStop } from 'react-icons/md';

const RecordedPart = () => {
  const [videoStream, setVideoStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [videoRecorder, setVideoRecorder] = useState(null);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordedVideoChunks, setRecordedVideoChunks] = useState([]);
  const [recordedAudioChunks, setRecordedAudioChunks] = useState([]);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isCameraEnable, setIsCameraEnable] = useState(false);
  const [isMicrophoneEnable, setIsMicrophoneEnable] = useState(false);

 const getMediaPermission = async (type) => {
  try {
    const newStream = await navigator.mediaDevices.getUserMedia({ [type]: true });

    if (type === 'video') {
      if (audioStream) {
        const audioTrack = audioStream.getAudioTracks()[0];
        newStream.addTrack(audioTrack);
      }
      setVideoStream(newStream);
      createMediaRecorder('video');
    } else if (type === 'audio') {
      if (videoStream) {
        const videoTrack = videoStream.getVideoTracks()[0];
        newStream.addTrack(videoTrack);
      }
      setAudioStream(newStream);
      createMediaRecorder('audio');
    }

    console.log(`${type} permission granted.`);
  } catch (error) {
    console.error(`Error accessing ${type}:`, error);
  }
};


  const createMediaRecorder = (type) => {
    if (type === 'video') {
      const recorder = new MediaRecorder(videoStream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedVideoChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedVideoChunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        setIsRecordingVideo(false);
        setRecordedVideoChunks([]); // Clear recorded chunks after stopping
      };

      setVideoRecorder(recorder);
    } else if (type === 'audio') {
      const recorder = new MediaRecorder(audioStream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedAudioChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedAudioChunks, { type: 'audio/wav' }); // Adjust the audio type as needed
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url);
        setIsRecordingAudio(false);
        setRecordedAudioChunks([]); // Clear recorded chunks after stopping
      };

      setAudioRecorder(recorder);
    }
  };

  const startRecording = (type) => {
    if (type === 'video') {
      setRecordedVideoChunks([]);
      setIsRecordingVideo(true);
      videoRecorder.start();
      console.log('started video recording');
    } else if (type === 'audio') {
      setRecordedAudioChunks([]);
      setIsRecordingAudio(true);
      audioRecorder.start();
      console.log('started audio recording');
    }
  };

  const stopRecording = (type) => {
    if (type === 'video' && videoRecorder && videoRecorder.state === 'recording') {
      videoRecorder.stop();
      console.log('stopped video recording');
    } else if (type === 'audio' && audioRecorder && audioRecorder.state === 'recording') {
      audioRecorder.stop();
      console.log('stopped audio recording');
    }
  };

  const stopMedia = (type) => {
    if (type === 'video') {
      if (videoStream) {
        const videoTracks = videoStream.getTracks();
        videoTracks.forEach((track) => track.stop());
        setVideoStream(null);
        stopRecording('video');
      }
    } else if (type === 'audio') {
      if (audioStream) {
        const audioTracks = audioStream.getTracks();
        audioTracks.forEach((track) => track.stop());
        setAudioStream(null);
        stopRecording('audio');
      }
    }
  };

  const downloadRecordedVideo = () => {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = recordedVideo;
    a.download = 'recorded_video.mp4';
    a.click();
    window.open(recordedVideo, '_blank');
  };

  useEffect(() => {
    if (isCameraEnable) {
      getMediaPermission('video');
    } else {
      stopMedia('video');
    }
  }, [isCameraEnable]);

  useEffect(() => {
    if (isMicrophoneEnable) {
      getMediaPermission('audio');
    } else {
      stopMedia('audio');
    }
  }, [isMicrophoneEnable]);

  return (
    <div className="flex gap-6 w-full">
      <div className="flex flex-col">
        {/* Video element for live recording */}
        {isCameraEnable && (
          <video width="320" height="240" srcObject={videoStream} autoPlay muted></video>
        )}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => startRecording('video')}
            disabled={!isCameraEnable || (videoRecorder && videoRecorder.state !== 'inactive')}
            style={{
              backgroundColor: '#7D4996',
              color: '#FFFFFF',
              padding: '8px',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Start <MdArrowForward />
          </button>
          <button
            onClick={() => stopRecording('video')}
            disabled={!isRecordingVideo}
            style={{
              backgroundColor: '#7D4996',
              color: '#FFFFFF',
              padding: '8px',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Stop <MdStop />
          </button>
          {/* download button */}
          {recordedVideo && (
            <button
              onClick={downloadRecordedVideo}
              style={{
                backgroundColor: '#7D4996',
                color: '#FFFFFF',
                padding: '8px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Download <MdArrowForward />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        {/* Video element for playback after recording stops */}
        {recordedVideo && <video width="320" height="240" src={recordedVideo} controls></video>}
      </div>
    </div>
  );
};

export default RecordedPart;
