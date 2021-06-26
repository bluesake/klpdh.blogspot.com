const onReady = fn => {
    if(
        document.readyState === 'complete' ||
        (document.readyState !== 'loading' && !document.documentElement.doScroll)
    ) {
        fn()
    } else {
        document.addEventListener('DOMContentLoaded', fn)
    }
}

onReady(() => {
    const p = document.createElement('p')
    p.textContent = 'A second line of text'
    document.body.appendChild(p)
})
