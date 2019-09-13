import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';


const HomePage = (props) => {
  return (<main>
    <Link to="/page-1">Page 1</Link>
  </main>)
}
class Page1 extends React.PureComponent {
  iframe = null;

  iframeExpecting = false;
  state = {
    items: [],
    timestamp: (new Date).getTime(),
  }

  onContainerRegistered = (ref) => {
    this.wrapper = ref;

    this.attachFrame();
  }

  onOpenFrame = (evt) => {
    evt.preventDefault();
    this.iframeExpecting = true;
    this.iframe.contentWindow.removeEventListener("load", this.onFrameLoad);
    this.iframe.contentWindow.removeEventListener("beforeunload", this.onFrameBeforeUnload);
    this.iframe.contentWindow.removeEventListener("unload", this.onFrameUnload);
    this.iframe.contentWindow.addEventListener("load", this.onFrameLoad);
    this.iframe.contentWindow.addEventListener("beforeunload", this.onFrameBeforeUnload);
    this.iframe.contentWindow.addEventListener("unload", this.onFrameUnload);
    this.iframe.contentWindow.open("/page-2");
  }

  onChangeTimestamp = (evt) => {
    this.setState({
      timestamp: (new Date).getTime(),
    })
  }


  onFrameLoad = (evt) => {
    this.updateTimestamp();
  }

  onFrameBeforeUnload = (evt) => {
    evt.preventDefault();// Not working
    console.log('before unload work?');
  }

  onFrameUnload = (evt) => {
    evt.preventDefault();// Not working
    if ( this.iframeExpecting ){
      this.setState( prevState => ({ items: [... prevState.items, 'Requested for page unload.' ]  }))
      
      this.iframeExpecting = false;
    }
  }

  attachFrame = () => {
    this.iframe = document.createElement("iframe");
    this.iframe.src= "about:blank";
    this.iframe.style.position = "fixed";
    this.iframe.style.left = "-1000px";
    this.iframe.style.top = "-1000px";
    this.iframe.style.width = "100px";
    this.iframe.style.height = "100px";
    this.iframe.style.zIndex = "0";
    
    document.body.appendChild(this.iframe);
    this.updateTimestamp();
  }

  dettachFrame = () => {

    if ( this.iframe ) {
      this.iframe.contentWindow.removeEventListener("load", this.onFrameLoad);
      this.iframe.contentWindow.removeEventListener("beforeunload", this.onFrameBeforeUnload);
      this.iframe.contentWindow.removeEventListener("unload", this.onFrameUnload);
      document.body.removeChild(this.iframe);
      this.iframe = null;
    }
  }

  componentWillUnmount(){
    this.dettachFrame();
  }

  updateTimestamp = () => {
    if(this.iframe)
      this.iframe.contentDocument.body.innerHTML = `Loaded Timestamp: ${this.state.timestamp}`
  }

  render() {

    return <div ref={this.onContainerRegistered} className="page-wrapper">
      <h2>This is page 1</h2>
      <div>Timestamp: {this.state.timestamp}</div>
      <button onClick={this.onChangeTimestamp}>Change timestamp for test state change</button>
      <button type="button" onClick={this.onOpenFrame}>Open Page 2</button>
      
      {this.state.items.map( (text, index)=> <div key={`${index}`}>{text}</div>)}
      </div>
  }
}


const Page2 = (props: any) => {
  
  return <div><h2>This is page 2</h2>
  <Link to="/page-3">Go to Page 3</Link></div>
}

const Page3 = (props: any) => {
  const onClick = (evt) => {
    window.opener.document.location.reload();
    window.close();
  }
  return <div><h2>This is page 3</h2><button type="button" onClick={onClick}>Close and reload</button></div>
}


function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/page-1" component={Page1} />
        <Route exact path="/page-2" component={Page2} />
        <Route exact path="/page-3" component={Page3} />
      </Switch>
    </Router>
  );
}

export default App;
