import React, { Component } from 'react';

import classNames from 'classnames';

class Match extends Component {
	shouldComponentUpdate(nextProps) {
		return this.props.selected !== nextProps.selected
	}

	render() {
		const { handleClick, text, selected } = this.props

		return (
			<mark className={classNames('time-match', 'selectable', { 'selectable--selected': selected })} onClick={handleClick}>{text}</mark>
		)
	}
}

export default Match;
