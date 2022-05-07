// We will scroll through this div
const chatMessagesListRoot = document.querySelector('div[class^="ChatMessagesList__ChatMessagesListRoot"]')

// We will extract messages from this div
const chatMessagesListInner = chatMessagesListRoot.querySelector('div[class^="ChatMessagesList__ChatMessagesListInner"]')

/**
 * Parse the chat messages and return an array of objects
 */
const collectMessages = () => {
    const messages = []

    // Loop over children of chatMessagesListInner
    // Skip when the class doesn't start with "MessageGroup__MessageGroupRoot"
    for (let i = 0; i < chatMessagesListInner.children.length; i++) {
        const child = chatMessagesListInner.children[i]
        if (child.className.startsWith('MessageGroup__MessageGroupRoot')) {

            const el = child.querySelector('div[class*="BubbleText__BubbleTextRoot"]')

            if (!el) {
                continue
            }

            // you
            const senderCol = el.querySelector('span[aria-colindex="2"]')

            // …
            const msgCol = el.querySelector(`div[aria-colindex="1"] span[id ^= "message"]`)

            // Last Sunday at 8:23 PM
            const timeCol = el.querySelector('span[aria-colindex="3"]')

            const message = {
                // sender: el.querySelector('[aria-colindex="1"]').hasAttribute('data-author') ? el.querySelector('[aria-colindex="1"]').getAttribute('data-author') : '',

                sender: senderCol ? senderCol.innerText : '',
                message: msgCol ? msgCol.innerText : '',
                time: timeCol ? timeCol.innerText : ''
            }

            messages.push(message)
        }
    }

    return messages
}

/**
 * @see https://stackoverflow.com/a/30800715/13765033
 */
const download = (exportObj, exportName) => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj))
    var downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", exportName + ".json")
    document.body.appendChild(downloadAnchorNode) // required for firefox
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}

const getMessagesCount = () => {
    return chatMessagesListInner.children.length
}

const scrollMessages = () => {
    chatMessagesListRoot.scrollTop = 1
}

/**
 * Scroll through the messages with an offset of one pixel and keep scrolling as long as new messages are added
 */
const keepScrolling = () => {
    const newCount = getMessagesCount()

    console.log(`
        Old count: ${oldCount}
        New count: ${newCount}
        Difference: ${newCount - oldCount}
    `)

    if (newCount === oldCount) {
        clearInterval(interval)
        download(
            collectMessages(),
            'chat-messages'
        )
    }

    oldCount = newCount
    scrollMessages()

}

// console.log(collectMessages())

/**
 * Kick off the interval
 */
let oldCount = 0
const interval = setInterval(keepScrolling, 1000)
