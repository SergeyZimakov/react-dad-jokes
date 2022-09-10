import React, { Component } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './JokeList.css';
import Joke from './Joke';

class JokeList extends Component {

  static defaultProps = {
    numJokesToGet: 10,
  };
  
  constructor(props) {
    super(props);
    this.state = {
        jokes: JSON.parse(window.localStorage.getItem("jokes")) || [],
        loading: false
    }
    this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    this.fetchNewJokes = this.fetchNewJokes.bind(this);
  }

  handleVote(id, delta) {
    let jokes = this.state.jokes.map(j => {
      return j.id === id ? {...j, votes: j.votes + delta} : j;
    });
    this.setState({jokes});
    this.saveJokesToLocalStorage();
  }

  async componentDidMount() {
    if (this.state.jokes.length === 0) {
      await this.fetchNewJokes();
    }    
  }
  
  async fetchNewJokes() {
    try {  
      this.setState({loading: true});
      let jokes = [];
      while(jokes.length < this.props.numJokesToGet) {
          let res = await axios.get("https://icanhazdadjoke.com/", {
              headers: {Accept: "application/json"}
          });
          let text = res.data.joke;
          if (!this.seenJokes.has(text)) {
            jokes.push({id: uuidv4(), text: res.data.joke, votes: 0});
            this.seenJokes.add(text);
          }
      }
      this.setState({jokes});
      this.setState({loading: false});
      this.saveJokesToLocalStorage();
    }
    catch(e) {
      alert(e);
    }
  }

  saveJokesToLocalStorage() {
    window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes));
  }


  render() {
    return (
        <div className='JokeList'>
          <div className='JokeList-sidebar'>
            <h1 className='JokeList-title'><span>Dad</span> Jokes</h1>
            <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"></img>
            <button className='JokeList-getmore' onClick={() => this.fetchNewJokes()}>New Jokes</button>
          </div>
          {this.state.loading ?
          <div className='JokeList-loading'>
            <div>
              <i className="far fa-8x fa-laugh fa-spin"></i>
              <h1>Loading...</h1>
            </div> 
          </div>
          :
          <div className='JokeList-jokes'>
              {this.state.jokes.map(j => (
                <Joke 
                  key={j.id}
                  votes={j.votes}
                  text={j.text} 
                  upvote={() => this.handleVote(j.id, 1)}
                  downvote={() => this.handleVote(j.id, -1)}
                />
              ))}
          </div>
          }
        </div>
    )
  }
}

export default JokeList;
