import React, { Component } from 'react';
import './App.css';

const advancedStringReplace = require('string-replace-to-array')

class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			inputString: `Heat the oil in a saute pan or pot and cook the pancetta until golden and crisp. Add the chicken pieces, skin-side down if possible, and sear until golden, then turn over and brown the other side. Season with salt and pepper. Splash the chicken with the white wine, and let it sizzle until it's almost all evaporated. Add the garlic, rosemary and tomatoes (crushed in the tin before hand, or break them up with your wooden spoon when in the pan). Cover and cook over moderate heat. Keep an eye on everything for the first 10 minutes, stirring when necessary, then half-cover the pan and continue cooking for a further 45 minutes or until the sauce has become dense and the chicken is tender and starting to pull away from the bone. If the sauce is looking too thick but the chicken not ready, you can add a splash of water and continue cooking. Season to taste. Meanwhile, roast the peppers in a preheated oven (200° C/390° F), turning them once or twice, until soft and charred, about 45 minutes. Remove from oven and immediately tip into a bowl. Cover the hot vegetables with cling film and let them "steam" for about 10 minutes before peeling off the skins. Discard the seeds and stems and then rip or cut the peppers into strips and add to the chicken. Cook a further 5 minutes then let the pan to sit for at least 15 minutes for the flavours to mingle (better an hour, or even overnight in the fridge for the next day). You can serve it at room temperature or reheat it over low until warm.`
		}
	}

	highlightMatches() {
		// move regex matching and set value of this.state.inputString to the replaced version here
	}

	componentWillMount() {
		// call hightlightMatches here
	}

	render() {
		let { inputString } = this.state

		let replacedText
		let matchIndex = 0
		replacedText = advancedStringReplace(
			inputString,
			/\d+ minutes/g,
			(match) => {
				matchIndex++
				return (<Match key={`match${matchIndex}`} text={match} />)
			}
		)

		return (
			<div className="App">
				<div className="App-content">
					{replacedText}
				</div>
			</div>
		);
	}
}

export default App;


class Match extends Component {
	constructor(props) {
		super(props)

		this.state = {
			selected: true
		}
	}

	render() {
		const { text } = this.props

		return (
			<mark>{text}</mark>
		)
	}
}