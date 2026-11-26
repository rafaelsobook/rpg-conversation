// rpg-convers 2 - an RPG conversation box. Lines are typed out letter by
// letter, each letter landing with its own little animation, pausing on the
// commas and the full stops the way a voice would; a speaker's name plate,
// an optional portrait, a voice that blips as the words come (pitched per
// speaker), a burst off the last letter, and a box that rises in and sinks
// away. Four themes (tools/themes.js), and any image behind the words.
//
//   import Conversation from "rpg-convers"
//   const conv = new Conversation(document, 30, "./images/frame.webp", "oldgold")
//   conv.startConversation([
//       { name: "Kraun", message: "Ah, a new face.", isLeft: false },
//       { name: "You",   message: "Who are you?",   isLeft: true, imageDirectory: "./me.webp" },
//   ], 0, () => console.log("over"))
//
// new Conversation(document, speed, background, theme, options)
//   speed       ms per letter (default 45)
//   background  an image laid behind the words (stretched to the box), or null
//   theme       "oldgold" | "blackpanther" | "whiteheaven" | "oldrpg"
//   options     anything in DEFAULTS below. The third argument may be the
//               options object itself: new Conversation(document, 30, { theme, background })

import { DEFAULT_THEME, THEMES, injectStyle, loadThemeFonts } from "./tools/themes.js"
import { createVoice } from "./tools/voice.js"

export { THEMES }

const DEFAULTS = {
    theme: DEFAULT_THEME,
    background: null,
    // how the background image covers the box (CSS background-size)
    backgroundSize: "100% 100%",
    // the typing voice (tools/voice.js)
    sound: true,
    volume: 0.5,
    // a tap anywhere on the box does what the button does
    clickToAdvance: true,
    // keys that do too, while it's open - e.g. ["Enter"]. None by default: a
    // game's keys (Space to jump...) are its own
    keys: [],
    // the theme's Google Fonts, put on the page when the theme is first used
    loadFonts: true,
    // the speaker's name plate
    showName: true,
    // the button's word when a line doesn't name one (btnName)
    buttonLabel: "Next",
    // CSS overrides: where it sits, how wide, and what it stays on top of
    bottom: null,
    width: null,
    zIndex: 900,
}

// how much longer the voice holds after these, in letters' worth - only where
// a phrase really ends (the letter after is a space, or there is none), so
// "3.5" and "..." mid-word don't stall
const PAUSES = { ",": 4, ";": 5, ":": 5, ".": 9, "!": 9, "?": 9, "\u2026": 9, "\u2014": 4 }
// a word in capitals this long or longer is shouted: it slams in
const LOUD_MIN = 3
const OPEN_DELAY_MS = 260
const LINE_SWAP_MS = 130
const CLOSE_MS = 420

export default class Conversation {
    constructor(doc, talkingSpeed, background, theme, options){
        if(background && typeof background === "object"){
            options = background
            background = undefined
        }
        const o = { ...DEFAULTS, ...(options || {}) }
        if(background != null) o.background = background
        if(theme) o.theme = theme

        this.document = doc || globalThis.document
        this.options = o
        this.intervalForMessage = Number(talkingSpeed) > 0 ? Number(talkingSpeed) : 45
        this.proceedToNext = () => {}
        this.closingTimeout = undefined
        this._run = 0
        this._typing = null
        this._isOpen = false

        injectStyle(this.document)
        this._build()
        this.voice = createVoice()
        this.voice.setEnabled(o.sound)
        this.voice.setVolume(o.volume)
        this.setTheme(o.theme)
        this.setBackground(o.background)
    }

    // ── setup ───────────────────────────────────────────────────────────

