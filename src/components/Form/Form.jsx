import React, { Component } from 'react';
import { DebounceInput } from 'react-debounce-input';

import Match from '../Match/Match';

import classNames from 'classnames';
import stringReplaceToArray from 'string-replace-to-array';

import 'semantic-ui-css/semantic.min.css';

const advancedArrayReplace = (inputArray, regex, classes) => {
	// Note: I had keyPrefix as an argument just before classes, exclude it for now
	let newArray = []

	// for each item in the inputArray
	inputArray.forEach((arrayItem, index) => {
		// check if the type of the current arrayItem is a string, if it is
		if(typeof arrayItem === 'string') {
			// parse it, find any regex matches and replace it with itself wrapped in <mark> tags
			const parsedStringAsArray = stringReplaceToArray(
				arrayItem,
				regex,
				(match) => (<mark className={classes}>{match}</mark>)
			)

			// replace value of newArray with a version of itself with the parsed result concatinated onto the end, need to use .concat here bc the result will be an array
			newArray = newArray.concat(parsedStringAsArray)
		} else {
			// if arrayItem is an object (i.e. already a React element) push it onto the end of the newArray
			newArray.push(arrayItem)
		}
	})

	return newArray
};

class Form extends Component {
	constructor(props) {
		super(props)

		this.state = {
			inputText: `1.<br>To Make the Dough in a Food Processor (recommended): Combine flour, salt, yeast, 0.35 ounce olive oil, and water in the bowl of a food processor fitted with the blade or dough blade attachment. Process until a dough that rides around the blade forms, then continue processing for 30 seconds. Continue with Step 4 below.<br><br>2.<br>To Make the Dough in a Stand Mixer: Combine flour, salt, yeast, and 0.35 ounce olive oil in the bowl of a stand mixer (see below for mixer-free version). Whisk to combine. Fit mixer with dough hook attachment. Add water to mixer and mix on medium speed until dough comes together and no dry flour remains. Increase speed to medium-high and mix until dough is stretchy and smooth, about 6 minutes. The dough should stick to the bottom of bowl, but pull away from the sides. Continue with Step 4 below.<br><br>3.<br>To Make the Dough Using the No-Knead Method: Combine flour, salt, and yeast in a large bowl. Whisk to combine. Add 0.35 ounce olive oil and water and stir by hand until dough comes together and no dry flour remains. Cover bowl tightly with plastic wrap and let rest at room temperature for 12 to 24 hours. Continue with Step 4 below.<br><br>4.<br>Pour remaining 1/4 cup olive oil into a 13- by 18-inch rimmed baking sheet and spread over entire inner surface with your hands. Transfer dough to baking sheet and turn in oil until thoroughly coated. Spread gently with your hands. (It will not stretch to fill the pan; this is fine.) Cover baking sheet with plastic wrap and allow to rise at room temperature until dough has slackened and started to spread out toward the edges of the pan, 2 to 3 hours. Carefully remove plastic wrap from pizza dough. Using oiled hands, and working as gently as possible to maintain air bubbles, push and stretch dough into the corners of the pan by pressing out from the center, lifting each corner, and stretching it beyond the edge of the pan. It should pull back until pan is just filled with dough. Set aside for 20 to 30 minutes while you make the sauce.<br><br>5.<br>For the Sauce: Heat olive oil in a large saucepan over medium heat until shimmering. Add garlic, oregano, and red pepper flakes and cook, stirring, until softened and aromatic, about 1 minute. Add tomatoes. Using a pastry cutter or a potato masher, break up tomatoes into fine chunks. Stir in sugar. Bring to a bare simmer and allow to cook for about 15 minutes to let flavors meld. Season to taste with salt. Set aside and allow to cool slightly.<br><br>6.<br>Thirty minutes before baking, adjust oven rack to lower position and preheat oven to 550°F.<br><br>7.<br>To Assemble and Bake: Spread slices of mozzarella cheese evenly over surface of pizza. Spoon sauce on top of cheese and spread with the back of a spoon. (You will not need all the sauce; use as much as you like, but be sparing.) Spread pepperoni slices evenly over surface. Sprinkle with half of Romano cheese. Transfer to oven and bake until pepperoni is crisp and curled and bottom of pizza is golden brown when you peek by lifting the corner with a thin spatula, about 10 minutes. With some ovens, you may need to loosely tent the top of the pizza with aluminum foil and continue baking until the bottom is golden and crisp.<br><br>8.<br>Remove pizza from oven. Sprinkle with remaining half of Romano cheese, use a pizza wheel to cut it into slices, and serve immediately.`,
			highlightedText: '',
			calculatedTotalTime: '',
			matchData: [],
			selectedValues: [],
			inputTextChanged: false,
			selectedValuesChanged: false
		}
	}

