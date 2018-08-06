import { Component } from 'preact'
import { createContext } from './preact-context.js'
import dlv from 'dlv'
import dset from 'dset'
import Sockette from 'sockette'
import debounce from 'debounce'

let ExposeContext = createContext()

export class ExposeProvider extends Component {
  constructor(props) {
    super(props)

    this.addVariant = (location, name, after) => {
      this.setState(state => {
        let existing = dlv(state, location, [])
        let nextState = { ...state }
        if (typeof after !== 'undefined') {
          console.log(after)
          existing.splice(after + 1, 0, { name, $children: {} })
        } else {
          existing.push({ name, $children: {} })
        }
        dset(nextState, `${location}`, existing)
        return nextState
      }, this.broadcast)
    }

    this.removeVariant = (location, index) => {
      this.setState(state => {
        let existing = dlv(state, location, [])
        let nextState = { ...state }
        dset(nextState, location, [
          ...existing.slice(0, index),
          ...existing.slice(index + 1)
        ])
        return nextState
      }, this.broadcast)
    }

    this.moveVariant = (location, oldIndex, newIndex) => {
      this.setState(state => {
        let existing = dlv(state, location, [])
        let nextState = { ...state }
        existing.splice(newIndex, 0, existing.splice(oldIndex, 1)[0])
        dset(nextState, location, existing)
        return nextState
      }, this.broadcast)
    }

    this.updateEditable = (location, markup) => {
      this.setState(state => {
        let nextState = { ...state }
        dset(nextState, location, markup)
        return nextState
      })
    }

    this.lock = (location, cb) => {
      this.setState(state => {
        if (state.locked.indexOf(location) === -1) {
          return { locked: [...state.locked, location] }
        }
        return {}
      }, cb)
    }

    this.unlock = (location, cb) => {
      this.setState(state => {
        return {
          locked: state.locked.filter(x => x !== location)
        }
      }, cb)
    }

    this.broadcast = () => {
      this.ws && this.ws.send(JSON.stringify(this.state))
    }

    this.hover = (el, location, index) => {
      let rect = el.getBoundingClientRect()
      this.overlay.style.position = 'absolute'
      this.overlay.style.top = `${rect.top - 10 + window.pageYOffset}px`
      this.overlay.style.left = `${rect.left - 10}px`
      this.overlay.style.width = `${rect.width + 20}px`
      this.overlay.style.height = `${rect.height + 20}px`
      this.overlay.style.display = 'block'
      this.hoveredLocation = location
      this.hoveredIndex = index
    }

    this.state = {
      locked: [],
      editables: {
        title: 'Hello, world',
        example: {
          color: 'red',
          foo: 'hi',
          $children: {
            example: {
              color: 'blue'
            }
          }
        },
        sections: [
          {
            name: 'text',
            $children: {
              title: 'One'
            }
          },
          {
            name: 'text',
            $children: {
              title: 'Two'
            }
          },
          {
            name: 'test',
            $children: {
              'test-props': {
                color: 'hotpink'
              }
            }
          }
        ]
      },
      addVariant: this.addVariant,
      removeVariant: this.removeVariant,
      moveVariant: this.moveVariant,
      updateEditable: this.updateEditable,
      broadcast: debounce(this.broadcast, 500),
      lock: this.lock,
      unlock: this.unlock,
      hover: this.hover
    }
  }
  componentDidMount() {
    this.overlay = document.createElement('div')
    this.overlay.style.border = '1px solid red'
    this.overlay.style.display = 'none'
    this.overlay.style.pointerEvents = 'none'
    this.btn = document.createElement('button')
    this.btn.style.position = 'absolute'
    this.btn.style.top = 'calc(100% - 16px)'
    this.btn.style.right = '-16px'
    this.btn.style.width = this.btn.style.height = '32px'
    this.btn.style.background = 'blue'
    this.btn.style.pointerEvents = 'auto'
    this.overlay.appendChild(this.btn)
    this.btn.addEventListener('click', () => {
      // this.overlay.appendChild(createList(this.hoveredVariants))
      // return
      this.addVariant(this.hoveredLocation, 'test', this.hoveredIndex)
    })
    window.addEventListener('mouseover', e => {
      let variant = e.target.closest('[data-expose] > *')
      if (!variant) return
      this.hoveredLocation = variant.parentNode.getAttribute('data-expose')
      this.hoveredVariants = JSON.parse(
        variant.parentNode.getAttribute('data-variants')
      )
      this.hoveredIndex = getElementIndex(variant)
      this.hover(variant, this.hoveredLocation, this.hoveredIndex)
    })
    document.body.appendChild(this.overlay)
    return
    this.ws = new Sockette('wss://d8e3e2a9.eu.ngrok.io', {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: e => console.log('Connected!', e),
      onmessage: e => {
        console.log('Received:', e)
        this.setState(JSON.parse(e.data))
      },
      onreconnect: e => console.log('Reconnecting...', e),
      onmaximum: e => console.log('Stop Attempting!', e),
      onclose: e => console.log('Closed!', e),
      onerror: e => console.log('Error:', e)
    })
  }
  componentWillUnmount() {
    this.ws && this.ws.close()
  }
  render({ children }) {
    return (
      <ExposeContext.Provider value={this.state} {...this.props}>
        {children}
      </ExposeContext.Provider>
    )
  }
}
export const ExposeConsumer = ExposeContext.Consumer

let LocationContext = createContext('editables')

export const LocationProvider = LocationContext.Provider
export const LocationConsumer = LocationContext.Consumer

function getElementIndex(node) {
  var index = 0
  while ((node = node.previousElementSibling)) {
    index++
  }
  return index
}

function createList(variants) {
  let list = document.createElement('ul')
  list.style.position = 'absolute'
  list.style.right = '-16px'
  list.style.bottom = '-16px'
  variants.forEach(variant => {
    let item = document.createElement('li')
    let btn = document.createElement('button')
    btn.textContent = variant.name
    item.appendChild(btn)
    list.appendChild(item)
  })
  return list
}
