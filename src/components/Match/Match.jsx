import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class Match extends Component {
  static propTypes = {
    handleClick: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
  };

  shouldComponentUpdate(nextProps) {
    const { selected } = this.props;

    return selected !== nextProps.selected;
  }

  render() {
    const { handleClick, text, selected } = this.props;

    return (
      <mark
        className={classNames('time-match', 'selectable', {
          'selectable--selected': selected
        })}
        onClick={handleClick}
      >
        {text}
      </mark>
    );
  }
}

export default Match;
