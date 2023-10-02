const generateStyle = require("./tools/generateStyle.js")
class Conversation {
    constructor(document, talkingSpeed){
        this.intervalForMessage = talkingSpeed ? talkingSpeed : 100
        this.intervalGenerating = undefined
        this.closingTimeout = undefined

        this.proceedToNext = () => console.log("not yet defined")

        const mainContainer = document.querySelector(".main-container")
        const convText = document.querySelector(".conv-text")
        const convNextBtn = document.querySelector(".conv-next-btn")
        const convCharacImg = document.querySelector(".conv-charac-img")

        this.mainContainer = mainContainer ? mainContainer : this.createElement(document,"div", "main-container")
        this.convText = convText ? convText : this.createElement(document,"p", "conv-text")
        this.convNextBtn = convNextBtn ? convNextBtn : this.createElement(document,"button", "conv-next-btn", "next")
        this.convCharacImg = convCharacImg ? convCharacImg : this.createElement(document,"img", "conv-charac-img")
        this.applyStartingStyle(document)
    }
    applyStartingStyle(document){
        generateStyle(this.mainContainer, false, "container")
        generateStyle(this.convText, false, "text")
        generateStyle(this.convNextBtn,false, "button")
        generateStyle(this.convCharacImg,false, "image")

        const body = document.querySelector("body")
        this.mainContainer.append(this.convText)        
        this.mainContainer.append(this.convNextBtn)   
        this.mainContainer.append(this.convCharacImg)   
        body.append(this.mainContainer)
        this.convNextBtn.addEventListener("click", () => this.proceedToNext())
    }
    show(message,isLeft, btnName){
        this.convText.innerHTML = message
        this.convText.style.left = isLeft ? "28%" : "12%"
        this.convNextBtn.innerHTML = btnName ? btnName : "next"
    }
    open(){
        clearInterval(this.intervalGenerating)
        clearTimeout(this.closingTimeout)
        this.mainContainer.style.display = "block"
        this.mainContainer.style.transform = "translate(-50%,-50%) scale(1)"
    }
    close(){
        clearInterval(this.intervalGenerating)
        clearTimeout(this.closingTimeout)
        this.mainContainer.style.transform = "translate(-50%,-50%) scale(0)"
        this.closingTimeout = setTimeout(() =>{
            this.mainContainer.style.display = "none"
        },500)
    }
    addClassNameToELement(elementType, newClassName){
        switch(elementType){
            case "container":
                this.mainContainer.classList.add(newClassName)
            break
            case "text":
                this.convText.classList.add(newClassName)
            break
            case "image":
                this.convCharacImg.classList.add(newClassName)
            break;
            case "button":
                this.convNextBtn.classList.add(newClassName)
            break;
        }
    }
    createElement(document,elementType, className, textInside){
        const elem = document.createElement(elementType)
        elem.className = className
        elem.innerHTML = textInside ? textInside : ''
        return elem
    }
    setImageOfSpeaker(imageDirectory,isLeft){
        this.convCharacImg.style.left = isLeft ? "0" : "77%"
        if(imageDirectory){ 
            this.convCharacImg.src = imageDirectory
            this.convCharacImg.style.display = "block"
        }else{
            this.convCharacImg.src =  "https://webstockreview.net/images/clipart-person-shadow-2.png";
            this.convCharacImg.style.display = "none"
        }
    }
    startConversation(messages, startsInArrayOf,callback){
        if(!this.mainContainer) this.applyStartingStyle()
        this.open()
        const {name, message, isLeft, btnName,imageDirectory } = messages[startsInArrayOf]
        this.setImageOfSpeaker(imageDirectory,isLeft)

        let startingMessageNum = 0
        let currentMessageArray = []
        let messageArray = message.split("")
        const messageLength = messageArray.length
        clearInterval(this.intervalGenerating)
        this.intervalGenerating = setInterval(() => {
            if(messageLength < startingMessageNum) return clearInterval(this.intervalGenerating)
            
            currentMessageArray.push(messageArray[startingMessageNum])
            this.show(currentMessageArray.join(""),isLeft,btnName,imageDirectory)
            startingMessageNum++
        }, this.intervalForMessage)

        const nextPageNum = startsInArrayOf+1
        this.proceedToNext = () => {
            if(messageLength > startingMessageNum){
                startingMessageNum = messageLength
                this.show(message,isLeft,btnName)
                return clearInterval(this.intervalGenerating)
            }
            if(!messages[nextPageNum]){
                if(callback) callback()
                return this.close({name, message, isLeft })
            }
            this.startConversation(messages, nextPageNum, callback)
        }
    }
    popAMessage(message, willCloseAfterDuration){
        if(!this.mainContainer) this.applyStartingStyle()
        this.show(message, true)
        setTimeout(() => {
            this.close()
        }, willCloseAfterDuration ? willCloseAfterDuration : 4000)
    }
}
module.exports = Conversation