	getMatchData(inputText) {
		const regexText = /(\d+ seconds|\d+ to \d+ seconds|\d+ minutes|\d+ to \d+ minutes|\d+ hours|\d+ to \d+ hours)/gi

		// FYI: currently this regex gets the number closest to " minutes" || " hours"
		const regexValues = /(\d+(?= seconds)|\d+(?= minutes)|\d+(?= hours))/gi
		// Note: I removed /g flag from these regexs bc it causes issues when testing multiple strings back to back
		const regexValueIsInSeconds = /seconds/i
		const regexValueIsInHours = /hours/i

		let matchData = []
		let currentMatch

		// gather match data
		while((currentMatch = regexText.exec(inputText)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if(currentMatch.index === regexText.lastIndex) {
				regexText.lastIndex++;
			}

			// currentMatch[0] would typically equal something like "30 minutes"
			let matchText = currentMatch[0]

			// get value by matching regex pattern (returns it as an array)
			let matchValue = matchText.match(regexValues)
			// convert value from string in an array to a number
			// Note: I read on StackOverflow that using a + opperator is fastest way to convert a string to a number
			matchValue = +matchValue[0]

			// if value is in seconds, convert it into minutes
			if(regexValueIsInSeconds.test(matchText)) {
				matchValue = matchValue / 60
			}
			// if value is in hours, convert it into minutes
			if(regexValueIsInHours.test(matchText)) {
				matchValue = matchValue * 60
			}

			// Note: if time value is more than 3 hours unselect it by default so it gets excluded from any initial time calculations (I expect that things that take longer than 3 hours would be stuff like marinades or things that needs to rest overnight etc)
			matchData.push({
				text: matchText,
				value: matchValue,
				selected: matchValue <= 180 ? true : false
			})
		}

		return matchData
	}

	// filter through array of match objects if match.selected is true add match.value to new array
	getSelectedValues = matchData => matchData.filter(match => match.selected === true).map(match => match.value)

	highlightText(inputText, matchData) {
		const currentComponent = this

		let highlightedText = []

		// Step 1.
		// parse through the input text, find and replace any time related match (i.e. /30 minutes) with an instance of the Match component
		// TODO: rename the match component to something more appropriate like SelectableMatch or TimeMatch
		const regexText = /(\d+ seconds|\d+ to \d+ seconds|\d+ minutes|\d+ to \d+ minutes|\d+ hours|\d+ to \d+ hours)/gi
		let matchIndex = -1

		highlightedText = stringReplaceToArray(
			inputText,
			regexText,
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

		// Step 2.
		// parse the text again, find any keyword matches and highlight it
		const regexKeywords = /(after|before|bring|continue|marinade|set aside|rest|until|while)/gi

		highlightedText = advancedArrayReplace(
			highlightedText,
			regexKeywords,
			'keyword'
		)

		// Step 3.
		// parse the text again, find any almost time matches (i.e. /half hour/) and highlight it
		const regexAlmostTimeMatch = /\b[^\d\W]+\b (minute|hour)(s\b|\b)/gi

		highlightedText = advancedArrayReplace(
			highlightedText,
			regexAlmostTimeMatch,
			'almost-time-match'
		)

		return highlightedText
	}

	toggleSelectedMatch(index) {
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

	calculateTotalTime(selectedValues) {
		const totalTimeInMinutes = selectedValues.reduce((a, b) => a + b);
		const hours = Math.trunc(totalTimeInMinutes / 60)
		const minutes = Math.round(totalTimeInMinutes % 60)
		this.setState({
			calculatedTotalTime: `${hours} hours ${minutes} minutes`,
			selectedValuesChanged: false
		})
	}

	updateState(targetKeys) {
		let newState = Object.assign({}, this.state)

		if(targetKeys.includes('matchData')) {
			newState.matchData = this.getMatchData(newState.inputText)
		}
		if(targetKeys.includes('selectedValues')) {
			newState.selectedValues = this.getSelectedValues(newState.matchData)
			newState.selectedValuesChanged = true
		}
		if(targetKeys.includes('highlightedText')) {
			newState.highlightedText = this.highlightText(newState.inputText, newState.matchData)
			newState.inputTextChanged = false
		}

		this.setState(newState)
	}

	render() {
		console.log('this.state: ', this.state)
		// console.log('this.state.matchData: ', this.state.matchData)
		// console.log('this.state.selectedValues: ', this.state.selectedValues)
		const { inputText, highlightedText, calculatedTotalTime, matchData, inputTextChanged, selectedValuesChanged } = this.state

		// if highlightedText is defined render that otherwise render an unescaped version of inputText
		const rawDisplayText = highlightedText.length > 0 ? highlightedText : unescape(inputText)

		// convert <br>'s in rawDisplayText to actual HTML tags
		let newlineIndex = -1
		const parsedDisplayText = stringReplaceToArray(
			rawDisplayText,
			/<br>/g,
			() => {
				newlineIndex++
				return (<span key={`newline${newlineIndex}`}><br /></span>)
			}
		)

		const renderCalculatedTotalTimeArea = calculatedTotalTime.length > 0 ? (
			<div className="calculated-total-time">
				This recipe should take about: <em>{calculatedTotalTime}</em>
			</div>
		) : null

		const highlightButtonIcon = inputTextChanged ? (<i className="icon sync"></i>) : (<i className="icon edit outline"></i>)

		return (
			<div className="App">
				<div className="content">
					<div className="instructions">
						<div className="instructions__header">
							<h1>Active Time</h1>
							<h2>a tool to find all references to time spent cooking or baking in a recipe and then use that information to calculate that recipe's total active time</h2>
						</div>
						<ol>
							<li>Copy and paste text from a recipe in the textarea on the left.</li>
							<li>Click the "Highlight Text" button.</li>
							<li>Review all of the highlighted times. The fully yellow ones are "selected" and will be included when calculating the total time. If you would like to exclude a specific time match click it so the yellow background appears more transparent. Time matches that are over 3 hours (typically marinades or things that need to rest overnight) are "unselected" by default.</li>
							<li>After you've reviewed all of the highlighted times and made your selections, click the "Calculate Time" button.</li>
						</ol>
					</div>
					<div className="legend">
						<h3>Highlight Colors</h3>
						<ul>
							<li>Yellow - a time match, these are selectable, selecting one means that that amount of time will be included when calculating the total time</li>
							<li>Red - almost a time match, this is text that includes a time related word but it wasn't able to find any numbers, these are not selectable, if you would like one to be selectable so it can be used in calculating the total time edit the input text on the left so it includes numbers (i.e. "30 minutes" instead of "thirty minutes"), click the "Highlight Text" button when you are finished editing</li>
							<li>Green - a time or recipe related keyword, these are not selectable, they are meant to act as helpers as you read the recipe</li>
						</ul>
					</div>
					{renderCalculatedTotalTimeArea}
					<div className="grid">
						<div className="grid-item">
							<div className="ui form input-text">
								<DebounceInput
									element="textarea"
									debounceTimeout={1000}
									onChange={event => this.setState({ inputText: event.target.value.replace(/(?:\r\n|\r|\n)/g, '<br>'), highlightedText: '', inputTextChanged: true })}
								/>
							</div>
							<div className="actions">
								<button
									className={classNames('ui', 'button', { 'positive': inputTextChanged })}
									disabled={inputText.trim().length === 0}
									onClick={this.updateState.bind(this, ['matchData', 'selectedValues', 'highlightedText'])}>
										{highlightButtonIcon}
										Highlight Text
									</button>
								<button
									className={classNames('ui', 'button', { 'positive': selectedValuesChanged })}
									disabled={matchData.length === 0}
									onClick={this.calculateTotalTime.bind(this, this.state.selectedValues)}>
									<i className="icon clock outline"></i>
									Calculate Time
									</button>
							</div>
						</div>
						<div className="grid-item">
							<div className="parsed-display-text">
								{parsedDisplayText}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Form;
