function generateStyle(element, style, elementType){
    const {color, border, background, bottom,padding, width, fontSize } = style
    const eStyle = element.style

    eStyle.color = color ? color : "#f5f5f5"
    switch(elementType){
        case "container":
            eStyle.padding = padding ? padding : "25px"
            eStyle.position = "fixed"
            eStyle.transform = "translate(-50%,-50%) scale(1)"
            eStyle.bottom = bottom ? bottom : "10%"
            eStyle.left= "50%"
            eStyle.width = "80%"
            eStyle.border = border ? border : "2px solid #a7a7a7"
            eStyle.borderRadius = "5px"
            eStyle.display = "none"
            eStyle.background = background ? background : "#2d2c2c"
            eStyle.transition = ".5s"
        break
        case "text":
            eStyle.position = "relative"
            eStyle.height = "100%"
            eStyle.width = "70%"
            eStyle.float = "left"
            eStyle.fontSize =  fontSize ? fontSize : "1rem"
        break
        case "image":
            eStyle.position = "fixed"
            eStyle.left= "0"
            eStyle.bottom= "0"
            eStyle.width = "240px"
            eStyle.zIndex = "-1"
            eStyle.display = "none"
        break;
        case "button":
            eStyle.position = "absolute"
            eStyle.bottom = bottom ? bottom : "-10px"
            eStyle.right= bottom ? bottom : "-10px"
            eStyle.width = "auto"
            eStyle.height = "auto"
            eStyle.padding = "3px 15px"
            eStyle.borderRadius = "5px"
            eStyle.border = border ? border : "1px solid #a7a7a7"
            eStyle.background = background ? background : "gray"
            eStyle.cursor = "pointer"
        break;
    }
}
module.exports = generateStyle