    _build(){
        const d = this.document
        const o = this.options
        const el = (tag, className, parent) => {
            const e = d.createElement(tag)
            if(className) e.className = className
            if(parent) parent.append(e)
            return e
        }
        const box = el("div", "rpgc rpgc-right")
        box.setAttribute("role", "group")
        box.setAttribute("aria-roledescription", "conversation")
        if(o.bottom) box.style.setProperty("--rpgc-bottom", o.bottom)
        if(o.width) box.style.setProperty("--rpgc-width", o.width)
        if(o.zIndex != null) box.style.setProperty("--rpgc-z", String(o.zIndex))

        const body = el("div", "rpgc-body", box)
        el("div", "rpgc-surface", body)
        const frame = el("div", "rpgc-frame", body)
        ;["tl", "tr", "bl", "br"].forEach(corner => el("i", `rpgc-corner rpgc-${corner}`, frame))
        el("div", "rpgc-sheen", body)
        const plate = el("div", "rpgc-name", body)
        const name = el("span", "rpgc-name-text", plate)
        const portrait = el("img", "rpgc-portrait", body)
        portrait.alt = ""
        const text = el("p", "rpgc-text", body)
        text.setAttribute("aria-live", "polite")
        const foot = el("div", "rpgc-foot", body)
        const cue = el("span", "rpgc-cue", foot)
        cue.setAttribute("aria-hidden", "true")
        const next = el("button", "rpgc-next", foot)
        next.type = "button"
        next.textContent = o.buttonLabel
        const sparks = el("div", "rpgc-sparks", body)
        d.body.append(box)

        // the names 1.x had, kept for code that reached in
        this.mainContainer = box
        this.convText = text
        this.convNextBtn = next
        this.convCharacImg = portrait
        this.bodyEl = body
        this.namePlate = plate
        this.nameEl = name
        this.sparkLayer = sparks

        next.addEventListener("click", event => {
            event.stopPropagation()
            this.proceedToNext()
        })
        body.addEventListener("click", () => {
            if(this.options.clickToAdvance) this.proceedToNext()
        })
        if(o.keys?.length){
            this._onKey = event => {
                if(!this._isOpen || !o.keys.includes(event.key)) return
                event.preventDefault()
                this.proceedToNext()
            }
            d.addEventListener("keydown", this._onKey)
        }
    }

    /** "oldgold" | "blackpanther" | "whiteheaven" | "oldrpg" - switches on the spot. */
    setTheme(name){
        let key = name
        if(!THEMES[key]){
            if(key) console.warn(`[rpg-convers] no theme "${key}" - using "${DEFAULT_THEME}". Themes: ${Object.keys(THEMES).join(", ")}`)
            key = DEFAULT_THEME
        }
        const box = this.mainContainer
        Object.keys(THEMES).forEach(theme => box.classList.remove(`rpgc-theme-${theme}`))
        box.classList.add(`rpgc-theme-${key}`)
        this.theme = key
        this.voice.setKind(THEMES[key].voice)
        if(this.options.loadFonts) loadThemeFonts(this.document, key)
        return this
    }

    /** An image behind the words (stretched to the box by default), or null for the theme's own face. */
    setBackground(url, size){
        const box = this.mainContainer
        if(size) this.options.backgroundSize = size
        if(url){
            box.style.setProperty("--rpgc-image", `url("${String(url).replace(/["\\]/g, encodeURIComponent)}")`)
            box.style.setProperty("--rpgc-image-size", this.options.backgroundSize)
            box.classList.add("rpgc-has-image")
        }else{
            box.style.removeProperty("--rpgc-image")
            box.classList.remove("rpgc-has-image")
        }
        this.options.background = url || null
        return this
    }

    setSpeed(ms){
        if(Number(ms) > 0) this.intervalForMessage = Number(ms)
        return this
    }
    /** The typing voice: setSound(false) silences it; setVolume(0..1). */
    setSound(on){
        this.options.sound = !!on
        this.voice.setEnabled(!!on)
        return this
    }
    setVolume(volume){
        this.options.volume = volume
        this.voice.setVolume(volume)
        return this
    }

    // ── the conversation ────────────────────────────────────────────────

    /**
     * Plays messages[startsInArrayOf] and on, one line per tap of the button
     * (a tap while a line is still typing shows the rest of it). callback runs
     * once, after the last line, as the box closes.
     * A message: { name, message, isLeft, btnName, imageDirectory }.
     */
    startConversation(messages, startsInArrayOf = 0, callback){
        clearTimeout(this._popTimer)
        const line = messages?.[startsInArrayOf]
        if(!line){
            this.proceedToNext = () => {}
            if(callback) callback()
            return
        }
        const wasOpen = this.open()
        const hadText = wasOpen && this.convText.childNodes.length > 0
        this._present(line)
        this._type(line.message, { delay: hadText ? LINE_SWAP_MS : wasOpen ? 0 : OPEN_DELAY_MS })

        const nextIndex = startsInArrayOf + 1
        this.proceedToNext = () => {
            if(this._typing) return this._finishTyping()
            if(!messages[nextIndex]){
                // the last line: this conversation is over. The button stays
                // clickable through the close animation (and to code), and a
                // second click here used to run the callback again - a reward
                // paid twice. Done is done; a conversation the callback
                // starts sets its own proceedToNext.
                this.proceedToNext = () => {}
                this.close()
                if(callback) return callback()
                return
            }
            this.startConversation(messages, nextIndex, callback)
        }
    }

    /** One line on its own, gone again after `willCloseAfterDuration` ms (4000). */
    popAMessage(message, willCloseAfterDuration){
        clearTimeout(this._popTimer)
        const wasOpen = this.open()
        this._present({ isLeft: true })
        this._type(message, { delay: wasOpen ? LINE_SWAP_MS : OPEN_DELAY_MS })
        this.proceedToNext = () => {
            if(this._typing) return this._finishTyping()
            this.proceedToNext = () => {}
            this.close()
        }
        this._popTimer = setTimeout(() => this.close(), willCloseAfterDuration ? willCloseAfterDuration : 4000)
    }

