// Rooster crow audio utility
// This creates a simple beep sound as a placeholder for the rooster crow
// In production, replace with actual rooster crow MP3

let audioContext = null

export function playRoosterCrow() {
  try {
    // Create audio context on first user interaction (lazy initialization)
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    
    // Resume audio context if suspended (for autoplay policy compliance)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    // Create a series of tones to simulate a rooster crow
    const now = audioContext.currentTime
    
    // Create oscillator for the crow sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Rooster-like frequency pattern
    oscillator.frequency.setValueAtTime(800, now)
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1)
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.3)
    oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.5)
    
    // Volume envelope - using linearRampToValueAtTime for final ramp to avoid glitches
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.6)
    
    oscillator.start(now)
    oscillator.stop(now + 0.6)
    
    console.log('🐓 Rooster crow played!')
    return true
  } catch (error) {
    console.error('Failed to play rooster sound:', error)
    return false
  }
}
