// The voice of the words: a tiny sound as letters land, made with the Web
// Audio API (nothing to download). Each theme has its own, and each speaker
// is pitched by their name, so two people never sound alike:
//   quill   oldgold       a nib's dry tick on parchment, a soft knock under it
//   pulse   blackpanther  a deep synth thrum, a click of static
//   breath  whiteheaven   a whisper of air
//   chip    oldrpg        the old square-wave blip
// None of them rings: no bells, no chimes - short and low, so a long line
// never grates.

const MIN_GAP_MS = 48        // at most ~20 a second, however fast the text

export function createVoice(){
    let ctx = null
    let noise = null
    let kind = "quill"
    let pitch = 1
    let volume = 0.5
    let enabled = true
    let last = 0

    function audio(){
        if(ctx) return ctx
        const AC = globalThis.AudioContext || globalThis.webkitAudioContext
        if(!AC) return null
        try { ctx = new AC() } catch(error){ return null }
        // a second of white noise, made once
        noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
        const data = noise.getChannelData(0)
        for(let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
        return ctx
    }

    return {
        setKind(next){ if(SOUNDS[next]) kind = next },
        /** Pitches the voice by the speaker's name (the same name, the same voice). */
        setSpeaker(name){ pitch = pitchOf(name) },
        setVolume(next){ volume = Math.max(0, Math.min(1, Number(next) || 0)) },
        setEnabled(next){ enabled = !!next },
        blip(){
            if(!enabled || volume <= 0) return
            const now = performance.now()
            if(now - last < MIN_GAP_MS) return
            last = now
            const c = audio()
            if(!c) return
            if(c.state === "suspended") c.resume().catch(() => {})
            if(c.state !== "running") return
            try {
                SOUNDS[kind](c, noise, pitch * (0.95 + Math.random() * 0.1), volume)
            } catch(error){}
        },
        close(){
            try { ctx?.close() } catch(error){}
            ctx = null
        },
    }
}

// 0.84 - 1.2 from the name's letters
function pitchOf(name){
    const text = String(name ?? "")
    let hash = 0
    for(let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0
    return 0.84 + (hash % 1000) / 1000 * 0.36
}

function envelope(c, at, peak, attack, decay){
    const gain = c.createGain()
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay)
    return gain
}
function noiseBurst(c, noise, at, seconds){
    const source = c.createBufferSource()
    source.buffer = noise
    source.start(at, Math.random() * 0.8, seconds)
    return source
}
function tone(c, type, frequency, at, seconds){
    const osc = c.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, at)
    osc.start(at)
    osc.stop(at + seconds)
    return osc
}

const SOUNDS = {
    quill(c, noise, pitch, volume){
        const at = c.currentTime
        const band = c.createBiquadFilter()
        band.type = "bandpass"
        band.frequency.value = 1500 * pitch
        band.Q.value = 2.5
        const tick = envelope(c, at, 0.22 * volume, 0.002, 0.03)
        noiseBurst(c, noise, at, 0.05).connect(band).connect(tick).connect(c.destination)
        const knock = envelope(c, at, 0.1 * volume, 0.003, 0.05)
        tone(c, "sine", 165 * pitch, at, 0.07).connect(knock).connect(c.destination)
    },
    pulse(c, noise, pitch, volume){
        const at = c.currentTime
        const osc = tone(c, "triangle", 110 * pitch, at, 0.08)
        osc.frequency.exponentialRampToValueAtTime(68 * pitch, at + 0.06)
        const low = c.createBiquadFilter()
        low.type = "lowpass"
        low.frequency.value = 900
        const thrum = envelope(c, at, 0.2 * volume, 0.004, 0.06)
        osc.connect(low).connect(thrum).connect(c.destination)
        const high = c.createBiquadFilter()
        high.type = "highpass"
        high.frequency.value = 3500
        const click = envelope(c, at, 0.05 * volume, 0.001, 0.012)
        noiseBurst(c, noise, at, 0.02).connect(high).connect(click).connect(c.destination)
    },
    breath(c, noise, pitch, volume){
        const at = c.currentTime
        const band = c.createBiquadFilter()
        band.type = "bandpass"
        band.frequency.value = 2400 * pitch
        band.Q.value = 0.9
        const air = envelope(c, at, 0.12 * volume, 0.012, 0.06)
        noiseBurst(c, noise, at, 0.09).connect(band).connect(air).connect(c.destination)
    },
    chip(c, noise, pitch, volume){
        const at = c.currentTime
        const low = c.createBiquadFilter()
        low.type = "lowpass"
        low.frequency.value = 2600
        const blip = envelope(c, at, 0.07 * volume, 0.002, 0.035)
        tone(c, "square", 220 * pitch, at, 0.045).connect(low).connect(blip).connect(c.destination)
    },
}
