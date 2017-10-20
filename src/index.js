import React from 'react'
import ReactDOM from 'react-dom'

import socketio from 'socket.io-client'
const socket = socketio.connect('http://localhost:3001')
const apiPath = 'http://localhost:3001/api'

class TestForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = { name: '', message: '' }
  }
  nameChanged (e) {
    this.setState({name: e.target.value})
  }
  messageChanged (e) {
    this.setState({message: e.target.value})
  }
  send () {
    socket.emit('test-msg', {
      name: this.state.name,
      message: this.state.message
    })
    this.setState({message: ''})
  }
  render () {
    return (
      <div>
        名前:<br />
        <input value={this.state.name}
          onChange={e => this.nameChanged(e)} /><br />
        メッセージ:<br />
        <input value={this.state.message}
          onChange={e => this.messageChanged(e)} /><br />
        <button onClick={e => this.send()}>
          送信
        </button>
      </div>
    )
  }
}

class TestApp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      logs: []
    }
  }
  componentWillMount () {
    fetch(apiPath)
    .then((result) => {
      return result.json()
    }).then((jsonResult) => {
      const prelog = []
      jsonResult.forEach((value) => {
        value.message.key = 'key_' + (prelog + 1)
        prelog.unshift(value.message)
      })
      this.setState({logs: prelog})
    })
  }
  componentDidMount () {
    socket.on('test-msg', (obj) => {
      const logs2 = this.state.logs
      obj.key = 'key_' + (this.state.logs.length + 1)
      console.log(obj)
      logs2.unshift(obj)
      this.setState({logs: logs2})
    })
  }
  render () {
    const messages = this.state.logs.map(e => (
      <div key={e.key}>
        <span>{e.name}</span>
        <span>{e.message}</span>
        <p style={{clear: 'both'}} />
      </div>
    ))
    return (
      <div>
        <h1>テストチャット</h1>
        <TestForm />
        <div>{messages}</div>
      </div>
    )
  }
}

ReactDOM.render(
  <TestApp />,
  document.getElementById('root')
)
