
import React from 'react';

import { Button, OverlayTrigger, Popover, FormGroup, Checkbox } from 'react-bootstrap';
import _ from 'lodash';

import './Css/MultiSelect.scss';

const popoverClickRootClose = p => (
	<Popover id="popover-trigger-click-root-close" title="סינון" style={{ maxWidth: 500 }}>
		<form>
			<FormGroup>
				{_.map(p.types.code,
					(type, key) => (
						<Checkbox
							style={{ marginLeft: 10 }}
							inline
							key={key}
							checked={_.get(p.filter.code, key, false)}
							onChange={() => p.setFilterMultiSelect({ code: key })}

						>
							{type}
						</Checkbox>
					)
				)}
			</FormGroup>
		</form>
	</Popover>
);

const MultiSelect = p => (
	<OverlayTrigger trigger="click" rootClose placement="top" overlay={popoverClickRootClose(p)}>
		<Button>סינון</Button>
	</OverlayTrigger>
);

export default MultiSelect;