    /** Shows a whole line at once (no typing). */
    show(message, isLeft, btnName){
        this._present({ isLeft, btnName })
        this._type(message, { instant: true })
    }

    /** Returns true if it was already open. */
    open(){
        clearTimeout(this.closingTimeout)
        const box = this.mainContainer
        box.classList.remove("rpgc-closing")
        if(this._isOpen) return true
        this._isOpen = true
        this.convText.textContent = ""
        box.classList.remove("rpgc-shown", "rpgc-done", "rpgc-named")
        box.style.display = "block"
        void box.offsetWidth
        box.classList.add("rpgc-shown")
        return false
    }

    close(){
        clearTimeout(this._popTimer)
        if(!this._isOpen) return
        this._isOpen = false
        this._run++
        clearTimeout(this._typeTimer)
        this._typing = null
        const box = this.mainContainer
        box.classList.remove("rpgc-shown")
        box.classList.add("rpgc-closing")
        clearTimeout(this.closingTimeout)
        this.closingTimeout = setTimeout(() => {
            box.style.display = "none"
            box.classList.remove("rpgc-closing", "rpgc-done", "rpgc-named")
        }, CLOSE_MS)
    }

    get isOpen(){
        return this._isOpen
    }

    /** Takes the box off the page for good. */
    destroy(){
        this.close()
        clearTimeout(this.closingTimeout)
        if(this._onKey) this.document.removeEventListener("keydown", this._onKey)
        this.mainContainer.remove()
        this.voice.close()
    }

    // ── a line ──────────────────────────────────────────────────────────

    _present({ name, isLeft, btnName, imageDirectory } = {}){
        const box = this.mainContainer
        const side = isLeft ? "left" : "right"
        const sideChanged = !box.classList.contains(`rpgc-${side}`)
        box.classList.toggle("rpgc-left", !!isLeft)
        box.classList.toggle("rpgc-right", !isLeft)

        const named = !!(this.options.showName && name)
        if(named){
            const changed = this.nameEl.textContent !== String(name) || sideChanged || !box.classList.contains("rpgc-named")
            this.nameEl.textContent = String(name)
            if(changed){
                this.namePlate.classList.remove("rpgc-name-in")
                void this.namePlate.offsetWidth
                this.namePlate.classList.add("rpgc-name-in")
            }
        }
        box.classList.toggle("rpgc-named", named)
        this.convNextBtn.textContent = btnName ? btnName : this.options.buttonLabel
        this.setImageOfSpeaker(imageDirectory, isLeft)
        this.voice.setSpeaker(name)
    }

    _type(message, { delay = 0, instant = false } = {}){
        const run = ++this._run
        clearTimeout(this._typeTimer)
        const box = this.mainContainer
        box.classList.remove("rpgc-done")
        this._typing = { chars: null, index: 0, instant, run }
        if(delay > 0) this.convText.classList.add("rpgc-leaving")

        const begin = () => {
            if(run !== this._run) return
            const typing = this._typing
            this.convText.classList.remove("rpgc-leaving")
            typing.chars = buildLetters(this.document, this.convText, message)
            typing.last = [...typing.chars].reverse().find(span => !span.classList.contains("rpgc-sp")) ?? null
            if(typing.instant) return this._finishTyping()
            step()
        }
        const step = () => {
            if(run !== this._run || !this._typing?.chars) return
            const typing = this._typing
            const { chars } = typing
            // fast speeds land a few letters a frame
            const perStep = Math.max(1, Math.round(16 / this.intervalForMessage))
            let shown = null
            let endsPhrase = false
            for(let n = 0; n < perStep && typing.index < chars.length; n++){
                shown = chars[typing.index++]
                this._land(shown)
                // (read before the spaces are skipped: a space after it ends a phrase)
                endsPhrase = typing.index >= chars.length || chars[typing.index].classList.contains("rpgc-sp")
                // spaces go by without a beat
                while(typing.index < chars.length && chars[typing.index].classList.contains("rpgc-sp")) chars[typing.index++].classList.add("rpgc-on")
            }
            if(typing.index >= chars.length) return this._lineDone()
            const ch = shown?.textContent ?? ""
            const hold = endsPhrase ? PAUSES[ch] : ch === "." ? 2 : null
            this._typeTimer = setTimeout(step, this.intervalForMessage * (hold || 1))
        }
        if(delay > 0) this._typeTimer = setTimeout(begin, delay)
        else begin()
    }

    _land(span){
        span.classList.add("rpgc-on")
        if(span.classList.contains("rpgc-sp")) return
        if(/[\p{L}\p{N}]/u.test(span.textContent)) this.voice.blip()
        // the first letter of a shouted word shakes the box
        if(span.dataset.loud === "1") this._shake()
    }

