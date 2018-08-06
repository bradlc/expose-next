import { Component } from 'preact'

export default class Variant extends Component {
  // constructor(props) {
  //   super(props)
  //   this.onMouseEnter = () => {
  //     console.log(this.props.index)
  //     this.props.expose.hover(this.base, this.props.location, this.props.index)
  //   }
  // }
  // componentDidMount() {
  //   // let btn = document.createElement('button')
  //   // btn.textContent = 'add'
  //   // let rect = this.base.getBoundingClientRect()
  //   // btn.style.position = 'absolute'
  //   // btn.style.top = `${rect.top + rect.height + window.pageYOffset}px`
  //   // btn.style.left = `${rect.left + rect.width}px`

  //   // this.base.addEventListener('mouseenter', () => {
  //   //   document.body.appendChild(btn)
  //   // })
  //   // this.base.addEventListener('mouseleave', () => {
  //   //   btn.remove()
  //   // })
  //   this.base.addEventListener('mouseenter', this.onMouseEnter)
  // }
  // componentWillReceiveProps(nextProps) {
  //   this.base.removeEventListener('mouseenter', this.onMouseEnter)
  // }
  // componentDidUpdate() {
  //   this.onMouseEnter = () => {
  //     console.log(this.props.index)
  //     this.props.expose.hover(this.base, this.props.location, this.props.index)
  //   }
  // }
  // componentWillUnmount() {
  //   this.base.removeEventListener('mouseenter', this.onMouseEnter)
  // }
  render({ render, component: Component, index }) {
    if (render) {
      return render(index)
    }
    return <Component index={index} />
  }
}
