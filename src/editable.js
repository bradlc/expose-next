import { Component } from 'preact'
import { ExposeConsumer, LocationConsumer, LocationProvider } from './expose.js'
import dlv from 'dlv'

function filter(definedProps, data) {
  let definedNames = Object.keys(definedProps)
  return Object.keys(data).reduce((acc, curr) => {
    if (curr.indexOf('$') === 0) return acc
    if (definedNames.indexOf(curr) === -1) return acc
    return { ...acc, [curr]: data[curr] }
  }, {})
}

class Wat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: filter(
        props.props,
        dlv(props.expose, `${props.location}.${props.name}`, {})
      )
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      value: filter(
        nextProps.props,
        dlv(nextProps.expose, `${nextProps.location}.${nextProps.name}`, {})
      )
    })
  }
  componentDidUpdate() {
    console.log(this.props)
  }
  render({ children, location, name }) {
    // return <div>{this.state.value.color || 'nah'}</div>
    return (
      <LocationProvider value={`${location}.${name}.$children`}>
        {children[0](this.state.value)}
      </LocationProvider>
    )
  }
}

export default class Editable extends Component {
  componentDidUpdate() {
    // console.log('du')
  }
  render(props) {
    return (
      <ExposeConsumer>
        {expose => (
          <LocationConsumer>
            {location => <Wat expose={expose} location={location} {...props} />}
          </LocationConsumer>
        )}
      </ExposeConsumer>
    )
  }
}