    _finishTyping(){
        const typing = this._typing
        if(!typing) return
        if(!typing.chars){
            // still swapping lines - show it whole once it's in
            typing.instant = true
            return
        }
        clearTimeout(this._typeTimer)
        // the rest of it, cascading in quickly rather than all in one frame
        const rest = typing.chars.slice(typing.index)
        rest.forEach((span, n) => {
            span.style.animationDelay = `${Math.min(n * 4, 220)}ms`
            span.classList.add("rpgc-on")
        })
        typing.index = typing.chars.length
        this._lineDone()
    }

    _lineDone(){
        const typing = this._typing
        this._typing = null
        this.mainContainer.classList.add("rpgc-done")
        if(typing?.last) this._burst(typing.last)
    }

    _shake(){
        const box = this.mainContainer
        box.classList.remove("rpgc-shake")
        void box.offsetWidth
        box.classList.add("rpgc-shake")
        clearTimeout(this._shakeTimer)
        this._shakeTimer = setTimeout(() => box.classList.remove("rpgc-shake"), 360)
    }

    // a few sparks off the last letter
    _burst(span){
        const layer = this.sparkLayer
        const from = layer.getBoundingClientRect()
        const at = span.getBoundingClientRect()
        if(!at.width && !at.height) return
        const x = at.right - from.left
        const y = at.top + at.height / 2 - from.top
        for(let i = 0; i < 7; i++){
            const spark = this.document.createElement("i")
            spark.className = "rpgc-spark"
            const angle = Math.random() * Math.PI * 2
            const reach = 14 + Math.random() * 26
            spark.style.left = `${x}px`
            spark.style.top = `${y}px`
            spark.style.setProperty("--dx", `${Math.cos(angle) * reach}px`)
            spark.style.setProperty("--dy", `${Math.sin(angle) * reach - 8}px`)
            spark.style.animationDelay = `${i * 18}ms`
            layer.append(spark)
            setTimeout(() => spark.remove(), 1000)
        }
    }

    // ── 1.x's helpers, kept ─────────────────────────────────────────────

    setImageOfSpeaker(imageDirectory, isLeft){
        const box = this.mainContainer
        if(imageDirectory){
            if(this.convCharacImg.getAttribute("src") !== imageDirectory) this.convCharacImg.src = imageDirectory
            box.classList.add("rpgc-has-portrait")
        }else{
            // no picture: hidden, and nothing fetched from another site
            this.convCharacImg.removeAttribute("src")
            box.classList.remove("rpgc-has-portrait")
        }
    }
    addClassNameToELement(elementType, newClassName){
        const target = {
            container: this.mainContainer,
            text: this.convText,
            image: this.convCharacImg,
            button: this.convNextBtn,
            name: this.namePlate,
        }[elementType]
        target?.classList.add(newClassName)
    }
    createElement(document, elementType, className, textInside){
        const elem = document.createElement(elementType)
        elem.className = className
        elem.innerHTML = textInside ? textInside : ""
        return elem
    }
}

// The line into `container`, every letter its own span (hidden until it
// lands), words kept whole across line breaks. The message is HTML, as it was
// in 1.x - <b>, <em>, <strong> come out in the theme's accent - so it must
// be text you wrote, not text a player typed.
function buildLetters(doc, container, message){
    container.textContent = ""
    const template = doc.createElement("template")
    template.innerHTML = String(message ?? "")
    const walker = doc.createTreeWalker(template.content, NodeFilter.SHOW_TEXT)
    const texts = []
    while(walker.nextNode()) texts.push(walker.currentNode)
    texts.forEach(node => {
        const pieces = doc.createDocumentFragment()
        node.nodeValue.split(/(\s+)/).forEach(token => {
            if(!token) return
            if(/^\s+$/.test(token)){
                const space = doc.createElement("span")
                space.className = "rpgc-ch rpgc-sp"
                space.textContent = " "
                pieces.append(space)
                return
            }
            const word = doc.createElement("span")
            word.className = "rpgc-w"
            const letters = token.replace(/[^\p{L}]/gu, "")
            const loud = letters.length >= LOUD_MIN && letters === letters.toUpperCase() && letters !== letters.toLowerCase()
            if(loud) word.classList.add("rpgc-loud")
            Array.from(token).forEach((ch, i) => {
                const letter = doc.createElement("span")
                letter.className = "rpgc-ch"
                letter.textContent = ch
                if(loud && i === 0) letter.dataset.loud = "1"
                word.append(letter)
            })
            pieces.append(word)
        })
        node.replaceWith(pieces)
    })
    container.append(template.content)
    return Array.from(container.querySelectorAll(".rpgc-ch"))
}
