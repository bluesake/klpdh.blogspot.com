// Author: rodneyrehm@github
// from: https://gist.github.com/rodneyrehm/4feec9af8a8635f7de7cb1754f146a39
// License: unkown

function getHeadingLevel(tagName) {
    if(tagName[0].toLowerCase() === 'h') {
        tagName = tagName.slice(1)
    }

    return parseInt(tagName, 10)
}

exports.adjustHeadingLevel = function adjustHeadingLevel(md, options) {
    let firstLevel = options.firstLevel

    if(typeof firstLevel === 'string') {
        firstLevel = getHeadingLevel(firstLevel)
    }

    if(!firstLevel || isNaN(firstLevel)) {
        return
    }

    let levelOffset = firstLevel - 1
    if(levelOffset < 1 || levelOffset > 6) {
        return
    }

    md.core.ruler.push('adjust-heading-levels', function(state) {
        let tokens = state.tokens
        for(let i = 0; i < tokens.length; i++) {
            if(tokens[i].type !== 'heading_close') {
                continue
            }

            let headingOpen = tokens[i - 2]
            // let heading_content = tokens[i - 1];
            let headingClose = tokens[i]

            // we could go deeper with <div role="heading" aria-level="7">
            // see http://w3c.github.io/aria/aria/aria.html#aria-level
            // but clamping to a depth of 6 should suffice for now
            let currentLevel = getHeadingLevel(headingOpen.tag)
            let tagName = 'h' + Math.min(currentLevel + levelOffset, 6)

            headingOpen.tag = tagName
            headingClose.tag = tagName
        }
    })
}
