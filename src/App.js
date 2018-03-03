import React, { Component } from 'react';
import { DebounceInput } from 'react-debounce-input';

import './App.css';

const advancedStringReplace = require('string-replace-to-array')

class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			inputText: '',
			matchData: [],
			selectedValues: [],
			highlightedText: '',
		}
	}

	getMatchData(inputText) {	
		const regexMinuteText = /\d+ minutes/g
		const regexMinuteValues = /\d+(?= minutes)/g
		let matchData = []
		let minutesMatch

		// gather match data
		while((minutesMatch = regexMinuteText.exec(inputText)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if(minutesMatch.index === regexMinuteText.lastIndex) {
				regexMinuteText.lastIndex++;
			}

			// get value by matching regex pattern (returns it as an array)
			let value = minutesMatch[0].match(regexMinuteValues)
			// convert value from string in an array to a number
			// Note: I read on StackOverflow that using a + opperator is fastest way to convert a string to a number
			value = +value[0]

			matchData.push({
				text: minutesMatch[0],
				value: value,
				selected: true
			})
		}

		return matchData
	}

	// filter through array of match objects if match.selected is true map/add match.value to new array
	getSelectedValues = matchData => matchData.filter(match => match.selected === true).map(match => match.value)

	highlightText(inputText, matchData) {
		const currentComponent = this
		// const { inputText, matchData } = this.state

		// get replacedText
		const regexMinuteText = /\d+ minutes/g
		let highlightedText
		let matchIndex = -1

		highlightedText = advancedStringReplace(
			inputText,
			regexMinuteText,
			(match) => {
				matchIndex++
				return (
					<Match
						key={`match${matchIndex}`}
						index={matchIndex}
						text={match}
						selected={matchData[matchIndex].selected}
						handleClick={currentComponent.toggleSelectedMatch.bind(this, matchIndex)}
					/>
				)
			}
		)

		return highlightedText
	}

	toggleSelectedMatch(index) {
		console.log('toggleSelectedMatch was called')
		console.log('index: ', index)

		// create var for minutes
		let { matchData } = this.state

		// set target match's selected status to the opposite of what it currently is
		matchData[index].selected = !matchData[index].selected
		// console.log('matchData[index].selected: ', matchData[index].selected)

		// set this.state.minutes to local minutes var
		this.setState({ matchData: matchData })

		this.getSelectedValues(matchData)

		this.updateState(['selectedValues', 'highlightedText'])
	}

	calculateTotalActiveTime(selectedValues) {
		const totalTimeInMin = selectedValues.reduce((a, b) => a + b);
		const hours = Math.trunc(totalTimeInMin / 60)
		const minutes = totalTimeInMin % 60

		console.log(`${hours} hours ${minutes} minutes`)
	}

	updateState(targetKeys) {
		let newState = Object.assign({}, this.state)

		if(targetKeys.includes('matchData')) {
			newState.matchData = this.getMatchData(newState.inputText)
		}
		if(targetKeys.includes('selectedValues')) {
			newState.selectedValues = this.getSelectedValues(newState.matchData)
		}
		if(targetKeys.includes('highlightedText')) {
			newState.highlightedText = this.highlightText(newState.inputText, newState.matchData)
		}

		this.setState(newState)
	}

	render() {
		console.log('this.state: ', this.state)
		// console.log('this.state.matchData: ', this.state.matchData)
		// console.log('this.state.selectedValues: ', this.state.selectedValues)
		const { inputText, highlightedText } = this.state

		// if highlightedText is defined render that otherwise render an unescaped version of inputText
		const displayText = highlightedText.length > 0 ? highlightedText : unescape(inputText)

		return (
			<div className="App">
				<div className="content">
					<div className="grid">
						<div className="grid-item">
							<form>
								<DebounceInput
									element="textarea"
									debounceTimeout={1000}
									onChange={event => this.setState({ inputText: event.target.value, highlightedText: '' })}
								/>
							</form>
							<div className="results">
								total time
							</div>
							<div className="actions">
								<button onClick={this.updateState.bind(this, ['matchData', 'selectedValues', 'highlightedText'])}>Highlight Text</button>
								<button onClick={this.calculateTotalActiveTime.bind(this, this.state.selectedValues)}>Calculate Time</button>
							</div>
						</div>
						<div className="grid-item">
							<div className="parsed-text">
								{displayText}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;



class Match extends Component {
	shouldComponentUpdate(nextProps) {
		return this.props.selected !== nextProps.selected
	}

	render() {
		const { handleClick, text, selected } = this.props

		return (
			<mark className={ selected ? 'selected' : null } onClick={handleClick}>{text}</mark>
		)
	}
}



