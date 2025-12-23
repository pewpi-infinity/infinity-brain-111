# Infinity Autopilot Sound Repeater

## Overview

The Infinity Autopilot Sound Repeater is an autonomous audio analysis and synthesis system that listens to audio input through the microphone, detects the dominant frequencies, and automatically reproduces those sounds using a Web Audio synthesizer. Once started, the system runs continuously without human intervention.

## Features

### Core Functionality
- **Automatic Listening**: Continuously captures audio from the microphone
- **Real-time Frequency Detection**: Analyzes incoming audio to detect dominant frequencies using FFT (Fast Fourier Transform)
- **Synthesizer Reproduction**: Automatically reproduces detected sounds using Web Audio API oscillators
- **No Human Intervention**: Runs autonomously once activated - true autopilot mode

### Two Implementations

#### 1. Standalone Application (`infinity_autopilot_repeater.html`)
A full-featured standalone application with comprehensive controls and visualizations.

**Features:**
- Real-time waveform visualization
- Frequency spectrum display
- Adjustable sensitivity threshold (-100 to -10 dB)
- Volume control (0-100%)
- Response delay adjustment (0-500ms)
- Multiple waveform types (sine, triangle, square, sawtooth)
- Visual frequency display showing detected Hz
- Status indicators with animation

**Usage:**
1. Open `infinity_autopilot_repeater.html` in a modern web browser
2. Click "Start Autopilot" and grant microphone permissions
3. The system will begin listening and reproducing detected sounds
4. Adjust settings as needed while running
5. Click "Stop Autopilot" to terminate

#### 2. Integrated Portal Feature (`infinity_portal_v3_index.html`)
Integrated into the main Infinity Portal application as the "Autopilot Mic" feature.

**Features:**
- Simplified one-button activation
- Automatic frequency detection and synthesis
- Status indicator
- Integrated with Portal's tools ecosystem

**Usage:**
1. Open the Infinity Portal and navigate to the Portal node
2. Click the microphone icon (🎤) in the "Autopilot Mic" section
3. Grant microphone permissions when prompted
4. The autopilot will activate (icon changes to 🔴)
5. Click again to stop

## Technical Details

### Audio Processing Pipeline

```
Microphone Input 
    ↓
MediaStreamSource
    ↓
AnalyserNode (FFT)
    ↓
Frequency Detection Algorithm
    ↓
Dominant Frequency Extraction
    ↓
OscillatorNode (Synthesizer)
    ↓
GainNode (Volume Control)
    ↓
Audio Output
```

### Key Components

**AnalyserNode Configuration:**
- FFT Size: 2048
- Smoothing Time Constant: 0.8
- Provides frequency and time domain data

**Pitch Detection:**
- Analyzes FFT frequency bins
- Finds maximum amplitude bin
- Converts to frequency using sample rate
- Filters frequencies: 50Hz - 4000Hz (human voice/music range)
- Threshold: Configurable dB level (default: -60dB)

**Synthesizer:**
- Uses OscillatorNode for sound generation
- Smooth frequency transitions with `setTargetAtTime()`
- Configurable waveform types
- Volume controlled via GainNode

### Browser Compatibility

Requires a modern browser with support for:
- Web Audio API
- MediaDevices API (getUserMedia)
- AudioContext
- AnalyserNode
- OscillatorNode

**Tested Browsers:**
- Chrome/Edge 89+
- Firefox 88+
- Safari 14+

## Configuration Options

### Standalone App Settings

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Sensitivity | -100 to -10 dB | -60 dB | Minimum signal strength to trigger synthesis |
| Volume | 0-100% | 50% | Output volume of synthesizer |
| Response Delay | 0-500ms | 100ms | Delay between frequency updates |
| Waveform | sine/triangle/square/sawtooth | sine | Oscillator waveform type |

### Portal Integration

The portal integration uses optimized defaults:
- Sensitivity: -60 dB
- Volume: 30%
- Response Delay: ~50ms (via setTargetAtTime)
- Waveform: Sine wave

## Use Cases

1. **Audio Feedback Testing**: Test room acoustics and feedback loops
2. **Pitch Training**: Practice matching pitches with instant synthesis
3. **Musical Experimentation**: Create unique soundscapes from environmental sounds
4. **Accessibility**: Audio-to-audio conversion for various applications
5. **Scientific Demonstrations**: Visualize sound frequencies in real-time

## Security & Privacy

- **No Data Storage**: Audio is processed in real-time and not recorded or stored
- **Client-Side Only**: All processing happens in the browser - no server communication
- **Microphone Permissions**: Requires user consent for microphone access
- **Local Execution**: Works completely offline after page load

## Troubleshooting

**Microphone not working:**
- Check browser permissions for microphone access
- Ensure no other application is using the microphone
- Try refreshing the page and granting permissions again

**No sound output:**
- Check system volume and browser volume settings
- Increase the synthesizer volume setting
- Lower the sensitivity threshold
- Ensure sound input is strong enough (speak/play louder)

**Frequency detection issues:**
- Adjust sensitivity threshold
- Check that input frequency is in 50-4000 Hz range
- Reduce background noise
- Increase response delay for more stable detection

## Future Enhancements

Potential improvements for future versions:
- Multi-frequency detection and chord synthesis
- Audio effects (reverb, delay, distortion)
- Recording and playback capabilities
- MIDI output support
- Machine learning-based sound recognition
- Preset saving and loading

## License

Part of the Infinity Portal project.

## Contact

For questions or support: infinitystockinvesting@gmail.com
