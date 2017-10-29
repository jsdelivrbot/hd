
import React from 'react';

import { Flex, Box } from 'reflexbox';
import ReactSimpleRange from 'react-simple-range';
import { Segment } from 'semantic-ui-react';

import './Css/Slider.scss';

const Slider = p => (
	<Flex align="center" justify="center" column w={1}>
		<Box>
			<button style={{ width: '55px' }} type="button" className="btn btn-info" onClick={p.sliderInc}>
				<span className="glyphicon glyphicon-triangle-top" />
			</button>
		</Box>
		<Box mt={22} ml={16}>
			<ReactSimpleRange
				onChange={p.setSlider}
				onChangeComplete={p.setSlider}
				disableTrack
				value={p.slider.value}
				defaultValue={p.slider.value}
				verticalSliderHeight="450px"
				vertical
				sliderSize={55}
				thumbSize={55}
				max={p.slider.max}
				step={12}
			>
				<div className="sslider">
					<Flex align="center" justify="space-around" w={1} py={2}>
						<Box>
							{p.slider.max - p.slider.value}
						</Box>
					</Flex>
				</div>
			</ReactSimpleRange>
		</Box>
		<Box mt={29}>
			<Segment raised textAlign="center">
				{p.slider.max}
			</Segment>
		</Box>
		<Box mt={10}>
			<button style={{ width: '55px' }} type="button" className="btn btn-info" onClick={p.sliderDec}>
				<span className="glyphicon glyphicon-triangle-bottom" />
			</button>
		</Box>
	</Flex>
);

export default Slider;
