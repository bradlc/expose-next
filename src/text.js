import { Component } from 'preact'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model'
import { baseKeymap, toggleMark } from 'prosemirror-commands'
import { keymap } from 'prosemirror-keymap'
// import { schema } from 'prosemirror-schema-basic'
// import { addListNodes } from 'prosemirror-schema-list'
// import { exampleSetup } from 'prosemirror-example-setup'

import { Plugin } from 'prosemirror-state'

import { ExposeConsumer, LocationConsumer } from './expose.js'
import dlv from 'dlv'

// const textSchema = new Schema({
//   nodes: {
//     text: {},
//     doc: { content: 'text*' }
//   }
// })

// const mySchema = new Schema({
//   nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
//   marks: schema.spec.marks
// })

function hasBlock(list) {
  return list.indexOf('p') !== -1 || list.indexOf('ul') !== -1
}

export default class Text extends Component {
  render(props) {
    return (
      <ExposeConsumer>
        {expose => (
          <LocationConsumer>
            {location => (
              <TextEditable expose={expose} location={location} {...props} />
            )}
          </LocationConsumer>
        )}
      </ExposeConsumer>
    )
  }
}

class TextEditable extends Component {
  constructor(props) {
    super(props)

    this.handleBlur = () => {
      console.log(this.editor.dom.innerHTML)
      // TODO: figure out if below is needed
      let fragment = DOMSerializer.fromSchema(textSchema).serializeFragment(
        this.editor.state.doc.content
      )
      let tmp = document.createElement('div')
      tmp.appendChild(fragment)
      console.log(tmp.innerHTML)
    }

    let whitelist = props.whitelist || []
    this.isBlock = hasBlock(whitelist)
    this.isInline = !this.isBlock

    this.html = dlv(
      props.expose,
      `${props.location}.${props.name}`,
      this.isBlock ? '<p>Lorem ipsum dolor sit amet</p>' : 'Lorem ipsum'
    )

    this.tmpDom = document.createElement('div')

    let schema = {
      nodes: {
        text: {
          group: 'inline'
        },
        doc: {
          content: this.isBlock ? 'block*' : 'inline*'
        }
      },
      marks: {}
    }
    this.keymap = {}

    if (whitelist.indexOf('p') !== -1) {
      schema.nodes.paragraph = {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM() {
          return ['p', 0]
        }
      }
    }

    if (whitelist.indexOf('b') !== -1 || whitelist.indexOf('strong') !== -1) {
      schema.marks.strong = {
        parseDOM: [
          { tag: 'strong' },
          // This works around a Google Docs misbehavior where
          // pasted content will be inexplicably wrapped in `<b>`
          // tags with a font-weight normal.
          {
            tag: 'b',
            getAttrs: node => node.style.fontWeight !== 'normal' && null
          },
          {
            style: 'font-weight',
            getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
          }
        ],
        toDOM() {
          return ['strong', 0]
        }
      }
    }

    if (whitelist.indexOf('i') !== -1 || whitelist.indexOf('em') !== -1) {
      schema.marks.em = {
        parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
        toDOM() {
          return ['em', 0]
        }
      }
    }

    this.schema = new Schema(schema)

    if (whitelist.indexOf('b') !== -1 || whitelist.indexOf('strong') !== -1) {
      this.keymap['Mod-b'] = toggleMark(this.schema.marks.strong)
    }

    if (whitelist.indexOf('i') !== -1 || whitelist.indexOf('em') !== -1) {
      this.keymap['Mod-i'] = toggleMark(this.schema.marks.em)
    }
  }
  shouldComponentUpdate(nextProps) {
    if (
      !this.editing &&
      nextProps.expose.locked.indexOf(
        `${nextProps.location}.${nextProps.name}`
      ) !== -1
    ) {
      this.editor.dom.style.opacity = 0.5
    } else {
      this.editor.dom.style.opacity = 1
    }

    if (this.editing) return false

    let html = dlv(
      nextProps.expose,
      `${nextProps.location}.${nextProps.name}`,
      this.isBlock ? '<p>Lorem ipsum dolor sit amet</p>' : 'Lorem ipsum'
    )
    if (this.html !== html) {
      this.html = html
      this.tmpDom.innerHTML = this.html
      // this.editor.destroy()
      // this.init()
      console.log(this.editor.state)
      this.editor.updateState(
        EditorState.create({
          plugins: this.editor.state.config.plugins,
          doc: DOMParser.fromSchema(this.schema).parse(this.tmpDom, {
            preserveWhitespace: true
          })
        })
      )
    }
    return false
    // console.log('prev', this.html)
    // console.log('next', html)
    // return !this.editing
    // if (this.editing) return false

    // let html = dlv(
    //   nextProps.expose,
    //   `${nextProps.location}.${nextProps.name}`,
    //   this.isBlock ? '<p>Lorem ipsum dolor sit amet</p>' : 'Lorem ipsum'
    // )
    // // if (html === this.html) return false
    // let div = document.createElement('div')
    // div.innerHTML = html

    // this.editor.updateState(
    //   EditorState.create({
    //     ...this.editor.state,
    //     doc: DOMParser.fromSchema(this.schema).parse(div)
    //   })
    // )
    // return false
  }
  componentDidMount() {
    this.init()
  }
  componentWillUnmount() {
    this.editor && this.editor.destroy()
  }
  componentDidUpdate() {
    let dom = document.createElement('div')
    dom.innerHTML = this.html
    // this.editor.destroy()
    // this.init()
    this.editor.updateState(
      EditorState.create({
        ...this.editor.state,
        doc: DOMParser.fromSchema(this.schema).parse(dom)
      })
    )
  }
  init() {
    this.editor = new EditorView(this.root, {
      state: EditorState.create({
        doc: DOMParser.fromSchema(this.schema).parse(this.content, {
          preserveWhitespace: true
        }),
        plugins: [
          // keymap(baseKeymap),
          keymap(this.keymap),
          new Plugin({
            view: editorView => {
              this.content.remove()
              // this.root.parentNode.insertBefore(editorView.dom, this.root)
              // this.root.remove()
              // editorView.dom.style.display = 'inline'
              // editorView.dom.style.pointerEvents = 'none'
              return {
                update: () => {
                  // this.html = this.editor.dom.innerHTML
                  this.props.expose.updateEditable(
                    `${this.props.location}.${this.props.name}`,
                    this.editor.dom.innerHTML
                  )
                  this.props.expose.broadcast()
                }
              }
            }
          })
        ]
      })
    })
  }
  render({ expose, location, name }) {
    return (
      <div
        onFocusCapture={() => {
          this.editing = true
          expose.lock(`${location}.${name}`, () => {
            expose.broadcast()
          })
        }}
        onBlurCapture={() => {
          this.editing = false
          expose.unlock(`${location}.${name}`, () => {
            expose.broadcast()
          })
          return
          expose.updateEditable(
            `${location}.${name}`,
            this.editor.dom.innerHTML
          )
        }}
        ref={ref => (this.root = ref)}
        style={{
          opacity:
            !this.editing && expose.locked.indexOf(`${location}.${name}`) !== -1
              ? 0.5
              : 1
        }}
      >
        <span
          ref={ref => (this.content = ref)}
          // style={{ display: 'none' }}
          dangerouslySetInnerHTML={{
            __html: this.html
          }}
        />
      </div>
    )
  }
}
