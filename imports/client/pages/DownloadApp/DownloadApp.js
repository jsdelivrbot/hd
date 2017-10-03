import React from 'react';
import { Row, Col } from 'react-bootstrap';

const DownloadApp = () => (
	<div className="DownloadApp">
		<Row>
			<Col xs={12} sm={6} md={5} lg={4} className="col-lg-offset-4 col-md-offset-4 col-sm-offset-3">
				<Row style={{ height: '100px' }} />
				<Row>
					<img
						style={{ width: '100%' }}
						src="qr.png"
						alt="qr"
					/>
				</Row>
			</Col>
		</Row>
	</div>
);

export default DownloadApp;
