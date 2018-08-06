import './style.css'
import { Component, render } from 'preact'
import Text from './text.js'
import Repeater, { RepeaterConsumer } from './repeater.js'
import Variant from './variant.js'
import Editable from './editable.js'
import { ExposeProvider, ExposeConsumer, LocationProvider } from './expose.js'

require('preact/debug')

export default class App extends Component {
  render() {
    return (
      <div>
        <h1>Example</h1>
        <Text name="title" whitelist={['i', 'b']} />

        {/*<Editable name="example" props={{ color: {} }}>
          {({ color, foo }) => (
            <div>
              {foo}
              <span style={{ color }}>{color}</span>
              <Editable name="example" props={{ color: {} }}>
                {({ color }) => <span style={{ color }}>{color}</span>}
              </Editable>
            </div>
          )}
        </Editable>*/}

        <Repeater name="sections">
          <Variant
            name="text"
            render={() => <Text name="title" whitelist={['b']} />}
          />
          <Variant
            name="test"
            render={index => (
              <Editable name="test-props" props={{ color: {} }}>
                {({ color }) => (
                  <div style={{ color: color || '' }}>test {index}</div>
                )}
              </Editable>
            )}
          />
        </Repeater>
        <RepeaterConsumer name="sections">
          {name =>
            name === 'text' ? (
              <div>
                <Text name="title" whitelist={['b']} />
              </div>
            ) : null
          }
        </RepeaterConsumer>
        <div style={{ marginTop: 50 }}>
          <div>
            <Text name="t1" whitelist={['b']} />
          </div>
          <div>
            <Text name="t1" whitelist={['b']} />
          </div>
        </div>
        <ExposeConsumer>
          {editables => <pre>{JSON.stringify(editables, null, 2)}</pre>}
        </ExposeConsumer>
      </div>
    )
  }
}

if (typeof window !== 'undefined') {
  render(
    <ExposeProvider>
      <LocationProvider>
        <App />
      </LocationProvider>
    </ExposeProvider>,
    document.getElementById('root')
  )
}
