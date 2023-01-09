import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

// function JokeList({ numJokesToGet = 10 }) {
//   const [jokes, setJokes] = useState([]);

class JokeList extends Component {
  static defaultprops = {
    numJokesToGet: 10
  };
  constructor(props) {
    super(props);
    this.state = {
      jokes: []
    };
    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.resetVotes = this.resetVotes.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.vote = this.vote.bind(this);
  }

  componentDidMount(){
    if(this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
  };

  componentDidUpdate(){
    if(this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
  };

  /* get jokes if there are no jokes */

  async getJokes() {
    try{
      let jokes = this.state.jokes;
      let jokeVotes = JSON.parse (
        window.localStorage.getItem("jokeVotes") || "{}"
      );
      let seenJokes = new Set(jokes.map(j => j.id));

      while (jokes.length < this.props.numJokesToGet){
        let response = await axios.get("https://icanhazdadjoke.com", {
          headers: {Accept: "application/json"}
         });
         
         let { status, ...jokes} = response.data;

         if(!seenJokes.has(j.id)){
          seenJokes.add(j.id);
          jokeVotes[j.id] = jokeVotes[j.id] || 0;
          jokes.push({ ...joke, votes: jokeVotes[j.id], locked: false })
         }
      }
      this.setState({ jokes });
      window.localStorage.setItem("jokeVotes", JSON.stringify(jokeVotes));
    } catch (e) {
      return (e);
    }
  }

  // useEffect(function() {
  //   async function getJokes() {
  //     let j = [...jokes];
  //     let seenJokes = new Set();
  //     try {
  //       while (j.length < numJokesToGet) {
  //         let res = await axios.get("https://icanhazdadjoke.com", {
  //           headers: { Accept: "application/json" }
  //         });
  //         let { status, ...jokeObj } = res.data;
  
  //         if (!seenJokes.has(jokeObj.id)) {
  //           seenJokes.add(jokeObj.id);
  //           j.push({ ...jokeObj, votes: 0 });
  //         } else {
  //           console.error("duplicate found!");
  //         }
  //       }
  //       setJokes(j);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }

  //   if (jokes.length === 0) getJokes();
  // }, [jokes, numJokesToGet]);

  /* empty joke list and then call getJokes */

  generateNewJokes(){
    this.setState(stte => ({jokes: stte.jokes.filter(j => j.locked)}));
  }

  resetVotes(){
    window.localStorage.setItem("jokeVotes", "{}");
    this.setState(stte => ({
      jokes: stte.jokes.map(joke => ({...joke, votes: 0 }))
    }));
  }

  // function generateNewJokes() {
  //   setJokes([]);
  // }

  /* change vote for this id by delta (+1 or -1) */

   vote(id, delta) {
    let jokeVotes = JSON.parse(window.localStorage.getItem("jokeVotes"));
    jokeVotes[id] = (jokeVotes[id] || 0) + delta;
    window.localStorage.setItem("jokeVotes", JSON.stringify(jokeVotes));
    this.setState(stte => ({
      jokes: stte.jokes.map(j =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      )
    }));
  }
  // function vote(id, delta) {
  //   setJokes(allJokes =>
  //     allJokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
  //   );
  // }

  /* render: either loading spinner or list of sorted jokes. */
  render() {
    let sortedJokes = [...this.state.jokes].sort((a,b) => b.votes - a.votes);
    let allLocked = sortedJokes.filter(j => j.locked).length === this.props.numJokesToGet;
  

 // if (jokes.length) {
  //   let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
  
    return (
      <div className="JokeList">
        <button
          className="JokeList-getmore"
          onClick={this.generateNewJokes}
          disabled={allLocked}
        >
          Get New Jokes
        </button>
        <button className="JokeList-getmore" onClick={this.resetVotes}>
          Reset Vote Counts
        </button>

        {sortedJokes.map(j => (
          <Joke
            text={j.joke}
            key={j.id}
            id={j.id}
            votes={j.votes}
            vote={this.vote}
            locked={j.locked}
            toggleLock={this.toggleLock}
          />
        ))}

        {sortedJokes.length < this.props.numJokesToGet ? (
          <div className="loading">
            <i className="fas fa-4x fa-spinner fa-spin" />
          </div>
        ) : null}
      </div>
    );
  }
}

  //   return (
  //     <div className="JokeList">
  //       <button className="JokeList-getmore" onClick={generateNewJokes}>
  //         Get New Jokes
  //       </button>
  
  //       {sortedJokes.map(j => (
  //         <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={vote} />
  //       ))}
  //     </div>
  //   );
  // }
  // return null;


export default JokeList;
