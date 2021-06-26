import React from 'react'
import {hydrate, render} from 'react-dom'
import {loadableReady} from '@loadable/component'

const Blog = () => {
    return <div>{window.location.pathname}</div>
}

// this react component
const App = () => {
    const [counter, setCounter] = React.useState(0)

    React.useEffect(() => {
        let inv = setInterval(() => {
            setCounter(c => c < 1000 ? c + 1 : 0)
        }, 500)
        return () => clearInterval(inv)
    }, [setCounter])

    return <div>
        <p className={'center px2 mb0'}>Hi from React!</p>
        <Blog/>
        <p className={'center px2 mt0 light'}>Time: {(new Date()).toLocaleString()} @ {counter} <small>(counter resets at 1000)</small></p>
    </div>
}

// into this html node
const rootElement = document.getElementById('root-pwa')
if(rootElement.hasChildNodes()) {
    loadableReady(() => {
        hydrate(<App/>, rootElement)
    })
} else {
    render(<App/>, rootElement)
}
