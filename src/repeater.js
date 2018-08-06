import { Component } from 'preact'
import {
  ExposeProvider,
  ExposeConsumer,
  LocationProvider,
  LocationConsumer
} from './expose.js'
import Variant from './variant.js'

import Sortable from 'react-sortablejs'

export default class Repeater extends Component {
  constructor(props) {
    super(props)
    console.log(this.props.children)
  }
  render({ name }) {
    return (
      <ExposeConsumer>
        {expose => (
          <LocationConsumer>
            {location => (
              <Sortable
                onChange={(order, sortable, e) => {
                  expose.moveVariant(
                    `${location}.${name}`,
                    e.oldIndex,
                    e.newIndex
                  )
                }}
                data-expose={`${location}.${name}`}
                data-variants={JSON.stringify(
                  this.props.children.map(child => child.attributes)
                )}
              >
                {expose.editables[name].map((section, i) => {
                  let variant = this.props.children.filter(
                    n => n.attributes.name === section.name
                  )
                  variant = variant[0]

                  return (
                    <LocationProvider
                      value={`${location}.${name}.${i}.$children`}
                    >
                      {/*variant.attributes.render(i)*/}
                      <Variant
                        {...variant.attributes}
                        expose={expose}
                        location={`${location}.${name}`}
                        index={i}
                      />
                      {/*<button
                        type="button"
                        onClick={() =>
                          expose.removeVariant(`${location}.${name}`, i)
                        }
                      >
                        Remove
                      </button>*/}
                    </LocationProvider>
                  )
                })}
                {/*Object.keys(editables[name])
              .concat()
              .sort()
              .map((k, i) => {
                let nm = k.replace(/[0-9]+_/, '')
                let variant = this.props.children.filter(
                  n => n.attributes.name === nm
                )
                variant = variant[0]
                if (variant.attributes.render) {
                  return (
                    <ExposeProvider value={`${location}.${name}.${i}_${nm}`}>
                      {variant.attributes.render()}
                      <button
                          type="button"
                          onClick={() =>
                            removeVariant(`${location}.${name}`, i)
                          }
                        >
                          Remove
                        </button>
                    </LocationProvider>
                  )
                } else {
                  let C = variant.attributes.component
                  return (
                    <LocationProvider value={`${location}.${name}.${i}_${nm}`}>
                      <C />
                    </LocationProvider>
                  )
                }
                })*/}
                {/*this.props.children.map(variant => (
                  <button
                    type="button"
                    onClick={() =>
                      expose.addVariant(
                        `${location}.${name}`,
                        variant.attributes.name
                      )
                    }
                  >
                    Add {variant.attributes.name}
                  </button>
                ))*/}
              </Sortable>
            )}
          </LocationConsumer>
        )}
      </ExposeConsumer>
    )
  }
}

export class RepeaterConsumer extends Component {
  render() {
    return (
      <ExposeConsumer>
        {expose => (
          <LocationConsumer>
            {location => (
              <div>
                {expose.editables[this.props.name].map((section, i) => {
                  return (
                    <LocationProvider
                      value={`${location}.${this.props.name}.${i}.$children`}
                    >
                      {this.props.children[0](
                        //expose.editables[this.props.name][i].editables
                        expose.editables[this.props.name][i].name
                      )}
                    </LocationProvider>
                  )
                })}
              </div>
            )}
          </LocationConsumer>
        )}
      </ExposeConsumer>
    )
  }
  render2() {
    return (
      <LocationConsumer>
        {location => (
          <LocationProvider value={`${location}.${this.props.name}`}>
            {this.props.children}
          </LocationProvider>
        )}
      </LocationConsumer>
    )
  }
}
