import React, { Component } from 'react';
import { DebounceInput } from 'react-debounce-input';

import './App.css';

const advancedStringReplace = require('string-replace-to-array')

class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			inputText: '',
			minutesData: [],
			minutesSelectedValues: []
		}
	}

	getMinutesData() {
		let { inputText } = this.state
		
		// get match data
		const regexMinuteText = /\d+ minutes/g
		const regexMinuteValues = /\d+(?= minutes)/g
		let minutesMatches = []
		let minutesMatch
		let minutesSelectedValues = []

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

			minutesMatches.push({
				text: minutesMatch[0],
				value: value,
				selected: true
			})

			minutesSelectedValues.push(value)
		}

		this.setState({
			minutesData: minutesMatches,
			minutesSelectedValues: minutesSelectedValues
		})
	}

	getSelectedMinutesValues = (matchData) => {
		// filter through array of match objects if match.selected is true map/add match.value to new array
		let minutesSelectedValues = matchData.filter(match => match.selected === true).map(match => match.value)

		this.setState({ minutesSelectedValues: minutesSelectedValues })
	}

	hightlightMinutes(inputText, minutes) {
		const currentComponent = this

		// get replacedText
		const regexMinuteText = /\d+ minutes/g
		let replacedText
		let matchIndex = -1

		replacedText = advancedStringReplace(
			inputText,
			regexMinuteText,
			(match) => {
				matchIndex++
				// console.log('this: ', this)
				// console.log('matchIndex: ', matchIndex)
				// console.log('handleClick: ', handleClick)
				return (
					<Match
						key={`match${matchIndex}`}
						index={matchIndex}
						text={match}
						selected={minutes[matchIndex].selected}
						handleClick={currentComponent.toggleSelectedStateOfMatch.bind(this, matchIndex)}
					/>)
			}
		)

		return replacedText
	}

	toggleSelectedStateOfMatch(index) {
		// console.log('toggleSelectedStateOfMatch was called')

		// create var for minutes
		let { minutesData } = this.state

		// set target match's selected status to the opposite of what it currently is
		minutesData[index].selected = !minutesData[index].selected
		// console.log('minutes[index].selected: ', minutes[index].selected)

		// set this.state.minutes to local minutes var
		this.setState({ minutesData: minutesData })

		this.getSelectedMinutesValues(minutesData)
	}

	calculateTotalActiveTime(arr) {
		const totalTimeInMin = arr.reduce((a, b) => a + b);
		const hours = Math.trunc(totalTimeInMin / 60)
		const minutes = totalTimeInMin % 60

		console.log(`${hours} hours ${minutes} minutes`)
	}

	componentWillMount() {
		// TODO: should make this more general so we can call it to get hours etc too
		// TODO: also should create another method for highlighting all instances of keywords like "while"
		this.getMinutesData()
	}

	render() {
		console.log('this.state: ', this.state)
		// console.log('this.state.minutesSelectedValues: ', this.state.minutesSelectedValues)
		// let { inputText, minutesData } = this.state

		// const highlightedText = this.hightlightMinutes(inputText, minutesData)
		const highlightedText = unescape(this.state.inputText)

		return (
			<div className="App">
				<div className="content">
					<div className="grid">
						<div className="grid-item">
							<form>
								<DebounceInput
									element="textarea"
									debounceTimeout={1000}
									onChange={event => this.setState({ inputText: escape(event.target.value) })}
								/>
							</form>
							<div className="results">
								total time
							</div>
							<div className="actions">
								<button>Parse Text</button>
								<button onClick={this.calculateTotalActiveTime.bind(this, this.state.minutesSelectedValues)}>Calculate Time</button>
							</div>
						</div>
						<div className="grid-item">
							<div className="parsed-text">
								{highlightedText}
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



